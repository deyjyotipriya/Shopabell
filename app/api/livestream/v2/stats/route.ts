import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify JWT token
async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const sellerId = await verifyAuth(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, all
    const livestreamId = searchParams.get('livestreamId');

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date('2024-01-01');
        break;
    }

    // Build query
    let query = supabase
      .from('livestreams')
      .select('*')
      .eq('seller_id', sellerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (livestreamId) {
      query = query.eq('id', livestreamId);
    }

    const { data: livestreams, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch livestream stats' },
        { status: 500 }
      );
    }

    // Calculate aggregate stats
    const totalLivestreams = livestreams?.length || 0;
    const totalDuration = livestreams?.reduce((sum, ls) => sum + (ls.duration || 0), 0) || 0;
    const totalProducts = livestreams?.reduce((sum, ls) => sum + (ls.products_captured || 0), 0) || 0;
    const totalOrders = livestreams?.reduce((sum, ls) => sum + (ls.orders_generated || 0), 0) || 0;
    const totalRevenue = livestreams?.reduce((sum, ls) => sum + (ls.gmv_generated || 0), 0) || 0;
    const totalViewers = livestreams?.reduce((sum, ls) => sum + (ls.viewer_count || 0), 0) || 0;

    // Calculate averages
    const avgDuration = totalLivestreams > 0 ? totalDuration / totalLivestreams : 0;
    const avgProducts = totalLivestreams > 0 ? totalProducts / totalLivestreams : 0;
    const avgOrders = totalLivestreams > 0 ? totalOrders / totalLivestreams : 0;
    const avgRevenue = totalLivestreams > 0 ? totalRevenue / totalLivestreams : 0;
    const avgViewers = totalLivestreams > 0 ? totalViewers / totalLivestreams : 0;

    // Get best performing livestream
    const bestLivestream = livestreams?.reduce((best, current) => {
      if (!best || current.gmv_generated > best.gmv_generated) {
        return current;
      }
      return best;
    }, null);

    // Platform breakdown
    const platformStats = livestreams?.reduce((acc: any, ls) => {
      if (!acc[ls.platform]) {
        acc[ls.platform] = {
          count: 0,
          revenue: 0,
          orders: 0,
          products: 0
        };
      }
      acc[ls.platform].count++;
      acc[ls.platform].revenue += ls.gmv_generated || 0;
      acc[ls.platform].orders += ls.orders_generated || 0;
      acc[ls.platform].products += ls.products_captured || 0;
      return acc;
    }, {});

    // Daily stats for chart
    const dailyStats = livestreams?.reduce((acc: any, ls) => {
      const date = new Date(ls.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          livestreams: 0,
          revenue: 0,
          orders: 0,
          viewers: 0
        };
      }
      acc[date].livestreams++;
      acc[date].revenue += ls.gmv_generated || 0;
      acc[date].orders += ls.orders_generated || 0;
      acc[date].viewers += ls.viewer_count || 0;
      return acc;
    }, {});

    const chartData = Object.values(dailyStats || {}).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      period,
      overview: {
        totalLivestreams,
        totalDuration: formatDuration(totalDuration),
        totalProducts,
        totalOrders,
        totalRevenue,
        totalViewers,
        conversionRate: totalViewers > 0 
          ? ((totalOrders / totalViewers) * 100).toFixed(2) + '%' 
          : '0%'
      },
      averages: {
        duration: formatDuration(Math.round(avgDuration)),
        products: Math.round(avgProducts),
        orders: avgOrders.toFixed(1),
        revenue: Math.round(avgRevenue),
        viewers: Math.round(avgViewers)
      },
      bestPerforming: bestLivestream ? {
        id: bestLivestream.id,
        title: bestLivestream.title,
        date: bestLivestream.created_at,
        revenue: bestLivestream.gmv_generated,
        orders: bestLivestream.orders_generated,
        viewers: bestLivestream.viewer_count
      } : null,
      platformBreakdown: platformStats,
      chartData,
      recentLivestreams: livestreams?.slice(0, 5).map(ls => ({
        id: ls.id,
        title: ls.title,
        platform: ls.platform,
        date: ls.created_at,
        duration: formatDuration(ls.duration || 0),
        revenue: ls.gmv_generated,
        orders: ls.orders_generated,
        products: ls.products_captured,
        viewers: ls.viewer_count,
        status: ls.status
      }))
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// POST endpoint to update live stats during stream
export async function POST(request: NextRequest) {
  try {
    const { livestreamId, viewers, event } = await request.json();

    if (!livestreamId) {
      return NextResponse.json(
        { error: 'Livestream ID is required' },
        { status: 400 }
      );
    }

    // Update viewer count
    if (viewers !== undefined) {
      await supabase
        .from('livestreams')
        .update({ 
          viewer_count: viewers,
          updated_at: new Date().toISOString()
        })
        .eq('id', livestreamId);
    }

    // Handle specific events
    if (event) {
      switch (event.type) {
        case 'product_captured':
          await supabase.rpc('increment_livestream_products', {
            p_livestream_id: livestreamId
          });
          break;
          
        case 'order_created':
          await supabase.rpc('increment_livestream_orders', {
            p_livestream_id: livestreamId,
            p_amount: event.amount || 0
          });
          break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update stats error:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}