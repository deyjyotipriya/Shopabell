import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    // Mock session data - replace with database query
    const session = {
      id: sessionId,
      chatId: 'chat-123',
      storeId: '1',
      items: [{
        id: '1',
        name: 'Wireless Earbuds Pro',
        price: 199.99,
        quantity: 1,
        image: '/product1.jpg'
      }],
      subtotal: 199.99,
      shipping: 9.99,
      tax: 17.50,
      total: 227.48,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}