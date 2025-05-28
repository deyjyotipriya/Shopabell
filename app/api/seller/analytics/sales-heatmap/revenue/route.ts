import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/app/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAuth(token);
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';

    // Generate sample data based on time range
    const data = generateRevenueData(range);
    const trend = calculateTrend(data);

    return NextResponse.json({
      data,
      trend,
      success: true,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

function generateRevenueData(range: string) {
  const baseRevenue = 15000;
  const growth = 1.15; // 15% growth rate

  switch (range) {
    case 'week':
      return Array.from({ length: 7 }, (_, i) => ({
        month: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        revenue: Math.floor(baseRevenue / 7 * (1 + Math.random() * 0.3)),
        orders: Math.floor(20 + Math.random() * 15),
      }));
    
    case 'month':
      return Array.from({ length: 30 }, (_, i) => ({
        month: `Day ${i + 1}`,
        revenue: Math.floor(baseRevenue / 30 * (1 + Math.random() * 0.3) * Math.pow(growth, i / 30)),
        orders: Math.floor(15 + Math.random() * 10),
      })).filter((_, i) => i % 5 === 0); // Show every 5th day

    case 'year':
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month, i) => ({
        month,
        revenue: Math.floor(baseRevenue * Math.pow(growth, i / 12) * (0.8 + Math.random() * 0.4)),
        orders: Math.floor(100 + Math.random() * 50),
      }));

    default:
      return [];
  }
}

function calculateTrend(data: any[]) {
  if (data.length < 2) return { percentage: 0, isPositive: true };

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.revenue, 0) / secondHalf.length;

  const percentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1);

  return {
    percentage: Math.abs(parseFloat(percentage)),
    isPositive: secondHalfAvg > firstHalfAvg,
  };
}