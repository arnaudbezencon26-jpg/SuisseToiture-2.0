# SuisseToiture - Professional Steam Cleaning Services

## Overview
Website for SuisseToiture, a Swiss company specializing in professional steam cleaning services (facades, roofs, terraces). Features a multi-step quote request wizard and admin panel for managing quotes. Deployed on Vercel with Supabase backend.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL) - all data operations go through Supabase client directly from the frontend
- **API**: Vercel serverless functions (api/ directory) for email sending
- **Dev Server**: Express + Vite for local development only (server/ directory)
- **Security**: All admin operations use Supabase RPC functions (SECURITY DEFINER) to prevent direct table access

## Key Files
- `client/src/lib/supabase.ts` - Supabase client config, types, and helper functions
- `client/src/components/step-wizard.tsx` - Multi-step quote request form
- `client/src/pages/admin.tsx` - Admin panel with quotes management and settings
- `client/src/components/admin-auth.tsx` - Admin authentication via Supabase RPC
- `supabase-setup.sql` - Complete database schema with RPC functions and RLS policies
- `api/send-email.ts` - Vercel serverless function for email notifications
- `server/routes.ts` - Dev server email route (mirrors api/send-email.ts for local dev)
- `vercel.json` - Vercel deployment configuration

## Database (Supabase)
- **quotes** table: Stores quote requests from visitors
- **settings** table: Admin password, email config, email templates
- All admin operations use RPC functions that verify password server-side
- RLS enabled: only anonymous INSERT on quotes, all other access via SECURITY DEFINER functions

## Admin Panel
- Default password: "123456" (changeable in settings)
- Features: quotes management, password change, email config, email template editor
- Authentication: password verified via `verify_admin_password` RPC function
- Password stored in sessionStorage during session, cleared on logout

## Deployment (Vercel)
- Frontend: Vite builds to `dist/public`
- API: Serverless functions in `api/` directory
- Email: Uses Infomaniak SMTP (mail.infomaniak.com:465)
- Environment variables needed on Vercel: SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SMTP_USER` - SMTP username (Infomaniak)
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Email sender address
- `ADMIN_EMAIL` - Admin notification email

## Recent Changes (2026-02-13)
- Restructured for Vercel deployment: removed Express server dependencies
- Created Vercel serverless function (api/send-email.ts) for email notifications
- Removed drizzle/db files (server/db.ts, server/storage.ts, drizzle.config.ts)
- Removed old deployment files (deploy.sh, DEPLOY.md, ecosystem.config.js)
- Added vercel.json with SPA routing configuration
