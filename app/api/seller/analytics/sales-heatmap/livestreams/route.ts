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
    const range = searchParams.get('range') || 'week';

    const livestreams = generateLivestreamData(range, decoded.userId);

    return NextResponse.json({
      livestreams,
      success: true,
    });
  } catch (error) {
    console.error('Livestream analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch livestream data' },
      { status: 500 }
    );
  }
}

function generateLivestreamData(range: string, sellerId: string) {
  const titles = [
    'Spring Fashion Collection',
    'Beauty Essentials Tutorial',
    'Tech Gadgets Showcase',
    'Home Decor Ideas',
    'Summer Sale Special',
    'New Arrivals Preview',
    'Skincare Routine Demo',
    'Kitchen Appliances Review',
    'Fitness Equipment Demo',
    'Holiday Gift Guide'
  ];

  const count = range === 'week' ? 3 : range === 'month' ? 8 : 20;
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i * (range === 'week' ? 2 : range === 'month' ? 4 : 15)));
    
    const viewers = Math.floor(1000 + Math.random() * 3000);
    const peakViewers = Math.floor(viewers * (1.2 + Math.random() * 0.3));
    const duration = Math.floor(30 + Math.random() * 120);
    const conversionRate = 2 + Math.random() * 8;
    const sales = Math.floor(viewers * conversionRate / 100);
    const revenue = sales * (50 + Math.random() * 150);

    return {
      id: `ls_${Date.now()}_${i}`,
      title: titles[i % titles.length],
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      viewers,
      peakViewers,
      sales,
      revenue: Math.floor(revenue),
      duration: formatDuration(duration),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      engagementRate: parseFloat((15 + Math.random() * 35).toFixed(1)),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}