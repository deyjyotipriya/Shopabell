import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/app/lib/auth';

interface SendOTPRequest {
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequest = await request.json();
    const { phone } = body;

    // Validate phone number
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Basic phone number validation (you can enhance this)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP
    storeOTP(phone, otp);

    // In production, send OTP via SMS service
    // For development, log OTP (remove in production!)
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production!
      debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}