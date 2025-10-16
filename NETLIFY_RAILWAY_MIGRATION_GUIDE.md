# VaultGuard Migration: Vercel → Netlify + Railway

## Overview
This guide provides step-by-step instructions for migrating VaultGuard from Vercel (frontend) and Render (backend) to Netlify (frontend) and Railway (backend) free tiers.

## Prerequisites
- GitHub account connected to Netlify and Railway
- VaultGuard domain (vaultguard.agency) available
- Supabase project configured
- Environment variables from current deployment

## 1. Frontend Migration: Vercel → Netlify

### 1.1 Create Netlify Account
1. Visit https://netlify.com and sign up
2. Connect your GitHub account
3. Import the VaultGuard repository

### 1.2 Deploy to Netlify
1. In Netlify dashboard, click "Add new site" → "Import from Git"
2. Select your VaultGuard repository
3. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables in Netlify dashboard:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   VITE_WS_URL=wss://your-railway-app.railway.app
   ```

### 1.3 Domain Setup
1. Go to Site settings → Domain management
2. Add custom domain: `vaultguard.agency`
3. Configure DNS records as instructed by Netlify
4. Set as primary domain

### 1.4 Security Headers & Redirects
The `netlify.toml` file includes:
- SPA fallback redirects
- Security headers (CSP, HSTS, etc.)
- Asset caching rules
- PWA configuration

## 2. Backend Migration: Render → Railway

### 2.1 Create Railway Account
1. Visit https://railway.app and sign up
2. Connect your GitHub account
3. Import the VaultGuard repository

### 2.2 Deploy to Railway
1. In Railway dashboard, click "Deploy from GitHub"
2. Select your VaultGuard repository
3. Railway will auto-detect the `railway.json` configuration

### 2.3 Environment Variables
Set these variables in Railway dashboard:

**Required Variables:**
```
NODE_ENV=production
PORT=${{ RAILWAY_STATIC_URL }}
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-refresh-secret-32-chars-minimum
FRONTEND_URL=https://vaultguard.agency
COOKIE_SECRET=your-cookie-secret
```

**Email Configuration:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SENDER=noreply@vaultguard.agency
```

**Payment Wallets:**
```
PAYMENT_WALLET_BTC=your-bitcoin-address
PAYMENT_WALLET_ETH=your-ethereum-address
PAYMENT_WALLET_ADA=your-cardano-address
PAYMENT_WALLET_DOT=your-polkadot-address
PAYMENT_WALLET_SOL=your-solana-address
```

## 3. Post-Migration Steps

### 3.1 Update API Endpoints
Update frontend environment variables:
```
VITE_API_URL=https://your-railway-project.railway.app
VITE_WS_URL=wss://your-railway-project.railway.app
```

### 3.2 Test Deployment
1. Test health endpoint: `curl https://your-railway-app.railway.app/health`
2. Test frontend: Visit `https://vaultguard.agency`
3. Verify WebSocket connections
4. Test payment flows
5. Verify Supabase integration

### 3.3 Update DNS & External Services
1. Update any external API integrations with new URLs
2. Update webhook endpoints if any
3. Update email sender domains if needed

## 4. Environment Variable Mapping

### From Vercel to Netlify:
| Vercel Variable | Netlify Variable | Notes |
|----------------|------------------|-------|
| VITE_API_URL | VITE_API_URL | Update with Railway URL |
| VITE_WS_URL | VITE_WS_URL | Update with Railway URL |

### From Render to Railway:
| Render Variable | Railway Variable | Notes |
|----------------|------------------|-------|
| NODE_ENV | NODE_ENV | Same |
| PORT | PORT | Railway handles automatically |
| SUPABASE_* | SUPABASE_* | Same |
| JWT_* | JWT_* | Same |
| FRONTEND_URL | FRONTEND_URL | Update to vaultguard.agency |
| EMAIL_* | EMAIL_* | Same |
| PAYMENT_* | PAYMENT_* | Same |
| COOKIE_SECRET | COOKIE_SECRET | Same |

## 5. Troubleshooting

### Common Issues:
1. **Build failures**: Ensure Node.js version is 18+
2. **Environment variables**: Double-check all variables are set
3. **Domain propagation**: DNS changes may take up to 48 hours
4. **CORS issues**: Update CORS origins in Railway

### Railway-Specific:
- Railway uses Nixpacks for builds by default
- Health checks are configured in `railway.json`
- Logs available in Railway dashboard

### Netlify-Specific:
- Builds use the `netlify.toml` configuration
- Headers and redirects are automatically applied
- PWA features are preserved

## 6. Rollback Plan
If issues occur:
1. Keep Vercel deployment active during migration
2. Test thoroughly before decommissioning Vercel
3. Have backup of all environment variables
4. Document any custom configurations that need recreation

## Free Tier Limits
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Railway**: $5 credit, includes databases and Redis

## Cost Comparison
- Vercel Hobby: $0 (but limited)
- Render: $7/month minimum
- **Combined Netlify + Railway: $0** (within free limits)

## Support
- Netlify Docs: https://docs.netlify.com
- Railway Docs: https://docs.railway.app
- VaultGuard Issues: Create GitHub issues