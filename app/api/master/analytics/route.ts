import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get platform metrics
    const [
      { count: totalUsers },
      { count: totalSellers },
      { count: totalProducts },
      { count: totalOrders },
      { data: revenueData }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      supabase.from('orders').select('total_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'delivered')
    ])

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Get growth metrics
    const previousEndDate = new Date(startDate)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - (endDate.getDate() - startDate.getDate()))

    const [
      { count: previousUsers },
      { count: previousOrders },
      { data: previousRevenueData }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString()),
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString()),
      supabase.from('orders').select('total_amount')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString())
        .eq('status', 'delivered')
    ])

    const previousRevenue = previousRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Calculate growth percentages
    const userGrowth = previousUsers ? ((totalUsers! - previousUsers) / previousUsers) * 100 : 0
    const orderGrowth = previousOrders ? ((totalOrders! - previousOrders) / previousOrders) * 100 : 0
    const revenueGrowth = previousRevenue ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Get daily metrics for charts
    const dailyMetrics = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const [
        { count: dayOrders },
        { data: dayRevenueData },
        { count: dayUsers }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString()),
        supabase.from('orders').select('total_amount')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
          .eq('status', 'delivered'),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
      ])

      const dayRevenue = dayRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      dailyMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        orders: dayOrders || 0,
        revenue: dayRevenue,
        users: dayUsers || 0
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Get top sellers
    const { data: topSellers } = await supabase
      .from('orders')
      .select(`
        seller_id,
        total_amount,
        sellers!inner(
          business_name,
          users!inner(
            name
          )
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'delivered')

    const sellerRevenue: Record<string, { name: string, revenue: number }> = {}
    
    topSellers?.forEach(order => {
      const sellerId = order.seller_id
      const sellers = order.sellers as any
      const sellerName = sellers?.business_name || sellers?.users?.name || 'Unknown'
      
      if (!sellerRevenue[sellerId]) {
        sellerRevenue[sellerId] = { name: sellerName, revenue: 0 }
      }
      
      sellerRevenue[sellerId].revenue += order.total_amount || 0
    })

    const topSellersList = Object.entries(sellerRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([id, data]) => ({
        id,
        name: data.name,
        revenue: data.revenue
      }))

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        totalSellers: totalSellers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        userGrowth: userGrowth.toFixed(2),
        orderGrowth: orderGrowth.toFixed(2),
        revenueGrowth: revenueGrowth.toFixed(2)
      },
      dailyMetrics,
      topSellers: topSellersList,
      timeframe
    })
  } catch (error) {
    console.error('Error fetching master analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}