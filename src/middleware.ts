import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/lib/types';

type Session = {
    email: string;
    role: Role;
    hostelName?: string;
    floor?: string;
}

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
            url.pathname = '/';
            break;
        case 'warden':
            url.pathname = '/warden';
            break;
        case 'floor_incharge':
            url.pathname = '/floor-incharge';
            break;
        case 'student':
            url.pathname = '/student';
            break;
        default:
            url.pathname = '/login';
            break;
    }
    return NextResponse.redirect(url);
  }

  // If not logged in and trying to access a protected route, redirect to login
  const protectedRoutes = ['/', '/warden', '/floor-incharge', '/student'];
  if (!session && protectedRoutes.some(p => pathname.startsWith(p) && (pathname.length === p.length || pathname.charAt(p.length) === '/'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Role-based access control
  if (session) {
    if (pathname === '/' && session.role !== 'admin') {
         return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/warden') && session.role !== 'warden') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/floor-incharge') && session.role !== 'floor_incharge') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/student') && session.role !== 'student') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/warden/:path*', '/floor-incharge/:path*', '/student/:path*', '/login'],
};
