import { NextRequest, NextResponse } from 'next/server';
import { shiprocketEmulator } from '@/app/lib/shiprocket-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const tokenData = shiprocketEmulator.generateToken(email, password);
    
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: Math.floor(Math.random() * 100000),
      first_name: 'Test',
      last_name: 'User',
      email: email,
      company_id: 1,
      created_at: new Date().toISOString(),
      token: tokenData.token
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}