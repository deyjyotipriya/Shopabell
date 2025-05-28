import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

// Mock sellers data
const mockSellers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    facebookGroup: 'Fashion Trends 2024',
    status: 'active',
    totalSales: 125000,
    commission: 6250,
    joinDate: '2024-01-15',
    lastActive: '2024-12-20',
    productsCount: 45,
    ordersCount: 234,
    rating: 4.8,
    storeUrl: 'fashion-trends-2024',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    facebookGroup: 'Home Decor Enthusiasts',
    status: 'verified',
    totalSales: 89000,
    commission: 4450,
    joinDate: '2024-02-20',
    lastActive: '2024-12-19',
    productsCount: 32,
    ordersCount: 156,
    rating: 4.9,
    storeUrl: 'home-decor-enthusiasts',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    facebookGroup: 'Tech Gadgets Daily',
    status: 'pending',
    totalSales: 0,
    commission: 0,
    joinDate: '2024-12-15',
    lastActive: '2024-12-18',
    productsCount: 12,
    ordersCount: 0,
    rating: 0,
    storeUrl: 'tech-gadgets-daily',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1234567892',
    facebookGroup: 'Beauty & Wellness',
    status: 'suspended',
    totalSales: 45000,
    commission: 2250,
    joinDate: '2024-03-10',
    lastActive: '2024-11-30',
    productsCount: 28,
    ordersCount: 89,
    rating: 3.2,
    storeUrl: 'beauty-wellness',
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
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'joinDate';
    const order = searchParams.get('order') || 'desc';

    let filteredSellers = [...mockSellers];

    // Filter by status
    if (status && status !== 'all') {
      filteredSellers = filteredSellers.filter(seller => seller.status === status);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSellers = filteredSellers.filter(seller =>
        seller.name.toLowerCase().includes(searchLower) ||
        seller.email.toLowerCase().includes(searchLower) ||
        seller.facebookGroup.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filteredSellers.sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (order === 'asc') {
        return (aVal || '') > (bVal || '') ? 1 : -1;
      } else {
        return (aVal || '') < (bVal || '') ? 1 : -1;
      }
    });

    return NextResponse.json({ 
      data: filteredSellers,
      total: filteredSellers.length 
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
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
    const { sellerId, action, data } = body;

    if (!sellerId || !action) {
      return NextResponse.json(
        { error: 'Missing sellerId or action' },
        { status: 400 }
      );
    }

    // In a real app, you would update the database here
    switch (action) {
      case 'approve':
        // Update seller status to active
        return NextResponse.json({ 
          success: true, 
          message: 'Seller approved successfully' 
        });
      
      case 'suspend':
        // Update seller status to suspended
        return NextResponse.json({ 
          success: true, 
          message: 'Seller suspended successfully' 
        });
      
      case 'update':
        // Update seller details
        return NextResponse.json({ 
          success: true, 
          message: 'Seller updated successfully' 
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: 'Failed to update seller' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Missing seller ID' },
        { status: 400 }
      );
    }

    // In a real app, you would delete from database
    return NextResponse.json({ 
      success: true, 
      message: 'Seller deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    return NextResponse.json(
      { error: 'Failed to delete seller' },
      { status: 500 }
    );
  }
}