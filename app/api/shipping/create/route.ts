import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get seller details for pickup address
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select(`
        business_name,
        pickup_address,
        users!inner(phone)
      `)
      .eq('user_id', order.seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Calculate package dimensions based on items
    let totalWeight = 0.5; // Base weight in kg
    const dimensions = { length: 20, width: 15, height: 10 }; // Default dimensions

    // Create Shiprocket order
    const shiprocketOrder = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: seller.pickup_address?.pincode || '400001',
      channel_id: '',
      comment: 'ShopAbell Order',
      billing_customer_name: order.buyer_info.name,
      billing_last_name: '',
      billing_address: order.shipping_address.address,
      billing_address_2: '',
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.pincode,
      billing_state: order.shipping_address.state,
      billing_country: 'India',
      billing_email: order.buyer_info.email || '',
      billing_phone: order.buyer_info.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.product_name,
        sku: `SKU-${item.product_id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: ''
      })),
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: order.shipping_cost,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.subtotal,
      length: dimensions.length,
      breadth: dimensions.width,
      height: dimensions.height,
      weight: totalWeight
    };

    // Call Shiprocket emulator to create order
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emulated/shiprocket/v1/external/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
      },
      body: JSON.stringify(shiprocketOrder)
    });

    if (!response.ok) {
      throw new Error('Failed to create shipping order');
    }

    const shippingData = await response.json();

    // Update order with shipping details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        shipping_order_id: shippingData.order_id,
        shipment_id: shippingData.shipment_id,
        status: 'processing'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    // Get courier serviceability
    const serviceabilityResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emulated/shiprocket/v1/external/courier/serviceability`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
      }
    });

    let courierData = null;
    if (serviceabilityResponse.ok) {
      const serviceabilityData = await serviceabilityResponse.json();
      courierData = serviceabilityData.data?.available_courier_companies?.[0];
    }

    return NextResponse.json({
      success: true,
      shippingOrderId: shippingData.order_id,
      shipmentId: shippingData.shipment_id,
      courier: courierData,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    });
  } catch (error) {
    console.error('Shipping creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping order' },
      { status: 500 }
    );
  }
}