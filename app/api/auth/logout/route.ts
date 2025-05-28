import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    // In a production environment, you would:
    // 1. Invalidate the refresh token in your database
    // 2. Add the access token to a blacklist (if using token blacklisting)
    // 3. Clear any server-side sessions
    
    // For now, we'll just return a success response
    // The client should remove tokens from local storage
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}