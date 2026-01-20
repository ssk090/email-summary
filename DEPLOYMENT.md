# Deployment Guide - Vercel

This guide will walk you through deploying your email-summary app to Vercel and configuring Google Cloud Console.

## Prerequisites

- ✅ Your app is working locally
- ✅ You have a Vercel account ([sign up here](https://vercel.com))
- ✅ Your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Google Cloud Console project is set up

---

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account if needed
   - Select your `email-summary` repository
4. **Configure Project Settings:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` or `pnpm install` (depending on your package manager)

5. **⚠️ IMPORTANT: Before clicking "Deploy", add environment variables first!**
   - Click "Environment Variables" in the project settings
   - Add `DATABASE_URL` (required for build to succeed)
   - You can add other variables later, but `DATABASE_URL` is critical
   - Then click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? email-summary (or your choice)
# - Directory? ./
# - Override settings? No
```

---

## Step 2: Configure Environment Variables in Vercel

**⚠️ CRITICAL: Add `DATABASE_URL` BEFORE your first deployment, or the build will fail!**

You can add environment variables either:
- **Before deployment** (recommended): In project settings before clicking "Deploy"
- **After deployment**: In Settings → Environment Variables (then redeploy)

Add the following variables:

1. **Go to your project in Vercel Dashboard**
2. **Click "Settings" → "Environment Variables"**
3. **Add the following variables:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` (your Vercel domain) | Production |
| `NEXTAUTH_SECRET` | Your secret (same as local `.env`) | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | Production, Preview, Development |
| `ENCRYPTION_KEY` | Your encryption key (same as local `.env`) | Production, Preview, Development |

**Important Notes:**
- For `NEXTAUTH_URL`, use your actual Vercel domain (e.g., `https://email-summary.vercel.app`)
- You can find your domain in Vercel Dashboard → Settings → Domains
- Select "Production, Preview, Development" for all variables to work in all environments

4. **Click "Save"** for each variable

5. **Redeploy your application:**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

---

## Step 3: Update Google Cloud Console OAuth Settings

You need to add your Vercel domain to authorized redirect URIs:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project**
3. **Navigate to "APIs & Services" → "Credentials"**
4. **Click on your OAuth 2.0 Client ID**
5. **Under "Authorized redirect URIs", add:**
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   Replace `your-app-name.vercel.app` with your actual Vercel domain.

6. **Optional: Add preview URLs** (for Vercel preview deployments):
   ```
   https://your-app-name-*.vercel.app/api/auth/callback/google
   ```
   This allows preview deployments to work (though you'll need to add specific preview URLs manually if needed).

7. **Click "Save"**

---

## Step 4: Run Database Migrations on Vercel

Vercel runs migrations automatically during build if you have a `postinstall` script. Let's add it:

1. **Check your `package.json`** - it should already have Prisma scripts
2. **Add a postinstall script** (if not present):

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

3. **For initial migration**, you can run it manually:

```bash
# Option 1: Run via Vercel CLI (if you have it installed)
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Run via Vercel Dashboard
# Go to your project → Settings → Environment Variables
# Then use Vercel's built-in terminal or run migrations via a one-time script
```

**Recommended: Use Prisma Migrate Deploy**

Add this to your `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Then in Vercel Dashboard → Settings → General:
- Set **Build Command** to: `npm run vercel-build`

---

## Step 5: Verify Deployment

1. **Visit your Vercel domain**: `https://your-app-name.vercel.app`
2. **Test Google Sign-in** - it should redirect properly
3. **Check Vercel logs**:
   - Go to "Deployments" → Click on your deployment → "Functions" tab
   - Check for any errors in the logs

---

## Step 6: Custom Domain (Optional)

If you want to use a custom domain:

1. **Go to Vercel Dashboard → Settings → Domains**
2. **Add your domain** (e.g., `email-summary.com`)
3. **Update DNS records** as instructed by Vercel
4. **Update environment variables:**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update Google Cloud Console redirect URI to include custom domain
5. **Redeploy**

---

## Troubleshooting

### Issue: "Access Denied" after Google login

**Solution:**
- Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- Check Google Cloud Console redirect URI includes your Vercel domain
- Ensure environment variables are set correctly in Vercel

### Issue: Database connection errors

**Solution:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check if your Neon database allows connections from Vercel IPs (should work by default)
- Ensure you're using the pooler endpoint for Neon (recommended for serverless)

### Issue: Build fails with Prisma errors - "Environment variable not found: DATABASE_URL"

**Solution:**
- **This is the most common issue!** `DATABASE_URL` must be set in Vercel BEFORE the build runs
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `DATABASE_URL` with your Neon PostgreSQL connection string
- **IMPORTANT**: Select "Production, Preview, Development" for the environment
- After adding, redeploy your project
- If you're using the default build command, ensure `vercel-build` script is set correctly

### Issue: Environment variables not working

**Solution:**
- Ensure variables are added to the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

---

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - Your Neon PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel domain (e.g., `https://your-app.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `ENCRYPTION_KEY` - Random 32+ character string

---

## Quick Reference

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

### Vercel CLI Commands

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables locally
vercel env pull .env.local
```

---

## Next Steps After Deployment

1. ✅ Test the full flow: Sign in → Fetch emails → Generate summaries
2. ✅ Monitor Vercel logs for any errors
3. ✅ Set up Vercel Analytics (optional)
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring/alerts (optional)

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure Google Cloud Console settings are correct
