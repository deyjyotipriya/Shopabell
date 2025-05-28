import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Create checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shippingAddress, paymentMethod, sellerId } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Calculate totals and verify prices
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, seller_id, stock')
        .eq('id', item.productId)
        .single();

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        seller_id: product.seller_id,
        total: itemTotal
      });
    }

    // Add shipping cost
    const shippingCost = 70; // Fixed shipping cost as per requirements
    const total = subtotal + shippingCost;

    // Create checkout session
    const sessionId = uuidv4();
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        id: sessionId,
        customer_info: customer,
        shipping_address: shippingAddress,
        items: verifiedItems,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_method: paymentMethod,
        seller_id: sellerId,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // If payment method is UPI, create UPI payment link
    let paymentLink = null;
    if (paymentMethod === 'upi') {
      // Use Decentro emulator to create UPI link
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emulated/decentro/v2/payments/upi/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_id': process.env.DECENTRO_CLIENT_ID!,
          'client_secret': process.env.DECENTRO_CLIENT_SECRET!,
          'provider': process.env.DECENTRO_PROVIDER!
        },
        body: JSON.stringify({
          reference_id: sessionId,
          payee_account: process.env.DECENTRO_PAYEE_ACCOUNT!,
          amount: total,
          purpose_message: `ShopAbell Order ${sessionId.slice(0, 8)}`,
          expiry_time: 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        paymentLink = data.data?.generatedLink;
      }
    }

    return NextResponse.json({
      session: {
        id: sessionId,
        total,
        subtotal,
        shippingCost,
        paymentLink,
        expiresAt: session.expires_at
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}

// Get checkout session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// Process checkout (complete order)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, paymentDetails } = body;

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    // Process payment based on method
    let paymentStatus = 'pending';
    let transactionId = null;

    if (session.payment_method === 'upi') {
      // Verify UPI payment
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emulated/decentro/v2/payments/upi/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client_id': process.env.DECENTRO_CLIENT_ID!,
          'client_secret': process.env.DECENTRO_CLIENT_SECRET!
        },
        body: JSON.stringify({
          reference_id: sessionId,
          upi_id: paymentDetails.upiId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.transactionStatus === 'SUCCESS') {
          paymentStatus = 'completed';
          transactionId = data.data.bankReferenceNumber;
        }
      }
    } else if (session.payment_method === 'cod') {
      paymentStatus = 'pending';
    }

    if (paymentStatus !== 'completed' && session.payment_method !== 'cod') {
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      );
    }

    // Create order
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        seller_id: session.seller_id,
        buyer_info: session.customer_info,
        shipping_address: session.shipping_address,
        items: session.items,
        subtotal: session.subtotal,
        shipping_cost: session.shipping_cost,
        total: session.total,
        payment_method: session.payment_method,
        payment_status: paymentStatus,
        transaction_id: transactionId,
        status: 'confirmed',
        tracking_number: null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Update product stock
    for (const item of session.items) {
      await supabase.rpc('decrement_product_stock', {
        product_id: item.product_id,
        quantity: item.quantity
      });
    }

    // Update session status
    await supabase
      .from('checkout_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    // Send WhatsApp notification to buyer
    if (session.customer_info.phone) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emulated/whatsapp/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
        },
        body: JSON.stringify({
          to: session.customer_info.phone,
          template: {
            name: 'order_confirmation',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: session.customer_info.name },
                  { type: 'text', text: orderId.slice(0, 8) },
                  { type: 'text', text: `₹${session.total}` }
                ]
              }
            ]
          }
        })
      });
    }

    // Create shipping order
    if (paymentStatus === 'completed' || session.payment_method === 'cod') {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/shipping/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    }

    return NextResponse.json({
      orderId,
      order,
      redirectUrl: `/orders/${orderId}/success`
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}