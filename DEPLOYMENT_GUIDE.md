# VaultGuard Deployment Guide

## Quick Start (Free Hosting)

### Prerequisites
- GitHub account (free)
- Stripe account (free - for payments)
- Domain name (optional but recommended - $8-12/year)

---

## Step 1: Deploy Frontend to Vercel (FREE)

### 1.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 1.2 Deploy Frontend
```bash
cd frontend
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **vaultguard-frontend**
- Directory? **./frontend**
- Override settings? **N**

You'll get a URL like: `https://vaultguard-frontend.vercel.app`

### 1.3 Add Environment Variables in Vercel Dashboard
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add:
```
VITE_API_URL=https://your-backend-url.railway.app
VITE_WS_URL=wss://your-backend-url.railway.app
```

---

## Step 2: Deploy Backend to Railway (FREE $5 credit)

### 2.1 Sign Up
Go to: https://railway.app and sign up with GitHub

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your VaultGuard repository
4. Select the `backend` folder as root directory

### 2.3 Add Environment Variables
In Railway dashboard, go to Variables tab and add:

```bash
# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=generate_random_string_here
JWT_REFRESH_SECRET=generate_another_random_string

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=https://vaultguard-frontend.vercel.app

# Email (Optional - use Zoho free tier)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=you@vaultguard.io
SMTP_PASS=your_email_password

# Node Environment
NODE_ENV=production
PORT=3001
```

### 2.4 Generate Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3: Set Up Supabase (FREE)

### 3.1 Create Account
Go to: https://supabase.com and sign up

### 3.2 Create New Project
1. Click "New Project"
2. Name: VaultGuard
3. Database Password: (save this!)
4. Region: Choose closest to you

### 3.3 Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `backend/src/config/schema.sql`
3. Paste and run

### 3.4 Get API Keys
Go to Settings → API
- Copy `Project URL` → This is your `SUPABASE_URL`
- Copy `anon public` key → This is your `SUPABASE_ANON_KEY`
- Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4: Set Up Stripe (FREE)

### 4.1 Create Account
Go to: https://stripe.com and sign up

### 4.2 Get API Keys
1. Go to Developers → API Keys
2. Copy "Secret key" (starts with `sk_test_`)
3. Add to Railway environment variables

### 4.3 Set Up Webhook
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend.railway.app/api/payments/webhook`
4. Select events: `checkout.session.completed`
5. Copy "Signing secret" (starts with `whsec_`)
6. Add to Railway as `STRIPE_WEBHOOK_SECRET`

### 4.4 Add Products (Optional)
You can create products in Stripe dashboard or let the API handle it dynamically.

---

## Step 5: Custom Domain (Optional - $8-12/year)

### 5.1 Buy Domain
- Namecheap: https://namecheap.com
- Cloudflare: https://cloudflare.com
- Recommended: `vaultguard.io` or `vaultguard.com`

### 5.2 Connect to Vercel
1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Follow DNS instructions (add A/CNAME records)

### 5.3 Connect to Railway (Backend)
1. In Railway → Settings → Domains
2. Add custom domain for API (e.g., `api.vaultguard.io`)
3. Update DNS records

---

## Step 6: Free Email (Zoho Mail)

### 6.1 Sign Up
Go to: https://zoho.com/mail and sign up

### 6.2 Add Domain
1. Control Panel → Domains → Add Domain
2. Enter your domain name
3. Verify ownership (add TXT record to DNS)

### 6.3 Create Email
Create: `you@vaultguard.io`, `support@vaultguard.io`, `sales@vaultguard.io`

### 6.4 Configure SMTP
Use these settings in Railway:
```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=you@vaultguard.io
SMTP_PASS=your_password
```

---

## Step 7: Test Everything

### 7.1 Test Frontend
Visit: `https://vaultguard-frontend.vercel.app`
- Landing page loads ✓
- Can navigate to pricing ✓
- Can register/login ✓

### 7.2 Test Backend
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok"}
```

### 7.3 Test Payment Flow
1. Go to pricing page
2. Select a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Should redirect to success page

---

## Step 8: Create Admin User

### 8.1 Run Seed Script
```bash
# SSH into Railway or run locally
cd backend
node src/scripts/seedAdmin.js
```

Or manually in Supabase SQL Editor:
```sql
INSERT INTO users (email, password_hash, role, subscription_plan, subscription_status)
VALUES (
  'admin@vaultguard.io',
  '$2a$10$...',  -- Generate with bcrypt
  'admin',
  'sovereign',
  'active'
);
```

---

## Cost Breakdown

### Free Tier (First 3-6 months)
- Vercel: FREE (unlimited bandwidth)
- Railway: FREE ($5 credit/month)
- Supabase: FREE (500MB database, 2GB bandwidth)
- Stripe: FREE (2.9% + $0.30 per transaction)
- Zoho Mail: FREE (5 users)
- **Total: $0/month**

### After Free Credits
- Railway: ~$10-20/month (when you exceed free tier)
- Domain: $8-12/year
- **Total: ~$10-20/month**

### When You Get Customers
- Scale Railway: $20-50/month
- Upgrade Supabase: $25/month (Pro plan)
- **Total: ~$50-75/month**

**ROI**: If you get just ONE Foundation customer ($50K/year), you're profitable!

---

## Monitoring & Analytics

### Free Tools
1. **Vercel Analytics** (built-in)
   - Page views, performance

2. **Railway Logs** (built-in)
   - Server logs, errors

3. **Supabase Dashboard** (built-in)
   - Database queries, users

4. **Google Analytics** (free)
   ```html
   <!-- Add to frontend/index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```

5. **UptimeRobot** (free)
   - Monitor uptime: https://uptimerobot.com
   - Alert if site goes down

---

## Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Stripe webhook secret configured
- [ ] Database backups enabled (Supabase auto-backup)
- [ ] Rate limiting enabled (already in code)
- [ ] CORS configured correctly
- [ ] No private keys in code
- [ ] Terms & Privacy pages live

---

## Troubleshooting

### Frontend won't load
- Check Vercel deployment logs
- Verify environment variables are set
- Check browser console for errors

### Backend API errors
- Check Railway logs
- Verify Supabase connection
- Test database connection

### Payments not working
- Verify Stripe keys (test vs live)
- Check webhook is receiving events
- Look at Stripe dashboard logs

### Emails not sending
- Verify SMTP credentials
- Check Zoho mail settings
- Test with a simple email first

---

## Going Live (Production)

### 1. Switch Stripe to Live Mode
- Get live API keys from Stripe
- Update Railway environment variables
- Test with real card (small amount)

### 2. Update Legal Pages
- Add your real business address
- Add your real contact email
- Review with a lawyer (recommended)

### 3. Set Up Business Entity
- Form LLC ($200-600)
- Get EIN from IRS (free)
- Open business bank account

### 4. Get Insurance
- Cyber liability: $1K-3K/year
- E&O insurance: $500-2K/year

### 5. Marketing
- Submit to Product Hunt
- Post on Twitter/X
- Write blog posts
- Reach out to crypto influencers

---

## Support

If you need help:
1. Check Railway/Vercel logs first
2. Review this guide
3. Search error messages
4. Ask in Railway/Vercel Discord communities

---

## Next Steps After Deployment

1. **Test everything thoroughly**
2. **Create your first blog post** (SEO)
3. **Set up Google Analytics**
4. **Reach out to 10 potential customers**
5. **Monitor logs daily** (first week)
6. **Iterate based on feedback**

**Remember**: You only need 1-2 customers to make $50K-250K/year. Focus on quality over quantity!

---

## Quick Deploy Commands

```bash
# Frontend
cd frontend
vercel --prod

# Backend (push to GitHub, Railway auto-deploys)
git add .
git commit -m "Deploy to production"
git push origin main

# Check status
vercel ls  # Frontend deployments
# Railway: Check dashboard
```

Good luck! 🚀
