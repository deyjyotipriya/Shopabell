import { NextRequest, NextResponse } from 'next/server';
import { shiprocketEmulator } from '@/app/lib/shiprocket-emulator';

export async function GET(
  request: NextRequest,
  { params }: { params: { awb: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token || !shiprocketEmulator.validateToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { awb } = params;
    
    if (!awb) {
      return NextResponse.json(
        { message: 'AWB number is required' },
        { status: 400 }
      );
    }

    const trackingData = shiprocketEmulator.trackShipment(awb);

    if (!trackingData) {
      return NextResponse.json(
        { message: 'AWB not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trackingData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}