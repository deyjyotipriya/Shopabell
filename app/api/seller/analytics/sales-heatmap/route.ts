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
    const view = searchParams.get('view') || 'quarter';

    const { heatmap, patterns } = generateSalesHeatmap(view, decoded.userId);

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

function generateSalesHeatmap(view: string, sellerId: string) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysCount = view === 'month' ? 30 : view === 'quarter' ? 90 : 365;
  
  const heatmapData = [];
  const salesByDay: Record<string, number[]> = {
    Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
  };
  
  let totalSales = 0;
  let maxDailySales = 0;
  let bestDaySales = 0;
  let bestDayName = '';

  for (let i = 0; i < daysCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysCount - i - 1));
    
    const dayName = days[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFriday = date.getDay() === 5;
    
    // Simulate higher sales on weekends and Fridays
    let baseSales = 5000;
    if (isWeekend) baseSales *= 1.5;
    if (isFriday) baseSales *= 1.3;
    
    // Add some randomness and seasonal patterns
    const seasonalMultiplier = 1 + Math.sin((i / daysCount) * Math.PI * 2) * 0.3;
    const sales = Math.floor(baseSales * seasonalMultiplier * (0.7 + Math.random() * 0.6));
    const orders = Math.floor(sales / (80 + Math.random() * 40));
    
    totalSales += sales;
    salesByDay[dayName].push(sales);
    
    if (sales > maxDailySales) {
      maxDailySales = sales;
      bestDaySales = sales;
      bestDayName = dayName;
    }

    // Calculate intensity (0-5 scale)
    const intensity = Math.floor((sales / 10000) * 5);

    heatmapData.push({
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      day: dayName,
      week: Math.floor(i / 7),
      sales,
      orders,
      intensity: Math.min(intensity, 5),
    });
  }

  // Calculate patterns
  const avgSalesByDay = Object.entries(salesByDay).map(([day, sales]) => ({
    day,
    avg: sales.length > 0 ? sales.reduce((a, b) => a + b, 0) / sales.length : 0
  })).sort((a, b) => b.avg - a.avg);

  const bestDay = avgSalesByDay[0].day;
  
  // Calculate trend
  const firstHalf = heatmapData.slice(0, Math.floor(heatmapData.length / 2));
  const secondHalf = heatmapData.slice(Math.floor(heatmapData.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.sales, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.sales, 0) / secondHalf.length;
  
  const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100);

  const patterns = {
    bestDay,
    bestTime: '7-10 PM',
    peakSeason: view === 'year' ? 'Q4 (Oct-Dec)' : 'Month End',
    trend: trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    trendPercentage: Math.abs(parseFloat(trendPercentage.toFixed(1))),
  };

  return { heatmap: heatmapData, patterns };
}