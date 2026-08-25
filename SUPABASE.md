# Supabase Database & Auth Setup Guide — House of Shakya Railing Studio

This guide explains how your **Supabase PostgreSQL database** and **Supabase Authentication** are configured and how to manage admin access.

---

## 🔐 Admin Authentication Credentials

The studio administrator account is managed securely via **Supabase Auth**:

- **Admin Login URL**: [`/admin`](https://shakya-railing-studio.vercel.app/admin)
- **Admin Email**: `admin@houseofshakya.com`
- **Default Password**: `ShakyaAdmin2026!`

*(You can change the password or invite additional studio team members at any time in your **Supabase Dashboard ➔ Authentication ➔ Users**).*

---

## 🗄️ Database Tables & Schema

The following tables are live in your PostgreSQL database:

1. **`products`**: All railing catalogue models, materials, rates per sq.ft., photos, specs, and display ordering.
2. **`enquiries`**: Central quotation feed recording incoming customer estimates, quantities, square footage, rates, calculated totals, and lead statuses (`NEW`, `CONTACTED`, `QUOTATION SENT`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
3. **`settings`**: Studio metadata (`Imadole, Mahalaxmi, Nepal`, `+977 984-3935689`, `NPR`).

---

## ⚙️ Environment Variables

The project connects to Supabase using these environment variables in `.env` (and configured in Vercel):

```env
VITE_SUPABASE_URL="https://duwvqfiledszzxlinroj.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎯 Admin Dashboard Features

- **Real-Time Catalogue Management**: Add new railings, edit rates per sq.ft., upload photos, or toggle visibility.
- **Lead Pipeline**: Update enquiry statuses from `NEW` to `CONFIRMED` or `COMPLETED`.
- **CSV Data Export**: One-click download of all customer enquiries with calculation breakdowns.
- **Cloud Sync**: One-click **Sync Cloud** button to refresh data from Supabase across all devices.
