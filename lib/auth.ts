import type { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
      tenantId: process.env.AZURE_AD_TENANT_ID ?? '',
    }),
  ],
  callbacks: {
    async signIn({ profile }: any) {
      const email = profile?.email || profile?.preferred_username || '';
      const allowedDomain = process.env.ALLOWED_DOMAIN || 'vtwo.co';
      return typeof email === 'string' && email.toLowerCase().endsWith(`@${allowedDomain}`);
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub;
        // Azure AD: prefer 'name' from token, fall back to email
        if (!session.user.email && token.email) session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, profile }: any) {
      if (profile) {
        token.email =
          (profile as any).email ||
          (profile as any).preferred_username ||
          token.email;
        token.name = (profile as any).name || token.name;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || 'chris@vtwo.co')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
