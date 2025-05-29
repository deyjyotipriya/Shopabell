import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractToken } from '@/app/lib/auth-service';

// Route configuration
const routeConfig = {
  // Public routes (no auth required)
  public: [
    '/',
    '/login',
    '/store',
    '/whatsapp-onboard',
    '/api/auth/send-otp',
    '/api/auth/verify-otp',
    '/api/emulated',
    '/api/webhooks',
  ],
  
  // Role-based protected routes
  protected: {
    seller: ['/dashboard', '/api/seller', '/api/products', '/api/orders', '/api/livestream'],
    buyer: ['/checkout', '/orders', '/api/checkout', '/api/chat'],
    admin: ['/admin', '/api/admin'],
    master: ['/master', '/api/master'],
  },
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log('MIDDLEWARE: Processing path:', path);
  
  // Check if route is public
  const isPublicRoute = routeConfig.public.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  console.log('MIDDLEWARE: Is public route:', isPublicRoute);
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // TEMPORARY: Allow all routes to debug redirect issue
  console.log('MIDDLEWARE: Allowing all routes temporarily for debugging');
  return NextResponse.next();
  
  // Extract and verify token
  const token = extractToken(request);
  if (!token) {
    // API routes return 401
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Web routes redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    // Token invalid or expired
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check role-based access
  const userRole = payload.role;
  let hasAccess = false;
  
  // Check if user has access to the requested route
  for (const [role, routes] of Object.entries(routeConfig.protected)) {
    if (routes.some(route => path.startsWith(route))) {
      // Master has access to all routes
      if (userRole === 'master') {
        hasAccess = true;
        break;
      }
      
      // Check if user has the required role
      if (role === userRole) {
        hasAccess = true;
        break;
      }
      
      // Admin has access to seller routes
      if (userRole === 'admin' && role === 'seller') {
        hasAccess = true;
        break;
      }
    }
  }
  
  if (!hasAccess) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Redirect to appropriate dashboard based on role
    const dashboardUrl = userRole === 'admin' ? '/admin' : 
                        userRole === 'master' ? '/master' : 
                        userRole === 'seller' ? '/dashboard' : '/';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  
  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-phone', payload.phone);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};