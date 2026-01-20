# Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

## Pre-Deployment

- [ ] Code is pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] All local tests pass
- [ ] Environment variables are documented (see `.env` file)

## Step 1: Deploy to Vercel

- [ ] Create Vercel account or login
- [ ] Import project from Git repository
- [ ] Configure build settings (should auto-detect Next.js)
- [ ] Initial deployment completes successfully

## Step 2: Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `DATABASE_URL` - Your Neon PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - `https://your-app-name.vercel.app` (update after deployment)
- [ ] `NEXTAUTH_SECRET` - Same as local `.env`
- [ ] `GOOGLE_CLIENT_ID` - Same as local `.env`
- [ ] `GOOGLE_CLIENT_SECRET` - Same as local `.env`
- [ ] `ENCRYPTION_KEY` - Same as local `.env`

**Important:** Select "Production, Preview, Development" for all variables.

## Step 3: Update Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials:

- [ ] Open your OAuth 2.0 Client ID
- [ ] Add to "Authorized redirect URIs":
  - [ ] `https://your-app-name.vercel.app/api/auth/callback/google`
  - [ ] (Optional) `https://your-app-name-*.vercel.app/api/auth/callback/google` for preview deployments
- [ ] Click "Save"

## Step 4: Configure Vercel Build

In Vercel Dashboard → Settings → General:

- [ ] Set **Build Command** to: `npm run vercel-build`
- [ ] (Or leave default if `vercel-build` script is in package.json)

## Step 5: Database Migrations

- [ ] Verify `vercel-build` script runs `prisma migrate deploy`
- [ ] First deployment will run migrations automatically
- [ ] Check Vercel build logs to confirm migrations ran successfully

## Step 6: Redeploy

- [ ] After adding environment variables, redeploy:
  - Go to Deployments tab
  - Click three dots (⋯) on latest deployment
  - Click "Redeploy"

## Step 7: Testing

After deployment, test:

- [ ] Visit your Vercel domain
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow (should redirect back to your app)
- [ ] Check dashboard loads correctly
- [ ] Test "Refresh Emails" button
- [ ] Verify summaries are generated
- [ ] Check Vercel logs for any errors

## Step 8: Custom Domain (Optional)

If using a custom domain:

- [ ] Add domain in Vercel Dashboard → Settings → Domains
- [ ] Update DNS records as instructed
- [ ] Update `NEXTAUTH_URL` environment variable to custom domain
- [ ] Update Google Cloud Console redirect URI to include custom domain
- [ ] Redeploy

## Post-Deployment

- [ ] Monitor Vercel logs for errors
- [ ] Test all features end-to-end
- [ ] Verify database connections work
- [ ] Check API rate limits (Gemini API)
- [ ] Set up monitoring/alerts (optional)

## Troubleshooting

If something doesn't work:

- [ ] Check Vercel deployment logs
- [ ] Verify all environment variables are set correctly
- [ ] Confirm Google Cloud Console redirect URIs match your domain
- [ ] Check browser console for errors
- [ ] Verify database is accessible from Vercel

## Quick Reference

### Your Vercel Domain
```
https://your-app-name.vercel.app
```

### Google Cloud Console Redirect URI
```
https://your-app-name.vercel.app/api/auth/callback/google
```

### Generate Secrets (if needed)
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -base64 32
```
