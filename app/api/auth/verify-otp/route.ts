import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, createOrUpdateUser, generateAccessToken, generateRefreshToken } from '@/app/lib/auth';

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  userType?: 'seller' | 'buyer';
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();
    const { phone, otp, userType = 'buyer' } = body;

    // Validate input
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

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

    // Create or update user
    const user = await createOrUpdateUser(phone, userType);
    console.log('User created/found:', user);
    
    // Determine user role (simplified)
    let role = 'buyer';
    let isOnboarded = false;
    
    // Check for admin/master roles (based on phone number)
    if (phone === '9999999999' || phone === '+919999999999') {
      role = 'admin';
    } else if (phone === '8888888888' || phone === '+918888888888') {
      role = 'master';
    } else if (userType === 'seller' || user.type === 'seller') {
      role = 'seller';
      // For now, assume not onboarded
      isOnboarded = false;
    }

    // Generate simple tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone,
      userType: role as any
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      phone: user.phone,
      userType: role as any
    });

    // Return user data and tokens
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role,
        isOnboarded,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes
      }
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to verify OTP',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}