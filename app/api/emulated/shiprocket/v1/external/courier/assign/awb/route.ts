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
    const { shipment_id, courier_id } = body;

    if (!shipment_id || !courier_id) {
      return NextResponse.json(
        { message: 'shipment_id and courier_id are required' },
        { status: 400 }
      );
    }

    // Find order by shipment_id
    const orders = shiprocketEmulator['orders'];
    let orderId = null;
    
    for (const [id, order] of orders) {
      if (order.shipment_id === shipment_id) {
        orderId = id;
        break;
      }
    }

    if (!orderId) {
      return NextResponse.json(
        { message: 'Shipment not found' },
        { status: 404 }
      );
    }

    const awb = shiprocketEmulator.generateAWB(orderId, courier_id);

    if (!awb) {
      return NextResponse.json(
        { message: 'Failed to generate AWB' },
        { status: 500 }
      );
    }

    // Get courier name based on ID
    const courierNames: { [key: string]: string } = {
      '1': 'Bluedart',
      '2': 'Delhivery',
      '3': 'Ecom Express',
      '4': 'DTDC'
    };

    return NextResponse.json({
      response: {
        data: {
          awb_code: awb,
          courier_company_id: courier_id,
          courier_name: courierNames[courier_id] || 'Unknown',
          assigned_date_time: new Date().toISOString(),
          routing_code: `RC${courier_id}${Math.floor(Math.random() * 1000)}`,
          pickup_scheduled_date: null,
          pickup_token_number: null
        }
      },
      awb_assign_status: 1
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}