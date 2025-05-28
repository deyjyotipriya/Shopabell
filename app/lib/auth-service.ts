import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createUser, getUserByPhone, getUserById, updateUser } from './database';
import { Database } from '@/types/database';
import crypto from 'crypto';

// Types
export type UserRole = 'seller' | 'buyer' | 'admin' | 'master';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface JWTPayload {
  userId: string;
  phone: string;
  role: UserRole;
  permissions: string[];
  sessionId: string;
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'shopabell-secret-key-2024';
const JWT_ISSUER = 'shopabell';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '30d';
const COOKIE_SECURE = process.env.NODE_ENV === 'production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';

// Permission definitions
export const PERMISSIONS = {
  // Seller permissions
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_ORDERS: 'view_orders',
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_LIVESTREAM: 'manage_livestream',
  
  // Buyer permissions
  CREATE_ORDERS: 'create_orders',
  VIEW_OWN_ORDERS: 'view_own_orders',
  CHAT_WITH_SELLERS: 'chat_with_sellers',
  
  // Admin permissions
  VIEW_ALL_SELLERS: 'view_all_sellers',
  MANAGE_SELLERS: 'manage_sellers',
  BROADCAST_MESSAGES: 'broadcast_messages',
  VIEW_PLATFORM_ANALYTICS: 'view_platform_analytics',
  
  // Master permissions
  FULL_ACCESS: 'full_access',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_FINANCIALS: 'view_financials',
  SYSTEM_SETTINGS: 'system_settings',
};

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  buyer: [
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.CHAT_WITH_SELLERS,
  ],
  seller: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_LIVESTREAM,
  ],
  admin: [
    PERMISSIONS.VIEW_ALL_SELLERS,
    PERMISSIONS.MANAGE_SELLERS,
    PERMISSIONS.BROADCAST_MESSAGES,
    PERMISSIONS.VIEW_PLATFORM_ANALYTICS,
  ],
  master: [
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.SYSTEM_SETTINGS,
  ],
};

// Session management
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

// Generate secure session ID
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate JWT tokens
export function generateTokens(user: User): AuthTokens {
  const sessionId = generateSessionId();
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  
  const payload: JWTPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    permissions,
    sessionId,
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
    issuer: JWT_ISSUER,
    subject: user.id,
  });
  
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES,
      issuer: JWT_ISSUER,
      subject: user.id,
    }
  );
  
  // Store session
  activeSessions.set(sessionId, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

// Verify and decode token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as JWTPayload;
    
    // Verify session exists and is valid
    const session = activeSessions.get(decoded.sessionId);
    if (!session || session.userId !== decoded.userId || Date.now() > session.expiresAt) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// Extract token from request
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  
  return token || null;
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = extractToken(request);
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const dbUser = await getUserById(payload.userId);
  if (!dbUser) return null;
  
  return {
    id: dbUser.id,
    phone: dbUser.phone,
    name: dbUser.name || undefined,
    email: dbUser.email || undefined,
    role: dbUser.type as UserRole,
    status: dbUser.status,
    permissions: payload.permissions,
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };
}

// Role-based access control
export function hasPermission(user: User, permission: string): boolean {
  if (user.role === 'master' || user.permissions.includes(PERMISSIONS.FULL_ACCESS)) {
    return true;
  }
  return user.permissions.includes(permission);
}

// Middleware for protected routes
export async function withAuth(
  request: NextRequest,
  requiredPermissions: string[] = []
): Promise<{ user: User } | { error: NextResponse }> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to continue' },
        { status: 401 }
      ),
    };
  }
  
  if (user.status !== 'active') {
    return {
      error: NextResponse.json(
        { error: 'Account Suspended', message: 'Your account has been suspended' },
        { status: 403 }
      ),
    };
  }
  
  // Check permissions
  for (const permission of requiredPermissions) {
    if (!hasPermission(user, permission)) {
      return {
        error: NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }
  }
  
  return { user };
}

// Set auth cookies
export function setAuthCookies(tokens: AuthTokens): void {
  const cookieStore = cookies();
  
  // Set access token cookie
  cookieStore.set('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: tokens.expiresIn,
  });
  
  // Set refresh token cookie
  cookieStore.set('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

// Clear auth cookies
export function clearAuthCookies(): void {
  const cookieStore = cookies();
  
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

// Invalidate session
export function invalidateSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

// Clean expired sessions (run periodically)
export function cleanExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(sessionId);
    }
  }
}

// Update last login
export async function updateLastLogin(userId: string): Promise<void> {
  await updateUser(userId, { last_login_at: new Date().toISOString() });
}

// Export auth decorators for API routes
export function requireAuth(permissions: string[] = []) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const authResult = await withAuth(request, permissions);
      
      if ('error' in authResult) {
        return authResult.error;
      }
      
      // Add user to request context
      const enhancedRequest = request as any;
      enhancedRequest.user = authResult.user;
      
      return handler(enhancedRequest, context);
    };
  };
}