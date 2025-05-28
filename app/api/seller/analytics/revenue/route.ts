import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { getSalesAnalytics, TimeRange } from '@/app/lib/analytics-service';

export const GET = requireAuth([PERMISSIONS.VIEW_ANALYTICS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const period = searchParams.get('period') || 'month';
      
      // Map period to TimeRange
      const timeRange: TimeRange = period === 'week' ? 'week' :
                                  period === 'month' ? 'month' :
                                  period === 'quarter' ? 'quarter' :
                                  period === 'year' ? 'year' : 'month';

      const analytics = await getSalesAnalytics({
        sellerId: request.user.id,
        timeRange,
      });

      return NextResponse.json({
        ...analytics,
        success: true,
      });
    } catch (error) {
      console.error('Revenue analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch revenue analytics' },
        { status: 500 }
      );
    }
  }
);