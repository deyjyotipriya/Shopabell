import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DecentroWebhookPayload {
  event_type: 'CREDIT' | 'DEBIT' | 'REVERSAL';
  transaction_id: string;
  virtual_account_number: string;
  amount: number;
  currency: string;
  utr_number: string;
  payer_name?: string;
  payer_vpa?: string;
  payer_account_number?: string;
  payer_ifsc?: string;
  transaction_time: string;
  reference_number: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  mode: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production)
    const signature = request.headers.get('x-decentro-signature');
    const webhookSecret = process.env.DECENTRO_WEBHOOK_SECRET;
    
    // TODO: Implement signature verification
    // if (!verifySignature(signature, webhookSecret, requestBody)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload: DecentroWebhookPayload = await request.json();
    console.log('Decentro Webhook Received:', JSON.stringify(payload, null, 2));

    // Handle credit transactions (incoming payments)
    if (payload.event_type === 'CREDIT' && payload.status === 'SUCCESS') {
      // Find seller by virtual account
      const { data: seller } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('virtual_account', payload.virtual_account_number)
        .single();

      if (!seller) {
        console.error('Seller not found for virtual account:', payload.virtual_account_number);
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }

      // Find pending order by amount (within last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', seller.user_id)
        .eq('total_amount', payload.amount)
        .eq('payment_status', 'pending')
        .gte('created_at', fifteenMinutesAgo)
        .order('created_at', { ascending: false });

      if (orders && orders.length > 0) {
        const order = orders[0];
        
        // Update order payment status
        await supabase
          .from('orders')
          .update({
            payment_status: 'verified',
            payment_reference: payload.utr_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        // Create transaction record
        await supabase
          .from('transactions')
          .insert({
            order_id: order.id,
            transaction_id: payload.transaction_id,
            payment_method: payload.mode,
            amount: payload.amount,
            currency: payload.currency,
            status: 'verified',
            gateway_response: payload,
            utr_number: payload.utr_number,
            payer_vpa: payload.payer_vpa,
            verified_at: new Date().toISOString()
          });

        // Send notification to seller
        await supabase
          .from('notifications')
          .insert({
            user_id: seller.user_id,
            type: 'payment',
            title: 'Payment Received',
            message: `Payment of ₹${payload.amount} received for order #${order.order_number}`,
            metadata: {
              order_id: order.id,
              amount: payload.amount,
              utr: payload.utr_number
            }
          });

        console.log(`Payment verified for order ${order.order_number}`);
      } else {
        console.log('No matching pending order found for amount:', payload.amount);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Decentro webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}