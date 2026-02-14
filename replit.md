# SuisseToiture - Professional Steam Cleaning Services

## Overview
Website for SuisseToiture, a Swiss company specializing in professional steam cleaning services (facades, roofs, terraces). Features a multi-step quote request wizard and admin panel for managing quotes. Deployed on Vercel with direct PostgreSQL connection.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Direct PostgreSQL connection via `DATABASE_URL` (connection string)
- **API**: Vercel serverless functions (api/ directory) for all backend operations
- **Dev Server**: Express + Vite for local development (server/ directory mirrors api/ routes)
- **Security**: Admin password verified server-side on every API call

## Key Files
- `client/src/lib/supabase.ts` - Types, helper functions, session management (no Supabase client)
- `client/src/components/step-wizard.tsx` - Multi-step quote request form
- `client/src/pages/admin.tsx` - Admin panel with quotes management and settings
- `client/src/components/admin-auth.tsx` - Admin authentication via API
- `api/_db.ts` - Shared database connection pool (pg)
- `api/quotes.ts` - Vercel function: create quote
- `api/admin/login.ts` - Vercel function: admin login
- `api/admin/quotes.ts` - Vercel function: list/update quotes
- `api/admin/settings.ts` - Vercel function: get/update settings
- `api/send-email.ts` - Vercel function: email notifications
- `server/routes.ts` - Dev server routes (mirrors api/ for local dev)
- `vercel.json` - Vercel deployment configuration

## Database (PostgreSQL via connection string)
- **quotes** table: Stores quote requests from visitors
- **settings** table: Admin password, email config, email templates
- Connected via `DATABASE_URL` environment variable
- Tables created via SQL (see supabase-setup.sql for reference schema)

## Admin Panel
- Default password: "123456" (changeable in settings)
- Features: quotes management, password change, email config, email template editor
- Authentication: password verified server-side on every API request
- Password stored in sessionStorage during session, cleared on logout

## API Routes
- `POST /api/quotes` - Create a new quote (public)
- `POST /api/admin/login` - Verify admin password
- `POST /api/admin/quotes` - List all quotes (requires password)
- `PATCH /api/admin/quotes` - Update quote status (requires password)
- `POST /api/admin/settings` - Get settings (requires password)
- `PATCH /api/admin/settings` - Update settings (requires password, type: password/email/templates)
- `POST /api/send-email` - Send email notifications

## Deployment (Vercel)
- Frontend: Vite builds to `dist/public`
- API: Serverless functions in `api/` directory
- Email: Uses Infomaniak SMTP (mail.infomaniak.com:465)
- Environment variables needed on Vercel: DATABASE_URL, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (e.g., postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres)
- `SMTP_USER` - SMTP username (Infomaniak)
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Email sender address
- `ADMIN_EMAIL` - Admin notification email

## Recent Changes (2026-02-14)
- Replaced Supabase client with direct PostgreSQL connection via DATABASE_URL
- Created all API routes as Vercel serverless functions (api/ directory)
- Frontend now calls API routes instead of Supabase client directly
- Removed VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY dependencies
