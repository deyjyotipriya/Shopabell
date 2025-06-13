import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { createUser, getUserByPhone as getDbUserByPhone, getUserById as getDbUserById } from './database';
import { Database } from '@/types/database';

// In-memory OTP storage (replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: string;
  phone: string;
  userType: 'seller' | 'buyer' | 'admin';
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  type: 'seller' | 'buyer' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, otp: string): void {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phone, { otp, expiresAt });
}

export function verifyOTP(phone: string, otp: string): boolean {
  console.log(`Auth lib - verifyOTP called with phone: ${phone}, otp: ${otp}`);
  
  // Demo OTP for testing
  if (otp === '123456') {
    console.log('Demo OTP accepted');
    return true;
  }
  
  const stored = otpStore.get(phone);
  console.log('Stored OTP data:', stored);
  
  if (!stored) {
    console.log('No stored OTP found');
    return false;
  }
  
  if (Date.now() > stored.expiresAt) {
    console.log('OTP expired');
    otpStore.delete(phone);
    return false;
  }
  
  if (stored.otp === otp) {
    console.log('OTP matched');
    otpStore.delete(phone);
    return true;
  }
  
  console.log('OTP did not match');
  return false;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = extractToken(request);
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return getUserById(payload.userId);
}

export async function createOrUpdateUser(phone: string, type: 'seller' | 'buyer' = 'buyer'): Promise<User> {
  console.log('createOrUpdateUser called with:', phone, type);
  
  try {
    let user = await getUserByPhone(phone);
    console.log('getUserByPhone result:', user);
    
    if (!user) {
      console.log('Creating new user...');
      const dbUser = await createUser(phone, undefined, type);
      console.log('Created user:', dbUser);
      
      user = {
        id: dbUser.id,
        phone: dbUser.phone,
        name: dbUser.name || undefined,
        email: dbUser.email || undefined,
        type: dbUser.type,
        status: dbUser.status,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
      };
    }
    
    console.log('Final user object:', user);
    return user;
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const dbUser = await getDbUserById(id);
    if (!dbUser) return null;
    
    return {
      id: dbUser.id,
      phone: dbUser.phone,
      name: dbUser.name || undefined,
      email: dbUser.email || undefined,
      type: dbUser.type,
      status: dbUser.status,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  } catch (error) {
    return null;
  }
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const dbUser = await getDbUserByPhone(phone);
    if (!dbUser) return null;
    
    return {
      id: dbUser.id,
      phone: dbUser.phone,
      name: dbUser.name || undefined,
      email: dbUser.email || undefined,
      type: dbUser.type,
      status: dbUser.status,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  } catch (error) {
    return null;
  }
}

// Middleware to protect routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: User) => Promise<Response>
): Promise<Response> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return handler(request, user);
}