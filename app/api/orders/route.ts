import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In real app, get buyer ID from authentication
    const buyerId = 'anonymous-123'

    // Mock orders data - replace with database query
    const orders = [
      {
        id: 'order-1',
        storeId: '1',
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
        trackingNumber: '1Z999AA10123456784',
        carrier: 'UPS',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'order-2',
        storeId: '1',
        items: [
          {
            id: '2',
            name: 'Smart Watch Ultra',
            price: 399.99,
            quantity: 1,
            image: '/product2.jpg'
          }
        ],
        subtotal: 399.99,
        shipping: 0,
        tax: 35.00,
        total: 434.99,
        status: 'delivered',
        trackingNumber: '1Z999AA10123456785',
        carrier: 'FedEx',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}