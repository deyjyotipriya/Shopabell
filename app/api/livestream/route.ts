import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: livestreams, error } = await supabase
      .from('livestreams')
      .select(`
        id,
        title,
        platform,
        status,
        start_time,
        end_time,
        viewer_count,
        products_captured,
        total_sales,
        thumbnail
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })

    if (error) {
      throw error
    }

    // Mock data for development if no livestreams exist
    if (livestreams.length === 0 && process.env.NODE_ENV === 'development') {
      return NextResponse.json([
        {
          id: 'mock-1',
          title: 'Summer Collection Launch',
          platform: 'facebook',
          status: 'ended',
          start_time: new Date(Date.now() - 86400000).toISOString(),
          end_time: new Date(Date.now() - 82800000).toISOString(),
          viewer_count: 1250,
          products_captured: 24,
          total_sales: 3450,
          thumbnail: null,
        },
        {
          id: 'mock-2',
          title: 'Flash Sale Friday',
          platform: 'instagram',
          status: 'live',
          start_time: new Date(Date.now() - 3600000).toISOString(),
          end_time: null,
          viewer_count: 856,
          products_captured: 12,
          total_sales: 1280,
          thumbnail: null,
        },
      ])
    }

    return NextResponse.json(livestreams)
  } catch (error) {
    console.error('Failed to fetch livestreams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch livestreams' },
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