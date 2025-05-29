import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, createOrUpdateUser } from '@/app/lib/auth';
import { 
  generateTokens, 
  setAuthCookies, 
  updateLastLogin,
  UserRole 
} from '@/app/lib/auth-service';
import { getSeller } from '@/app/lib/database';

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
    
    // Determine user role
    let role: UserRole = 'buyer';
    let isOnboarded = false;
    
    // Check for admin/master roles (based on phone number for now)
    if (phone === '9999999999' || phone === '+919999999999') {
      role = 'admin';
    } else if (phone === '8888888888' || phone === '+918888888888') {
      role = 'master';
    } else if (userType === 'seller' || user.type === 'seller') {
      role = 'seller';
      const seller = await getSeller(user.id);
      isOnboarded = !!seller;
    }

    // Create auth user object
    const authUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role,
      status: user.status,
      permissions: [], // Will be populated by generateTokens
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate tokens
    const tokens = generateTokens(authUser);
    
    // Set auth cookies
    setAuthCookies(tokens);
    
    // Update last login
    await updateLastLogin(user.id);

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
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}