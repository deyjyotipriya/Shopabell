import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

interface FraudAlert {
  id: string;
  type: 'suspicious_activity' | 'unusual_pattern' | 'payment_fraud' | 'account_takeover' | 'fake_listing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  sellerId?: string;
  orderId?: string;
  ipAddress?: string;
  details: Record<string, any>;
  actions: {
    type: string;
    label: string;
    performed: boolean;
  }[];
}

// Mock fraud alerts
const mockFraudAlerts: FraudAlert[] = [
  {
    id: '1',
    type: 'payment_fraud',
    severity: 'high',
    status: 'investigating',
    title: 'Multiple Failed Payment Attempts',
    description: 'User attempted 15 failed payments in the last hour with different cards',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user_123',
    ipAddress: '192.168.1.100',
    details: {
      failedAttempts: 15,
      uniqueCards: 8,
      totalAmount: 5600,
      geoLocation: 'Multiple countries detected',
    },
    actions: [
      { type: 'block_user', label: 'Block User', performed: true },
      { type: 'review_transactions', label: 'Review Transactions', performed: false },
      { type: 'contact_user', label: 'Contact User', performed: false },
    ],
  },
  {
    id: '2',
    type: 'unusual_pattern',
    severity: 'medium',
    status: 'new',
    title: 'Abnormal Order Volume Spike',
    description: 'Seller received 50 orders in 5 minutes, all from new accounts',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    sellerId: 'seller_456',
    details: {
      orderCount: 50,
      timeWindow: '5 minutes',
      newAccounts: 50,
      averageOrderValue: 120,
      previousDailyAverage: 5,
    },
    actions: [
      { type: 'pause_orders', label: 'Pause Orders', performed: false },
      { type: 'verify_seller', label: 'Verify Seller', performed: false },
      { type: 'review_listings', label: 'Review Listings', performed: false },
    ],
  },
  {
    id: '3',
    type: 'account_takeover',
    severity: 'critical',
    status: 'resolved',
    title: 'Suspicious Login Activity',
    description: 'Account accessed from unusual location after password change',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userId: 'user_789',
    ipAddress: '45.67.89.10',
    details: {
      previousLocation: 'New York, USA',
      currentLocation: 'Lagos, Nigeria',
      passwordChangedAt: new Date(Date.now() - 90000000).toISOString(),
      suspiciousActivities: ['Changed bank details', 'Attempted large withdrawal'],
    },
    actions: [
      { type: 'lock_account', label: 'Lock Account', performed: true },
      { type: 'reset_password', label: 'Force Password Reset', performed: true },
      { type: 'notify_user', label: 'Notify User', performed: true },
    ],
  },
  {
    id: '4',
    type: 'fake_listing',
    severity: 'medium',
    status: 'investigating',
    title: 'Potentially Counterfeit Products',
    description: 'Multiple reports of fake branded items from seller',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    sellerId: 'seller_101',
    details: {
      reportCount: 8,
      productCategories: ['Electronics', 'Fashion'],
      brandsClaimed: ['Apple', 'Nike', 'Adidas'],
      priceDeviation: '-70% from market average',
    },
    actions: [
      { type: 'remove_listings', label: 'Remove Listings', performed: false },
      { type: 'request_verification', label: 'Request Product Verification', performed: true },
      { type: 'suspend_seller', label: 'Suspend Seller', performed: false },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const timeRange = searchParams.get('timeRange') || '24h';

    let alerts = [...mockFraudAlerts];

    // Filter by status
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Filter by type
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // Filter by time range
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    };

    if (timeRanges[timeRange]) {
      const cutoff = now - timeRanges[timeRange];
      alerts = alerts.filter(alert => 
        new Date(alert.timestamp).getTime() > cutoff
      );
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate statistics
    const stats = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
      },
      byStatus: {
        new: alerts.filter(a => a.status === 'new').length,
        investigating: alerts.filter(a => a.status === 'investigating').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        falsePositive: alerts.filter(a => a.status === 'false_positive').length,
      },
    };

    return NextResponse.json({ 
      data: alerts,
      stats,
      total: alerts.length 
    });
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, action, status } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing alert ID' },
        { status: 400 }
      );
    }

    // In a real app, you would update the database
    if (action) {
      // Perform the specified action
      console.log(`Performing action ${action} on alert ${alertId}`);
      
      return NextResponse.json({ 
        success: true,
        message: `Action ${action} performed successfully`
      });
    }

    if (status) {
      // Update alert status
      console.log(`Updating alert ${alertId} status to ${status}`);
      
      return NextResponse.json({ 
        success: true,
        message: 'Alert status updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating fraud alert:', error);
    return NextResponse.json(
      { error: 'Failed to update fraud alert' },
      { status: 500 }
    );
  }
}