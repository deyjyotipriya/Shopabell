import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = requireAuth([PERMISSIONS.VIEW_ANALYTICS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const period = searchParams.get('period') || '7d';
      const status = searchParams.get('status');
      
      // Calculate date range
      let dateFrom = new Date();
      switch (period) {
        case '24h':
          dateFrom.setDate(dateFrom.getDate() - 1);
          break;
        case '7d':
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case '30d':
          dateFrom.setDate(dateFrom.getDate() - 30);
          break;
        case '90d':
          dateFrom.setDate(dateFrom.getDate() - 90);
          break;
        default:
          dateFrom.setDate(dateFrom.getDate() - 7);
      }
      
      // Build query
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(id, phone, name)
        `)
        .eq('seller_id', request.user.id)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false });
        
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data: orders, error } = await query;
      
      if (error) throw error;
      
      // Calculate summary statistics
      const stats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        shipped: orders?.filter(o => o.status === 'shipped').length || 0,
        delivered: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        totalRevenue: orders?.reduce((sum, o) => 
          o.status !== 'cancelled' ? sum + o.total_amount : sum, 0) || 0,
      };

      return NextResponse.json({
        orders: orders || [],
        stats,
        success: true,
      });
    } catch (error) {
      console.error('Orders analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders analytics' },
        { status: 500 }
      );
    }
  }
);