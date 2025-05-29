import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    // Verify livestream exists and belongs to user
    const { data: livestream } = await supabase
      .from('livestreams')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'live')
      .single()

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found or already ended' },
        { status: 404 }
      )
    }

    // Update livestream status
    const { error: updateError } = await supabase
      .from('livestreams')
      .update({
        status: 'ended',
        end_time: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    // Auto-publish high confidence products
    const { data: products } = await supabase
      .from('livestream_products')
      .select('*')
      .eq('livestream_id', id)
      .eq('status', 'pending')
      .gte('confidence', 0.8) // Auto-publish products with 80%+ confidence

    if (products && products.length > 0) {
      for (const product of products) {
        // Create actual product in store
        const { error: productError } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            title: product.title,
            description: product.description || '',
            price: product.price,
            images: [product.image],
            category: 'Livestream Products',
            stock: 10, // Default stock
            is_active: true,
            metadata: {
              livestreamId: id,
              capturedAt: product.captured_at,
              confidence: product.confidence,
            },
          })

        if (productError) {
          console.error('Failed to create product:', productError)
          continue
        }

        // Update livestream product status
        const { error: statusError } = await supabase
          .from('livestream_products')
          .update({ status: 'published' })
          .eq('id', product.id)

        if (statusError) {
          console.error('Failed to update product status:', statusError)
        }
      }
    }

    // Generate summary report
    const summary = await generateLivestreamSummary(id)

    return NextResponse.json({
      message: 'Livestream ended successfully',
      summary,
      autoPublished: products?.length || 0,
    })
  } catch (error) {
    console.error('Failed to end livestream:', error)
    return NextResponse.json(
      { error: 'Failed to end livestream' },
      { status: 500 }
    )
  }
}

async function generateLivestreamSummary(livestreamId: string) {
  const { data: livestream } = await supabase
    .from('livestreams')
    .select(`
      *,
      livestream_products (*),
      livestream_analytics (*)
    `)
    .eq('id', livestreamId)
    .single()

  if (!livestream) return null

  const duration = livestream.end_time && livestream.start_time
    ? Math.floor((new Date(livestream.end_time).getTime() - new Date(livestream.start_time).getTime()) / 1000 / 60)
    : 0

  const products = livestream.livestream_products || []
  const publishedProducts = products.filter((p: any) => p.status === 'published').length
  const pendingProducts = products.filter((p: any) => p.status === 'pending').length
  const rejectedProducts = products.filter((p: any) => p.status === 'rejected').length

  return {
    duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
    totalProducts: livestream.products_captured,
    publishedProducts,
    pendingProducts,
    rejectedProducts,
    peakViewers: livestream.peak_viewers,
    totalSales: livestream.total_sales,
    avgConfidence: products.reduce((sum: number, p: any) => sum + p.confidence, 0) / products.length || 0,
  }
}