import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = requireAuth([PERMISSIONS.FULL_ACCESS])(
  async (request: NextRequest & { user: any }) => {
    try {
      // Get platform-wide metrics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Total sellers
      const { count: totalSellers } = await supabase
        .from('sellers')
        .select('*', { count: 'exact', head: true });

      // Active sellers (made sales in last 30 days)
      const { data: activeSellerData } = await supabase
        .from('orders')
        .select('seller_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .neq('status', 'cancelled');
        
      const activeSellers = new Set(activeSellerData?.map(o => o.seller_id)).size;

      // Total revenue and orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount, status')
        .neq('status', 'cancelled');
        
      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalOrders = revenueData?.length || 0;

      // Calculate commission (3% of GMV)
      const totalCommission = totalRevenue * 0.03;

      // Conversion rate (orders / product views - mocked for now)
      const conversionRate = 3.5; // Mock 3.5% conversion

      // Growth metrics
      const { data: lastWeekRevenue } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .neq('status', 'cancelled');
        
      const weeklyRevenue = lastWeekRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Platform health
      const { count: pendingPayouts } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingDisputes } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disputed');

      return NextResponse.json({
        metrics: {
          totalSellers: totalSellers || 0,
          activeSellers,
          totalRevenue,
          totalCommission,
          totalOrders,
          conversionRate,
          weeklyRevenue,
          pendingPayouts: pendingPayouts || 0,
          pendingDisputes: pendingDisputes || 0,
        },
        success: true,
      });
    } catch (error) {
      console.error('Master metrics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch master metrics' },
        { status: 500 }
      );
    }
  }
);