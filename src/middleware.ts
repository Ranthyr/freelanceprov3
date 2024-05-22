import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define the routes that should be public
const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing']);

export default clerkMiddleware((auth, request) => {
  const url = request.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostname = request.headers.get('host');

  const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Check if the route is public
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect non-public routes
  auth();

  // If subdomain exists
  const customSubDomain = hostname
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, request.url));
  }

  // Redirect to /agency/sign-in for sign-in and sign-up routes
  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    const redirectUrl = url.searchParams.get('redirect_url');
    if (redirectUrl && redirectUrl.includes('/agency/sign-in')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(`/agency/sign-in`, request.url));
  }

  // Rewrite to /site for the root path or if accessing /site directly on the main domain
  if (url.pathname === '/' || (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)) {
    return NextResponse.rewrite(new URL('/site', request.url));
  }

  // Ensure that agency and subaccount paths are rewritten correctly
  if (url.pathname.startsWith('/agency') || url.pathname.startsWith('/subaccount')) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
