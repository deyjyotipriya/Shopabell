import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping, isDeliverable } from '@/lib/shipping-calculator';

export async function POST(req: NextRequest) {
  try {
    const { pincode, weight, orderValue, paymentMethod } = await req.json();

    // Validate inputs
    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Check if deliverable
    if (!isDeliverable(pincode)) {
      return NextResponse.json(
        { error: 'Delivery not available for this pincode' },
        { status: 400 }
      );
    }

    // Calculate shipping
    const isCOD = paymentMethod === 'cod';
    const calculation = calculateShipping(
      pincode,
      weight || 0.5,
      orderValue || 0,
      isCOD
    );

    return NextResponse.json({
      success: true,
      data: calculation
    });
  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Check if deliverable
    const deliverable = isDeliverable(pincode);

    if (!deliverable) {
      return NextResponse.json({
        success: false,
        deliverable: false,
        message: 'Delivery not available for this pincode'
      });
    }

    // Get basic shipping info
    const calculation = calculateShipping(pincode, 0.5, 0, false);

    return NextResponse.json({
      success: true,
      deliverable: true,
      zone: calculation.zone,
      estimatedDays: calculation.estimatedDays,
      baseCost: calculation.baseCharge
    });
  } catch (error: any) {
    console.error('Shipping check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check shipping' },
      { status: 500 }
    );
  }
}