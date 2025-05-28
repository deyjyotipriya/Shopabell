import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/app/lib/auth';
import { 
  verifyToken, 
  generateTokens, 
  setAuthCookies,
  UserRole 
} from '@/app/lib/auth-service';
import { cookies } from 'next/headers';

interface RefreshTokenRequest {
  refreshToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshTokenRequest = await request.json();
    
    // Get refresh token from body or cookies
    const refreshToken = body.refreshToken || cookies().get('refresh_token')?.value;

    // Validate input
    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token (from auth-service)
    const payload = verifyToken(refreshToken);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Get user to ensure they still exist and are active
    const user = await getUserById(payload.userId);
    
    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }
    
    // Determine current role
    let role: UserRole = 'buyer';
    
    if (user.type === 'seller') {
      role = 'seller';
    }
    
    // Check for admin/master roles
    if (user.phone === '+919999999999') {
      role = 'master';
    } else if (user.phone.endsWith('0000')) {
      role = 'admin';
    }

    // Create auth user object
    const authUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role,
      status: user.status,
      permissions: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate new tokens
    const tokens = generateTokens(authUser);
    
    // Set auth cookies
    setAuthCookies(tokens);

    // Return new tokens
    return NextResponse.json({
      success: true,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}