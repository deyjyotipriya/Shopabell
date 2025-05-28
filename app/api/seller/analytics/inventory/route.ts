import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { getInventoryAnalytics } from '@/app/lib/analytics-service';

export const GET = requireAuth([PERMISSIONS.VIEW_ANALYTICS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const analytics = await getInventoryAnalytics(request.user.id);

      return NextResponse.json({
        ...analytics,
        success: true,
      });
    } catch (error) {
      console.error('Inventory analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory analytics' },
        { status: 500 }
      );
    }
  }
);