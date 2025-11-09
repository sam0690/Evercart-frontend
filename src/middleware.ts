import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const accessToken = req.cookies.get('access_token')?.value;
    const isAdmin = req.cookies.get('is_admin')?.value;

    // If missing token or not admin, redirect to login
    if (!accessToken || isAdmin !== 'true') {
      const url = new URL('/login', origin);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
