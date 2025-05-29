import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateTokens } from '@/app/lib/auth-service';
import type { User } from '@/app/lib/auth-service';

interface RefreshTokenRequest {
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshTokenRequest = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // For demo - create user from token payload
    const demoUser: User = {
      id: payload.userId,
      phone: payload.phone,
      name: 'Demo User',
      email: undefined,
      role: payload.role,
      status: 'active',
      permissions: payload.permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate new tokens
    const tokens = generateTokens(demoUser);

    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        phone: demoUser.phone,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        isOnboarded: false
      },
      tokens
    });

  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}