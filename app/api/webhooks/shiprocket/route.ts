import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShiprocketWebhookPayload {
  awb: string;
  shipment_status: string;
  shipment_status_id: number;
  current_status: string;
  courier_name: string;
  etd: string;
  scans: Array<{
    date: string;
    time: string;
    location: string;
    activity: string;
  }>;
  order_id: string;
  shipment_id: string;
}

const STATUS_MAPPING: Record<number, string> = {
  1: 'pending',
  2: 'processing',
  3: 'shipped',
  4: 'in_transit',
  5: 'out_for_delivery',
  6: 'delivered',
  7: 'cancelled',
  8: 'returned',
  9: 'rto_initiated',
  10: 'rto_delivered'
};

export async function POST(request: NextRequest) {
  try {
    const payload: ShiprocketWebhookPayload = await request.json();
    console.log('Shiprocket Webhook Received:', JSON.stringify(payload, null, 2));

    // Get order status from mapping
    const orderStatus = STATUS_MAPPING[payload.shipment_status_id] || 'in_transit';

    // Update order status
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('awb_number', payload.awb)
      .single();

    if (!order) {
      console.error('Order not found for AWB:', payload.awb);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Update shipment tracking
    await supabase
      .from('shipments')
      .update({
        status: payload.current_status,
        tracking_events: payload.scans,
        estimated_delivery: payload.etd,
        updated_at: new Date().toISOString()
      })
      .eq('awb_number', payload.awb);

    // Send notification based on status
    let notificationTitle = '';
    let notificationMessage = '';

    switch (orderStatus) {
      case 'shipped':
        notificationTitle = 'Order Shipped';
        notificationMessage = `Your order #${order.order_number} has been shipped via ${payload.courier_name}`;
        break;
      case 'out_for_delivery':
        notificationTitle = 'Out for Delivery';
        notificationMessage = `Your order #${order.order_number} is out for delivery today`;
        break;
      case 'delivered':
        notificationTitle = 'Order Delivered';
        notificationMessage = `Your order #${order.order_number} has been delivered successfully`;
        break;
      case 'rto_initiated':
        notificationTitle = 'Return Initiated';
        notificationMessage = `Return process has been initiated for order #${order.order_number}`;
        break;
    }

    if (notificationTitle) {
      // Notify buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'shipment',
          title: notificationTitle,
          message: notificationMessage,
          metadata: {
            order_id: order.id,
            awb: payload.awb,
            status: orderStatus
          }
        });

      // Notify seller
      await supabase
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'shipment',
          title: notificationTitle,
          message: notificationMessage,
          metadata: {
            order_id: order.id,
            awb: payload.awb,
            status: orderStatus
          }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}