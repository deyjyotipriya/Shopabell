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
    const { title, description, platform, streamUrl, streamKey } = body

    // Create a new livestream session
    const { data: livestream, error } = await supabase
      .from('livestreams')
      .insert({
        user_id: user.id,
        title,
        description,
        platform,
        stream_url: streamUrl,
        stream_key: streamKey,
        status: 'live',
        start_time: new Date().toISOString(),
        viewer_count: 0,
        peak_viewers: 0,
        products_captured: 0,
        total_sales: 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Initialize livestream analytics
    const { error: analyticsError } = await supabase
      .from('livestream_analytics')
      .insert({
        livestream_id: livestream.id,
        viewer_history: [{ time: new Date().toISOString(), viewers: 0 }],
        engagement_history: [{ time: new Date().toISOString(), likes: 0, comments: 0, shares: 0 }],
        product_captures: [],
      })

    if (analyticsError) {
      console.error('Failed to create analytics:', analyticsError)
    }

    return NextResponse.json({
      id: livestream.id,
      message: 'Livestream started successfully',
    })
  } catch (error) {
    console.error('Failed to start livestream:', error)
    return NextResponse.json(
      { error: 'Failed to start livestream' },
      { status: 500 }
    )
  }
}