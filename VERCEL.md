# Vercel Deployment Guide — House of Shakya Railing Studio

This document provides quick reference instructions for deploying and managing the **House of Shakya — Railing Studio** on Vercel.

---

## 🚀 Live Production Details

- **Production URL**: [https://shakya-railing-studio.vercel.app](https://shakya-railing-studio.vercel.app)
- **Vercel Team / Account**: `houseofshakya`
- **GitHub Repository**: [https://github.com/houseofshakyadesign/Shakya_Railing_Studio](https://github.com/houseofshakyadesign/Shakya_Railing_Studio)

---

## 🛠️ Deploying Updates

### Method 1: Automatic Deployments via GitHub (Recommended)

Whenever you push commits to GitHub, Vercel automatically builds and deploys your changes:

```sh
git add .
git commit -m "Update railing pricing"
git push origin main
```

*(Vercel will trigger a new build automatically in the background).*

---

### Method 2: Deploy Directly via Vercel CLI

If you prefer to deploy directly from your local terminal:

```sh
# Deploy directly to production
npx vercel --prod
```

Or for a prebuilt fast deploy:
```sh
# Build locally first
npm run build

# Deploy the prebuilt bundle to production
npx vercel --prebuilt --prod
```

---

## 🌐 Custom Domain Setup

To connect your own custom domain (e.g., `houseofshakya.com` or `railing.houseofshakya.com`):

1. Go to your **[Vercel Project Settings → Domains](https://vercel.com/houseofshakya/shakya-railing-studio/settings/domains)**.
2. Click **Add Domain** and enter your domain name.
3. Configure the DNS records at your domain registrar (e.g., Namecheap, Cloudflare, GoDaddy):

| Type | Name | Value |
| :--- | :--- | :--- |
| **A Record** | `@` (root) | `76.76.21.21` |
| **CNAME** | `railing` (or `www`) | `cname.vercel-dns.com` |

4. Vercel will automatically generate a free SSL certificate once DNS propagates (usually 1–5 minutes).

---

## ⚙️ Build Configuration

In case you ever need to inspect or adjust project settings in the Vercel dashboard:

- **Framework Preset**: `Vite` / `Other`
- **Build Command**: `npm run build` (or `vite build`)
- **Output Directory**: `.vercel/output` (handled automatically by Nitro)
- **Node.js Version**: `20.x` or `22.x`

---

## 🔧 Useful CLI Commands

```sh
# Check current logged-in user / team
npx vercel whoami

# Switch team or account
npx vercel switch

# View recent deployments and logs
npx vercel list

# Inspect a live deployment
npx vercel inspect https://shakya-railing-studio.vercel.app
```
