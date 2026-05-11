# V.Two Hardware Inventory

Internal Next.js app for V.Two employees to report V.Two-owned hardware they have.

## Stack

- Next.js 14 (App Router) + TypeScript
- next-auth (Azure AD), restricted to the V.Two tenant + `@vtwo.co` domain
- PostgreSQL via Prisma
- Deployed to Railway

## Local dev

```bash
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, AZURE_AD_*
npm install
npx prisma migrate dev --name init
npm run dev
```

## Env vars

| Var | Notes |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Railway plugin provides automatically) |
| `NEXTAUTH_SECRET` | Random 32+ byte secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Full public URL (set to Railway domain after first deploy) |
| `AZURE_AD_CLIENT_ID` | From V.Two Azure AD app registration |
| `AZURE_AD_CLIENT_SECRET` | From V.Two Azure AD app registration |
| `AZURE_AD_TENANT_ID` | V.Two tenant ID |
| `ALLOWED_DOMAIN` | Defaults to `vtwo.co` |
| `ADMIN_EMAILS` | Comma-separated. Defaults to `chris@vtwo.co` |

## Azure AD redirect URI

Register the following Web redirect URI in the V.Two Azure AD app registration:

```
https://<railway-domain>/api/auth/callback/azure-ad
```

For local dev:

```
http://localhost:3000/api/auth/callback/azure-ad
```

## Routes

- `/login` — sign-in page
- `/` — form for any signed-in V.Two employee to add devices; shows their own past submissions
- `/admin` — gated by `ADMIN_EMAILS`. Lists all submissions with filtering + CSV export
- `/api/devices` — POST to create devices for the current session user
- `/api/auth/[...nextauth]` — NextAuth handler

## Deploying to Railway

1. Push to GitHub (`main`)
2. Create a Railway project, link the repo, add the Postgres plugin
3. Set the env vars above
4. After first deploy, copy the public domain into `NEXTAUTH_URL` and redeploy
5. Migrations run automatically during `npm run build` (`prisma migrate deploy`)
