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

    const inventory = generateInventoryData(decoded.userId);

    return NextResponse.json({
      inventory,
      success: true,
    });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}

function generateInventoryData(sellerId: string) {
  const products = [
    'Wireless Earbuds Pro', 'Smart Watch Series 5', 'Bluetooth Speaker',
    'Face Serum - Vitamin C', 'Moisturizer SPF 30', 'Hair Oil Treatment',
    'Cotton T-Shirt (White)', 'Denim Jeans (Blue)', 'Summer Dress',
    'Kitchen Knife Set', 'Non-stick Pan', 'Food Processor',
    'Yoga Mat', 'Resistance Bands', 'Dumbbells Set'
  ];

  return products.map((product, i) => {
    const salesVelocity = Math.floor(2 + Math.random() * 20);
    const currentStock = Math.floor(Math.random() * 200);
    const lowStockThreshold = 20 + Math.floor(Math.random() * 30);
    const daysUntilStockout = currentStock > 0 ? Math.floor(currentStock / salesVelocity) : 0;
    
    let status: 'critical' | 'low' | 'healthy';
    if (currentStock === 0 || daysUntilStockout < 3) {
      status = 'critical';
    } else if (currentStock < lowStockThreshold || daysUntilStockout < 7) {
      status = 'low';
    } else {
      status = 'healthy';
    }

    const lastRestocked = new Date();
    lastRestocked.setDate(lastRestocked.getDate() - Math.floor(Math.random() * 30));

    return {
      id: `inv_${i + 1}`,
      productName: product,
      sku: `SKU${String(i + 1001).padStart(5, '0')}`,
      currentStock,
      lowStockThreshold,
      status,
      salesVelocity,
      daysUntilStockout,
      lastRestocked: lastRestocked.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    };
  }).sort((a, b) => {
    // Sort by status priority
    const statusPriority = { critical: 0, low: 1, healthy: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });
}