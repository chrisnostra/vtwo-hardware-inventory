import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  // Protect everything except login, auth APIs, and static assets
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)'],
};
