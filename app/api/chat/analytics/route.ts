import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Get chat analytics for sellers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      )
    }

    // Get total chat count
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    // Get active chat count
    const { count: activeChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('status', 'active')

    // Get messages statistics
    const { data: messages } = await supabase
      .from('messages')
      .select('id, sender_id, created_at')
      .in('chat_id', 
        supabase
          .from('chats')
          .select('id')
          .eq('seller_id', sellerId)
      )
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const totalMessages = messages?.length || 0
    const sellerMessages = messages?.filter(m => m.sender_id === sellerId).length || 0
    const buyerMessages = totalMessages - sellerMessages

    // Calculate average response time
    const { data: responseTimes } = await supabase
      .rpc('calculate_avg_response_time', { 
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate
      })
      .single()

    const avgResponseTime = responseTimes?.avg_response_time || 0

    // Get conversion metrics
    const { data: conversions } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('seller_id', sellerId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('id',
        supabase
          .from('messages')
          .select('metadata->sellCommand->sessionId')
          .not('metadata->sellCommand', 'is', null)
      )

    const conversionRate = totalChats > 0 ? (conversions?.length || 0) / totalChats * 100 : 0
    const totalRevenue = conversions?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Get chat distribution by hour
    const hourlyDistribution = Array(24).fill(0)
    messages?.forEach(msg => {
      const hour = new Date(msg.created_at).getHours()
      hourlyDistribution[hour]++
    })

    // Get top products discussed
    const { data: productChats } = await supabase
      .from('chats')
      .select(`
        product_id,
        product:products!product_id (
          name,
          price
        )
      `)
      .eq('seller_id', sellerId)
      .not('product_id', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const productCounts: Record<string, { name: string; count: number }> = {}
    productChats?.forEach(chat => {
      if (chat.product_id && chat.product) {
        if (!productCounts[chat.product_id]) {
          productCounts[chat.product_id] = {
            name: chat.product.name,
            count: 0
          }
        }
        productCounts[chat.product_id].count++
      }
    })

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count
      }))

    return NextResponse.json({
      overview: {
        totalChats: totalChats || 0,
        activeChats: activeChats || 0,
        totalMessages: totalMessages,
        sellerMessages,
        buyerMessages,
        avgResponseTime: Math.round(avgResponseTime),
        conversionRate: conversionRate.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2)
      },
      hourlyDistribution,
      topProducts,
      period: {
        startDate,
        endDate
      }
    })
  } catch (error) {
    console.error('Error fetching chat analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}