import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: livestream } = await supabase
      .from('livestreams')
      .select(`
        *,
        livestream_products (*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (livestream && livestream.livestream_products) {
      // Sort products by captured_at
      livestream.livestream_products.sort((a: any, b: any) => 
        new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
      )
    }

    if (!livestream) {
      // Return mock data for development
      if (params.id.startsWith('mock-') && process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          id: params.id,
          title: params.id === 'mock-1' ? 'Summer Collection Launch' : 'Flash Sale Friday',
          description: 'Amazing products showcased live!',
          platform: params.id === 'mock-1' ? 'facebook' : 'instagram',
          status: params.id === 'mock-1' ? 'ended' : 'live',
          start_time: new Date(Date.now() - (params.id === 'mock-1' ? 86400000 : 3600000)).toISOString(),
          end_time: params.id === 'mock-1' ? new Date(Date.now() - 82800000).toISOString() : null,
          viewer_count: params.id === 'mock-1' ? 1250 : 856,
          peak_viewers: params.id === 'mock-1' ? 1580 : 920,
          products_captured: params.id === 'mock-1' ? 24 : 12,
          total_sales: params.id === 'mock-1' ? 3450 : 1280,
          stream_url: `https://www.${params.id === 'mock-1' ? 'facebook' : 'instagram'}.com/live/example`,
          products: generateMockProducts(params.id === 'mock-1' ? 24 : 12),
        })
      }
      
      return NextResponse.json(
        { error: 'Livestream not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(livestream)
  } catch (error) {
    console.error('Failed to fetch livestream details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch livestream details' },
      { status: 500 }
    )
  }
}

function generateMockProducts(count: number) {
  const products = []
  const statuses = ['pending', 'published', 'rejected']
  
  for (let i = 0; i < count; i++) {
    products.push({
      id: `product-${i}`,
      title: `Product ${i + 1}`,
      price: Math.floor(Math.random() * 100) + 19.99,
      image: `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/>
          <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="24">Product ${i + 1}</text>
        </svg>
      `)}`,
      captured_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      confidence: Math.random() * 0.3 + 0.7,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    })
  }
  
  return products
}