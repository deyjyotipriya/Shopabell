import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/app/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')

    let query = supabase
      .from('transactions')
      .select(`
        *,
        orders (
          order_number,
          total_amount,
          buyer:users!buyer_id (
            name,
            email
          )
        )
      `)

    // Filter by order if specified
    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status)
    }

    // Filter by user role
    const { data: seller } = await supabase
      .from('sellers')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (seller) {
      // Seller: show their transactions
      const { data: sellerOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('seller_id', user.id)

      const orderIds = sellerOrders?.map(o => o.id) || []
      query = query.in('order_id', orderIds.length > 0 ? orderIds : [''])
    } else {
      // Buyer: show their transactions
      const { data: buyerOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)

      const orderIds = buyerOrders?.map(o => o.id) || []
      query = query.in('order_id', orderIds.length > 0 ? orderIds : [''])
    }

    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, amount, paymentMethod } = await request.json()

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify order exists and belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single()

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
        transaction_type: 'payment',
        metadata: {
          initiatedBy: user.id,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) throw error

    // In production, this would integrate with actual payment gateway
    // For now, we'll simulate payment processing
    setTimeout(async () => {
      await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', orderId)
    }, 2000)

    return NextResponse.json({ 
      transaction,
      message: 'Payment initiated successfully'
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}