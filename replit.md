# SuisseToiture - Professional Steam Cleaning Services

## Overview
Website for SuisseToiture, a Swiss company specializing in professional steam cleaning services (facades, roofs, terraces). Features a multi-step quote request wizard and admin panel for managing quotes.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL) - all data operations go through Supabase client directly from the frontend
- **Server**: Minimal Express server for Vite dev server only (no API routes)
- **Security**: All admin operations use Supabase RPC functions (SECURITY DEFINER) to prevent direct table access

## Key Files
- `client/src/lib/supabase.ts` - Supabase client config, types, and helper functions
- `client/src/components/step-wizard.tsx` - Multi-step quote request form
- `client/src/pages/admin.tsx` - Admin panel with quotes management and settings
- `client/src/components/admin-auth.tsx` - Admin authentication via Supabase RPC
- `supabase-setup.sql` - Complete database schema with RPC functions and RLS policies
- `server/routes.ts` - Minimal server (no API routes, just HTTP server)

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

## Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Recent Changes (2026-02-13)
- Migrated from Express API routes to direct Supabase client calls
- Added secure RPC functions for all admin operations
- Removed direct table access for settings (password never exposed to client)
- Added admin settings panel with password, email, and template management tabs
