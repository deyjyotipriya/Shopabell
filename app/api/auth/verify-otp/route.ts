import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/app/lib/auth';
import { generateTokens } from '@/app/lib/auth-service';
import type { User } from '@/app/lib/auth-service';

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  userType?: 'seller' | 'buyer';
}

export async function POST(request: NextRequest) {
  console.log('=== VERIFY OTP ENDPOINT CALLED ===');
  
  try {
    console.log('1. Parsing request body...');
    const body: VerifyOTPRequest = await request.json();
    console.log('Request body:', body);
    
    const { phone, otp, userType = 'buyer' } = body;

    console.log('2. Validating input...');
    // Validate input
    if (!phone || typeof phone !== 'string') {
      console.log('Phone validation failed');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      console.log('OTP validation failed');
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    console.log('3. Verifying OTP...');
    // Verify OTP
    console.log(`Verifying OTP for phone: ${phone}, otp: ${otp}`);
    const isValid = verifyOTP(phone, otp);
    console.log(`OTP verification result: ${isValid}`);
    
    if (!isValid) {
      console.log('OTP verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    console.log('4. OTP verified successfully');

    // For demo - create a demo user and generate proper JWT tokens
    console.log('5. Creating demo user and generating tokens...');
    
    const demoUser: User = {
      id: 'demo-user-id',
      phone: phone,
      name: 'Demo User',
      email: undefined,
      role: phone === '9999999999' ? 'admin' : 'seller',
      status: 'active',
      permissions: [], // Will be set by generateTokens based on role
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Generate proper JWT tokens for middleware compatibility
    const tokens = generateTokens(demoUser);
    console.log('Generated tokens:', { accessToken: tokens.accessToken.substring(0, 20) + '...', expiresIn: tokens.expiresIn });
    
    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        phone: demoUser.phone,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        isOnboarded: false,
        createdAt: demoUser.createdAt,
        updatedAt: demoUser.updatedAt
      },
      tokens
    });

  } catch (error: any) {
    console.error('=== VERIFY OTP ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to verify OTP',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}