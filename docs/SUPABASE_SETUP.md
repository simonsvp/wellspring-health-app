# Supabase setup

WellSpring runs in local demo mode when Supabase environment variables are absent. Follow these steps to enable the hosted backend.

## 1. Create the project

Create a Supabase project and keep its database password in a password manager. The free plan is sufficient for the capstone.

## 2. Apply the migration

Open **SQL Editor**, create a query, paste the complete contents of `supabase/migrations/202607180001_initial_schema.sql`, and run it once.

The migration creates:

- eight public application tables and their relationships;
- indexes for user history queries;
- a new-user profile and role trigger;
- Row Level Security policies for members and administrators;
- private avatar and public wellness-audio Storage buckets;
- starter activities, sounds, herbs, and tea content.

## 3. Connect Vite

Copy `.env.example` to `.env`, then obtain the Project URL and publishable key from the Supabase **Connect** panel:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never put a secret key or `service_role` key in the frontend. Restart `npm run dev` after changing `.env`.

## 4. Test a member

Create an account through WellSpring. If email confirmation is enabled, confirm the message before signing in. Verify that the new user has one row in both `profiles` and `user_roles`.

## 5. Promote the demo administrator

After registering the intended administrator, run this query in SQL Editor and replace the email value:

```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'admin@example.com');
```

Sign out and back in, then open the protected Admin page.

## Verification checklist

- Registration creates Auth, profile, and role records.
- Different users cannot read one another's journal, focus, activity, or profile rows.
- Activities, tracks, and herbs are readable before sign-in.
- A member can upload and view only files in their own avatar folder.
- A regular member cannot open administrator content.
