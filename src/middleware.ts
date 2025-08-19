import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/lib/types';

type Session = {
    email: string;
    role: Role;
}

const protectedRoutes: Record<string, Role> = {
    '/admin-dashboard': 'admin',
    '/user-dashboard': 'user',
    '/warden': 'warden',
    '/floor-incharge': 'floor-incharge',
};

const protectedPaths = Object.keys(protectedRoutes);

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  let session: Session | null;
  
  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch (error) {
    session = null;
  }

  const { pathname } = request.nextUrl;

  // If trying to access login page while logged in, redirect to respective dashboard
  if (session && pathname === '/login') {
    const url = request.nextUrl.clone();
    switch (session.role) {
        case 'admin':
            url.pathname = '/admin-dashboard';
            break;
        case 'user':
            url.pathname = '/user-dashboard';
            break;
        case 'warden':
            url.pathname = '/warden';
            break;
        case 'floor-incharge':
            url.pathname = '/floor-incharge';
            break;
        default:
            url.pathname = '/login';
            break;
    }
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = protectedPaths.some(p => pathname.startsWith(p));

  // If not logged in and trying to access a protected route, redirect to login
  if (!session && (isProtectedRoute || pathname === '/')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
  }
  
  // Role-based access control
  if (session) {
    if (pathname === '/') {
        const url = request.nextUrl.clone();
         switch (session.role) {
            case 'admin':
                url.pathname = '/admin-dashboard';
                break;
            case 'user':
                url.pathname = '/user-dashboard';
                break;
            case 'warden':
                url.pathname = '/warden';
                break;
            case 'floor-incharge':
                url.pathname = '/floor-incharge';
                break;
            default:
                url.pathname = '/login';
                break;
        }
        return NextResponse.redirect(url);
    }
    
    const requiredRole = protectedRoutes[pathname];
    if (requiredRole && session.role !== requiredRole) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Redirect and clear the invalid cookie
        const response = NextResponse.redirect(url);
        response.cookies.delete('session');
        return response;
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin-dashboard/:path*', '/user-dashboard/:path*', '/warden/:path*', '/floor-incharge/:path*', '/login'],
};
