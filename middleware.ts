import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const access = req.cookies.get('access_token')?.value;
    const isAdmin = req.cookies.get('is_admin')?.value === 'true';

    if (!access || !isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
