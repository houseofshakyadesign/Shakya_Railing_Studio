# Supabase Database Setup Guide — House of Shakya Railing Studio

This guide explains how to connect your **Supabase PostgreSQL database** to the House of Shakya Railing Studio in ~3 minutes.

---

## 📋 Step 1: Create a Free Project in Supabase

1. Go to **[https://supabase.com](https://supabase.com)** and sign in / sign up (free).
2. Click **New project**.
3. Fill in:
   - **Name**: `Shakya-Railing-Studio`
   - **Database Password**: *(Create a secure password or generate one)*
   - **Region**: Select a region close to Nepal (e.g., `Singapore` or `Mumbai`).
4. Click **Create new project**.

---

## 🗄️ Step 2: Run the SQL Schema Setup Script

1. In your Supabase project dashboard, click **SQL Editor** on the left menu.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](./supabase/schema.sql) in this repository and copy all the SQL.
4. Paste it into the Supabase SQL editor and click **Run** (green button).

✅ This will automatically:
- Create the `products`, `enquiries`, and `settings` tables.
- Configure Row Level Security (RLS) policies.
- Insert all 13 factory railing designs with photos, specs, rates, and initial studio settings.

---

## 🔑 Step 3: Add Credentials to Local Environment

1. In Supabase, go to **Project Settings** (gear icon) ➔ **API**.
2. Find:
   - **Project URL** (e.g. `https://xyzprojectid.supabase.co`)
   - **Project API Keys** ➔ `anon` `public` key (long string starting with `eyJ...`)
3. Create a `.env` file in the root of your project:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

---

## 🚀 Step 4: Add Credentials to Vercel (For Production)

To connect Supabase to your live Vercel website:

1. Go to your **[Vercel Dashboard](https://vercel.com/houseofshakya/shakya-railing-studio/settings/environment-variables)** ➔ `shakya-railing-studio` ➔ **Settings** ➔ **Environment Variables**.
2. Add these two variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Click **Save** and trigger a redeploy (`git push` or click **Redeploy** on Vercel).

---

## 🎯 How It Works

- **Public Visitors**: When customers visit `/collection` or `/calculator`, railings and pricing are loaded from Supabase in real-time.
- **Quotations / Enquiries**: When a customer submits an estimate, it saves directly to the `enquiries` table in Supabase and opens WhatsApp.
- **Admin Dashboard (`/admin`)**: Changes made to product prices or active statuses update Supabase instantly for all visitors without needing a code redeploy.
