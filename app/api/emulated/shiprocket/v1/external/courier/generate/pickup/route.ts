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
    const { shipment_id } = body;

    if (!shipment_id) {
      return NextResponse.json(
        { message: 'shipment_id is required' },
        { status: 400 }
      );
    }

    // Handle both single shipment and array of shipments
    const shipmentIds = Array.isArray(shipment_id) ? shipment_id : [shipment_id];
    const pickupDate = body.expected_pickup_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const responses = [];
    const orders = shiprocketEmulator['orders'];

    for (const id of shipmentIds) {
      // Find order by shipment_id
      let foundOrder = null;
      
      for (const [orderId, order] of orders) {
        if (order.shipment_id === id) {
          foundOrder = order;
          break;
        }
      }

      if (foundOrder && foundOrder.awb) {
        const pickup = shiprocketEmulator.schedulePickup(foundOrder.awb, pickupDate);
        if (pickup) {
          responses.push({
            shipment_id: id,
            awb_code: foundOrder.awb,
            courier_company_id: foundOrder.courier_company_id,
            pickup_scheduled: true,
            pickup_id: pickup.pickup_id,
            pickup_date: pickup.pickup_date,
            status: 'Pickup Scheduled'
          });
        }
      } else {
        responses.push({
          shipment_id: id,
          pickup_scheduled: false,
          status: 'Shipment not found or AWB not assigned'
        });
      }
    }

    return NextResponse.json({
      pickup_status: responses.every(r => r.pickup_scheduled) ? 1 : 0,
      response: responses,
      pickup_scheduled_date: pickupDate,
      pickup_token_number: `PT${Date.now()}`,
      message: responses.every(r => r.pickup_scheduled) 
        ? 'Pickup scheduled successfully' 
        : 'Some pickups could not be scheduled'
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}