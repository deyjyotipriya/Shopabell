import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId

    // Mock order data - replace with database query
    const order = {
      id: orderId,
      storeId: '1',
      buyerEmail: 'john.doe@example.com',
      buyerName: 'John Doe',
      buyerPhone: '+1 (555) 123-4567',
      items: [
        {
          id: '1',
          name: 'Wireless Earbuds Pro',
          price: 199.99,
          quantity: 1,
          image: '/product1.jpg'
        }
      ],
      subtotal: 199.99,
      shipping: 9.99,
      tax: 17.50,
      total: 227.48,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        pincode: '94105',
        country: 'United States'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}