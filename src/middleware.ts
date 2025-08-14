import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  let session;
  
  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch (error) {
    session = null;
  }

  const { pathname } = request.nextUrl;

  // If trying to access login page while logged in, redirect to respective dashboard
  if (session && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = session.role === 'admin' ? '/' : '/user';
    return NextResponse.redirect(url);
  }

  // If not logged in and trying to access a protected route, redirect to login
  if (!session && (pathname.startsWith('/user') || pathname === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Role-based access control
  if (session) {
    if (pathname === '/' && session.role !== 'admin') {
         const url = request.nextUrl.clone();
         url.pathname = '/user';
         return NextResponse.redirect(url);
    }
     if (pathname.startsWith('/user') && session.role !== 'user') {
         const url = request.nextUrl.clone();
         url.pathname = '/';
         return NextResponse.redirect(url);
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/user/:path*', '/login'],
};
