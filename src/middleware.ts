import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/lib/types';

type Session = {
    email: string;
    role: Role;
}

const protectedRoutes = {
    '/admin-dashboard': 'admin',
    '/user-dashboard': 'user',
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
            default:
                url.pathname = '/login';
                break;
        }
        return NextResponse.redirect(url);
    }
    
    const requiredRole = (protectedRoutes as any)[pathname];
    if (requiredRole && session.role !== requiredRole) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin-dashboard/:path*', '/user-dashboard/:path*', '/login'],
};
