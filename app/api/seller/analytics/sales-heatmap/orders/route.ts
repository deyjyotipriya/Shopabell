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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Generate sample orders
    const allOrders = generateOrders(decoded.userId);
    
    // Filter orders
    let filteredOrders = allOrders;
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    if (search) {
      filteredOrders = filteredOrders.filter(order => 
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const orders = filteredOrders.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredOrders.length / limit);

    return NextResponse.json({
      orders,
      totalPages,
      currentPage: page,
      totalOrders: filteredOrders.length,
      success: true,
    });
  } catch (error) {
    console.error('Orders analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders data' },
      { status: 500 }
    );
  }
}

function generateOrders(sellerId: string) {
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const customers = [
    'Sarah Johnson', 'Michael Chen', 'Emma Davis', 'James Wilson', 'Lisa Anderson',
    'Robert Brown', 'Maria Garcia', 'David Miller', 'Jennifer Martinez', 'William Taylor',
    'Linda Thomas', 'John Jackson', 'Patricia White', 'Christopher Harris', 'Barbara Martin'
  ];
  const paymentMethods = ['Credit Card', 'UPI', 'Net Banking', 'Cash on Delivery', 'Wallet'];

  return Array.from({ length: 50 }, (_, i) => {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `#${4521 - i}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      customerEmail: `customer${i + 1}@example.com`,
      date: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: parseFloat((50 + Math.random() * 450).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      items: Math.floor(1 + Math.random() * 5),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}