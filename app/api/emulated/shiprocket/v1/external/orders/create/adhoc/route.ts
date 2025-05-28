import { NextRequest, NextResponse } from 'next/server';
import { shiprocketEmulator } from '@/app/lib/shiprocket-emulator';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token || !shiprocketEmulator.validateToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'order_id', 'order_date', 'billing_customer_name', 
      'billing_address', 'billing_city', 'billing_pincode',
      'billing_state', 'billing_email', 'billing_phone',
      'order_items', 'payment_method', 'sub_total', 'weight'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate order items
    if (!Array.isArray(body.order_items) || body.order_items.length === 0) {
      return NextResponse.json(
        { message: 'order_items must be a non-empty array' },
        { status: 400 }
      );
    }

    for (const item of body.order_items) {
      if (!item.name || !item.sku || !item.units || !item.selling_price) {
        return NextResponse.json(
          { message: 'Each order item must have name, sku, units, and selling_price' },
          { status: 400 }
        );
      }
    }

    const order = shiprocketEmulator.createOrder(body);

    return NextResponse.json({
      order_id: order.order_id,
      shipment_id: order.shipment_id,
      status: 'NEW',
      status_code: 1,
      onboarding_completed_now: false,
      awb_code: null,
      courier_company_id: null,
      courier_name: null
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}