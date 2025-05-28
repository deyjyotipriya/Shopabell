import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

// Mock data for demonstration
const generateMockStats = () => {
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    overview: {
      totalSellers: 1234,
      activeSellers: 892,
      totalRevenue: 1567890,
      totalCommission: 78394,
      totalOrders: 5678,
      conversionRate: 3.2,
      totalUsers: 45678,
      activeUsers: 12345,
    },
    userGrowth: dates.map((date, i) => ({
      date,
      newUsers: Math.floor(Math.random() * 200) + 50,
      activeUsers: Math.floor(Math.random() * 5000) + 8000,
      totalUsers: 45678 - (29 - i) * 1500 + Math.floor(Math.random() * 500),
    })),
    userSummary: {
      totalUsers: 45678,
      newUsersToday: 234,
      activeUsersToday: 12345,
      growthRate: 5.2,
      churnRate: 2.1,
    },
    revenueData: dates.map((date) => ({
      date,
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 200) + 100,
      commission: Math.floor(Math.random() * 2500) + 1500,
    })),
    paymentSummary: {
      totalProcessed: 2456789,
      totalPending: 45678,
      totalFailed: 12345,
      totalCommission: 78394,
      todayVolume: 67890,
      weeklyVolume: 456789,
    },
    systemHealth: {
      uptime: 99.9,
      responseTime: 123,
      errorRate: 0.1,
      activeConnections: 234,
      queueSize: 12,
      cpuUsage: 45,
      memoryUsage: 67,
    },
    fraudAlerts: [
      {
        id: '1',
        type: 'suspicious_activity',
        severity: 'high',
        message: 'Multiple failed payment attempts from IP 192.168.1.1',
        timestamp: new Date().toISOString(),
        userId: 'user123',
      },
      {
        id: '2',
        type: 'unusual_pattern',
        severity: 'medium',
        message: 'Unusual order volume spike detected for seller456',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sellerId: 'seller456',
      },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    // In a real app, you'd check the user's role from the database
    // For now, we'll assume all authenticated users can access admin stats

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const stats = generateMockStats();

    // Return specific stats based on type parameter
    switch (type) {
      case 'overview':
        return NextResponse.json({ data: stats.overview });
      case 'userGrowth':
        return NextResponse.json({ 
          data: stats.userGrowth,
          summary: stats.userSummary 
        });
      case 'revenue':
        return NextResponse.json({ data: stats.revenueData });
      case 'payments':
        return NextResponse.json({ 
          summary: stats.paymentSummary,
          transactions: [] // Would fetch from database
        });
      case 'system':
        return NextResponse.json({ data: stats.systemHealth });
      case 'fraud':
        return NextResponse.json({ data: stats.fraudAlerts });
      default:
        // Return all stats
        return NextResponse.json({ data: stats });
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}