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

    const customerData = generateCustomerData(range, decoded.userId);

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    );
  }
}

function generateCustomerData(range: string, sellerId: string) {
  const multiplier = range === 'week' ? 0.25 : range === 'month' ? 1 : 12;
  
  const totalCustomers = Math.floor(500 * multiplier);
  const newCustomers = Math.floor(totalCustomers * 0.3);
  const returningCustomers = totalCustomers - newCustomers;

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
  ];

  const topLocations = locations.slice(0, 5).map((location, i) => {
    const percentage = Math.floor(25 - i * 4 + Math.random() * 3);
    return {
      location,
      customers: Math.floor(totalCustomers * percentage / 100),
      percentage,
    };
  });

  const deviceBreakdown = [
    { device: 'Mobile', value: 65 },
    { device: 'Desktop', value: 25 },
    { device: 'Tablet', value: 10 },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    
    // Simulate realistic shopping patterns
    let purchases = 10;
    if (hour >= 10 && hour <= 12) purchases = 40 + Math.floor(Math.random() * 20);
    else if (hour >= 14 && hour <= 16) purchases = 30 + Math.floor(Math.random() * 15);
    else if (hour >= 19 && hour <= 22) purchases = 50 + Math.floor(Math.random() * 25);
    else if (hour >= 0 && hour <= 6) purchases = 5 + Math.floor(Math.random() * 5);
    else purchases = 15 + Math.floor(Math.random() * 10);

    return {
      hour: displayHour,
      purchases: Math.floor(purchases * multiplier),
    };
  });

  const topProducts = [
    { product: 'Wireless Earbuds', purchases: 145, revenue: 14500 },
    { product: 'Face Serum', purchases: 132, revenue: 9900 },
    { product: 'Smart Watch', purchases: 98, revenue: 29400 },
    { product: 'Cotton T-Shirt', purchases: 87, revenue: 4350 },
    { product: 'Yoga Mat', purchases: 76, revenue: 5700 },
  ].map(p => ({
    ...p,
    purchases: Math.floor(p.purchases * multiplier),
    revenue: Math.floor(p.revenue * multiplier),
  }));

  const segments = [
    { segment: 'VIP Customers', count: Math.floor(totalCustomers * 0.05), revenue: Math.floor(150000 * multiplier) },
    { segment: 'Regular Buyers', count: Math.floor(totalCustomers * 0.25), revenue: Math.floor(350000 * multiplier) },
    { segment: 'Occasional Shoppers', count: Math.floor(totalCustomers * 0.45), revenue: Math.floor(225000 * multiplier) },
    { segment: 'New Customers', count: Math.floor(totalCustomers * 0.25), revenue: Math.floor(75000 * multiplier) },
  ];

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    avgOrderValue: 125.50,
    avgOrdersPerCustomer: 2.3,
    topLocations,
    deviceBreakdown,
    purchaseTimeDistribution: hours,
    topProducts,
    customerSegments: segments,
  };
}