import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { getSalesHeatmap, TimeRange } from '@/app/lib/analytics-service';

export const GET = requireAuth([PERMISSIONS.VIEW_ANALYTICS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const view = searchParams.get('view') || 'quarter';
      
      // Map view to TimeRange
      const timeRange: TimeRange = view === 'month' ? 'month' : 
                                  view === 'quarter' ? 'quarter' : 
                                  view === 'year' ? 'year' : 'quarter';

      const { heatmap, patterns } = await getSalesHeatmap(request.user.id, timeRange);

      return NextResponse.json({
        heatmap,
        patterns,
        success: true,
      });
    } catch (error) {
      console.error('Sales heatmap error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales heatmap data' },
        { status: 500 }
      );
    }
  }
);

