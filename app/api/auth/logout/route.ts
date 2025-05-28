import { NextRequest, NextResponse } from 'next/server';
import { 
  extractToken, 
  verifyToken, 
  clearAuthCookies, 
  invalidateSession 
} from '@/app/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Extract token
    const token = extractToken(request);
    
    if (token) {
      // Verify and get session info
      const payload = verifyToken(token);
      
      if (payload && payload.sessionId) {
        // Invalidate the session
        invalidateSession(payload.sessionId);
      }
    }
    
    // Clear auth cookies
    clearAuthCookies();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear cookies and return success
    clearAuthCookies();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}