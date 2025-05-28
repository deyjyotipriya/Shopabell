import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import DecentroEmulator from '@/app/lib/decentro-emulator';
import { ShiprocketEmulator } from '@/app/lib/shiprocket-emulator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface CreateOrderRequest {
  sellerId: string;
  buyerId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'upi' | 'bank_transfer' | 'card' | 'cod';
  couponCode?: string;
  notes?: string;
}

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `ORD${year}${month}${day}${random}`;
}

// Calculate order totals
function calculateOrderTotals(
  items: OrderItem[],
  shippingCharge: number = 70,
  isCOD: boolean = false
) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const codCharge = isCOD ? Math.round(subtotal * 0.02) : 0; // 2% COD charge
  const platformFee = Math.round(subtotal * 0.03); // 3% platform fee
  const total = subtotal + shippingCharge + codCharge;
  
  return {
    subtotal,
    shippingCharge,
    codCharge,
    platformFee,
    total
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!data.sellerId || !data.buyerId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify seller exists
    const { data: seller } = await supabase
      .from('sellers')
      .select('user_id, business_name, virtual_account')
      .eq('user_id', data.sellerId)
      .single();

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const totals = calculateOrderTotals(
      data.items,
      parseInt(process.env.DEFAULT_SHIPPING_CHARGE || '70'),
      data.paymentMethod === 'cod'
    );

    // Create order
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        seller_id: data.sellerId,
        buyer_id: data.buyerId,
        items: data.items.map(item => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        subtotal: totals.subtotal,
        shipping_charge: totals.shippingCharge,
        cod_charge: totals.codCharge,
        discount: 0,
        total_amount: totals.total,
        payment_method: data.paymentMethod,
        payment_status: data.paymentMethod === 'cod' ? 'pending' : 'pending',
        shipping_address: data.shippingAddress,
        billing_address: data.billingAddress || data.shippingAddress,
        status: 'pending',
        notes: data.notes
      });

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Update product stock
    for (const item of data.items) {
      await supabase.rpc('decrement_product_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity
      });
    }

    // Generate payment link if not COD
    let paymentLink = null;
    if (data.paymentMethod !== 'cod') {
      const decentroEmulator = DecentroEmulator.getInstance();
      paymentLink = await decentroEmulator.generatePaymentLink({
        amount: totals.total,
        purpose: `Order ${orderNumber}`,
        customer_id: data.buyerId,
        expires_in: 15 // 15 minutes
      });
    }

    // Create notifications
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: data.sellerId,
          type: 'order',
          title: 'New Order Received!',
          message: `You have a new order #${orderNumber} worth ₹${totals.total}`,
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
            amount: totals.total
          }
        },
        {
          user_id: data.buyerId,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order #${orderNumber} has been confirmed and will be shipped soon.`,
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
            amount: totals.total
          }
        }
      ]);

    // Send WhatsApp notification
    const { whatsappEmulator } = await import('@/app/lib/whatsapp-emulator');
    
    // Get buyer phone
    const { data: buyer } = await supabase
      .from('users')
      .select('phone')
      .eq('id', data.buyerId)
      .single();

    if (buyer?.phone) {
      await whatsappEmulator.sendMessage({
        from: '15550555555',
        to: buyer.phone,
        type: 'template',
        template: {
          name: 'order_confirmation',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: orderNumber },
                { type: 'text', text: totals.total.toString() },
                { type: 'text', text: seller.business_name }
              ]
            }
          ]
        }
      });
    }

    // Schedule shipping if not COD or once payment is verified
    if (data.paymentMethod === 'cod') {
      // For COD, create shipment immediately
      const shiprocketEmulator = new ShiprocketEmulator();
      const shipment = shiprocketEmulator.createOrder({
        order_id: orderNumber,
        order_date: new Date().toISOString(),
        billing_customer_name: data.shippingAddress.fullName,
        billing_phone: data.shippingAddress.phone,
        billing_address: data.shippingAddress.addressLine1,
        billing_city: data.shippingAddress.city,
        billing_pincode: data.shippingAddress.pincode,
        billing_state: data.shippingAddress.state,
        billing_country: data.shippingAddress.country || 'India',
        billing_email: `${data.buyerId}@shopabell.com`,
        shipping_is_billing: true,
        order_items: data.items.map(item => ({
          name: item.name,
          sku: item.productId,
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: ''
        })),
        payment_method: 'COD',
        sub_total: totals.subtotal,
        length: 15,
        breadth: 15,
        height: 10,
        weight: 0.5
      });

      // Update order with shipment details
      await supabase
        .from('shipments')
        .insert({
          order_id: orderId,
          shipment_id: shipment.shipment_id!,
          courier_name: 'To be assigned',
          charged_cost: totals.shippingCharge,
          actual_cost: parseInt(process.env.ACTUAL_SHIPPING_COST || '45'),
          profit: totals.shippingCharge - parseInt(process.env.ACTUAL_SHIPPING_COST || '45'),
          status: 'pending'
        });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        total: totals.total,
        status: 'pending',
        paymentLink: paymentLink ? {
          url: paymentLink.upiLink,
          qrCode: paymentLink.qrCode,
          expiresAt: paymentLink.expiresAt
        } : null,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to calculate shipping rates
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pincode = searchParams.get('pincode');
  const weight = parseFloat(searchParams.get('weight') || '0.5');
  const cod = searchParams.get('cod') === 'true';

  if (!pincode) {
    return NextResponse.json(
      { error: 'Pincode is required' },
      { status: 400 }
    );
  }

  const shiprocketEmulator = new ShiprocketEmulator();
  const rates = shiprocketEmulator.calculateRates(
    '110001', // Default pickup pincode
    pincode,
    weight,
    cod
  );

  return NextResponse.json({
    rates: rates.map(rate => ({
      courier: rate.courier_name,
      charge: parseInt(process.env.DEFAULT_SHIPPING_CHARGE || '70'), // Fixed rate for sellers
      estimatedDays: rate.estimated_delivery_days,
      cod: rate.cod
    })),
    note: 'Shipping charges are fixed at ₹70 for all locations'
  });
}