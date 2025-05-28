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

    const searchParams = request.nextUrl.searchParams
    const livestreamId = searchParams.get('id')
    const range = searchParams.get('range') || 'realtime'

    if (!livestreamId) {
      // Return overall stats for widget
      const { data: activeLivestream } = await supabase
        .from('livestreams')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'live')
        .order('start_time', { ascending: false })
        .limit(1)
        .single()

      if (!activeLivestream) {
        return NextResponse.json({
          productCount: 0,
          viewerCount: 0,
        })
      }

      return NextResponse.json({
        productCount: activeLivestream.products_captured,
        viewerCount: activeLivestream.viewer_count,
      })
    }

    // Get detailed stats for specific livestream
    const { data: livestream } = await supabase
      .from('livestreams')
      .select(`
        *,
        livestream_analytics (*),
        livestream_products (*)
      `)
      .eq('id', livestreamId)
      .eq('user_id', user.id)
      .single()

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found' },
        { status: 404 }
      )
    }

    // Simulate real-time viewer updates for live streams
    if (livestream.status === 'live') {
      const currentViewers = Math.floor(Math.random() * 50) + livestream.viewer_count
      const peakViewers = Math.max(currentViewers, livestream.peak_viewers)

      const { error: updateError } = await supabase
        .from('livestreams')
        .update({
          viewer_count: currentViewers,
          peak_viewers: peakViewers,
        })
        .eq('id', livestreamId)

      if (updateError) {
        console.error('Failed to update viewer count:', updateError)
      }

      // Update viewer history
      const analytics = livestream.livestream_analytics?.[0]
      if (analytics) {
        const viewerHistory = analytics.viewer_history || []
        viewerHistory.push({
          time: new Date().toLocaleTimeString(),
          viewers: currentViewers,
        })

        // Keep only last 50 data points
        if (viewerHistory.length > 50) {
          viewerHistory.shift()
        }

        const { error: analyticsError } = await supabase
          .from('livestream_analytics')
          .update({
            viewer_history: viewerHistory,
          })
          .eq('livestream_id', livestreamId)

        if (analyticsError) {
          console.error('Failed to update analytics:', analyticsError)
        }
      }
    }

    // Parse analytics data
    const analyticsData = livestream.livestream_analytics?.[0]
    const analytics = analyticsData ? {
      viewerHistory: analyticsData.viewer_history || [],
      engagementHistory: analyticsData.engagement_history || [],
      productCaptures: analyticsData.product_captures || [],
    } : {
      viewerHistory: [],
      engagementHistory: [],
      productCaptures: [],
    }

    // Calculate summary stats
    const avgViewDuration = livestream.start_time
      ? Math.floor((new Date().getTime() - new Date(livestream.start_time).getTime()) / 1000 / 60 / 2) // Mock average
      : 0

    const engagementRate = 12.5 // Mock engagement rate
    const conversionRate = 3.2 // Mock conversion rate

    // Get top products
    const products = livestream.livestream_products || []
    const topProducts = products
      .filter((p: any) => p.status === 'published')
      .slice(0, 5)
      .map((p: any) => ({
        name: p.title,
        views: Math.floor(Math.random() * 1000) + 100,
        sales: Math.floor(Math.random() * 20),
      }))

    // Generate sales data
    const salesData = products
      .filter((p: any) => p.status === 'published')
      .map((p: any) => ({
        product: p.title.substring(0, 20) + '...',
        sales: Math.floor(Math.random() * 10),
        revenue: p.price * Math.floor(Math.random() * 10),
      }))

    return NextResponse.json({
      viewerHistory: analytics.viewerHistory.slice(-20), // Last 20 data points
      engagementHistory: generateEngagementHistory(analytics.viewerHistory.length),
      productCaptures: analytics.productCaptures.slice(-20),
      salesData,
      summary: {
        totalViews: livestream.viewer_count * 10, // Mock total views
        avgViewDuration,
        engagementRate,
        conversionRate,
        topProducts,
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

function generateEngagementHistory(dataPoints: number) {
  const history = []
  for (let i = 0; i < Math.min(dataPoints, 20); i++) {
    history.push({
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString(),
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      shares: Math.floor(Math.random() * 10) + 2,
    })
  }
  return history
}