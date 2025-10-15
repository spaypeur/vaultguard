# Vercel Deployment Guide

## Environment Variables Configuration

This guide outlines the environment variables required for deploying VaultGuard to Vercel. The application uses separate environment configurations for frontend and backend services.

### Frontend Environment Variables (Vercel Dashboard)

Set these variables in your Vercel dashboard under Project Settings > Environment Variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Configuration
VITE_APP_NAME=VaultGuard
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_APP_URL=https://your-domain.vercel.app
VITE_API_URL=https://your-api-domain.vercel.app

# Security Configuration
VITE_CSRF_ENABLED=true

# Analytics (Optional)
VITE_ANALYTICS_ID=GA-XXXXXXXXX

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ADVANCED_ANALYTICS=false

# BTCPay Server Integration (Frontend)
VITE_BTCPAY_SERVER_URL=https://your-btcpay-server.com
VITE_BTCPAY_STORE_ID=your_btcpay_store_id_here
```

### Backend Environment Variables (External Hosting)

Since the backend cannot be deployed to Vercel's serverless environment (requires persistent connections for WebSocket, Redis, etc.), host it separately and configure these variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.vercel.app

# Redis Configuration (Required for session storage)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_SENDER=noreply@yourdomain.com

# Stripe Payment Processing (Optional)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# BTCPay Server Configuration
BTCPAY_SERVER_URL=https://your-btcpay-server.com
BTCPAY_API_KEY=your_btcpay_api_key_here
BTCPAY_WEBHOOK_SECRET=your_btcpay_webhook_secret_here
BTCPAY_STORE_ID=your_btcpay_store_id_here

# Security & OSINT API Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
SHODAN_API_KEY=your_shodan_api_key
OSINTCAT_API_KEY=your_osintcat_api_key
CSINT_CREDENTIALS=your_csint_credentials
RAPIDX_API_KEY=your_rapidapi_key
CENSYS_API_KEY=your_censys_api_key

# Blockchain Intelligence APIs
CHAINALYSIS_API_URL=https://api.chainalysis.com
CHAINALYSIS_API_KEY=your_chainalysis_api_key
ELLIPTIC_API_URL=https://api.elliptic.co
ELLIPTIC_API_KEY=your_elliptic_api_key

# Crypto Payment Wallets
PAYMENT_WALLET_BTC=your_btc_address_here
PAYMENT_WALLET_ETH=your_eth_address_here
PAYMENT_WALLET_ADA=your_ada_address_here
PAYMENT_WALLET_DOT=your_dot_address_here
PAYMENT_WALLET_SOL=your_sol_address_here

# Logging
LOG_LEVEL=info

# Cookie Secret
COOKIE_SECRET=your-cookie-secret-change-in-production
```

## Deployment Steps

### 1. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. Add environment variables in Vercel dashboard (see Frontend section above)

4. Deploy - Vercel will automatically detect the `vercel.json` configuration

### 2. Deploy Backend (Recommended: Railway, DigitalOcean, or AWS)

The backend requires:
- Persistent WebSocket connections
- Redis for session storage
- Long-running processes for monitoring

**Recommended platforms:**
- **Railway**: Excellent for Node.js apps with Redis support
- **DigitalOcean App Platform**: Good performance and scalability
- **AWS ECS/Lambda**: For enterprise deployments

### 3. Domain Configuration

1. **Frontend Domain**: Configure in Vercel dashboard
2. **Backend Domain**: Configure on your hosting platform
3. **Update API URL**: Ensure `VITE_API_URL` points to your backend domain

### 4. SSL/TLS Configuration

- Vercel automatically provides SSL certificates for your frontend
- Ensure your backend hosting platform also provides SSL
- Update all URLs to use `https://` in production

## Security Checklist

- [ ] Generate unique JWT secrets for production
- [ ] Use strong, unique passwords for all API keys
- [ ] Enable 2FA on all service accounts
- [ ] Restrict API key permissions to minimum required
- [ ] Set up monitoring and alerting for failed login attempts
- [ ] Configure rate limiting (already included in vercel.json)
- [ ] Enable security headers (already configured in vercel.json)

## Monitoring and Logs

### Vercel Analytics
- Automatic deployment analytics
- Performance monitoring
- Error tracking

### Backend Monitoring
Set up monitoring on your backend hosting platform:
- Application performance
- Error rates
- Response times
- Resource utilization

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility (use 18.x)
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Runtime Errors**
   - Verify environment variables are correctly set
   - Check API endpoint connectivity
   - Confirm CORS configuration

3. **Performance Issues**
   - Enable Vercel's Edge Network
   - Optimize images and static assets
   - Use appropriate caching headers (already configured)

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables are correctly set
3. Test API connectivity between frontend and backend
4. Monitor application performance and errors