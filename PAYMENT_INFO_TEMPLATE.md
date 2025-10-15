# 💳 VaultGuard Payment Information Template

## 🔐 Your Crypto Wallet Addresses

**⚠️ SECURITY NOTICE**: Your actual wallet addresses are configured via environment variables in your `.env` file, NOT hardcoded in source code.

Example wallet addresses (replace with your own in `.env`):

```javascript
const PAYMENT_WALLETS = {
  BTC: 'bc1qshs529g7r3uhfvr4uf68yj9l243nnkz8082ve7',
  ETH: '0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd',
  ADA: 'addr1q9de789ay5ygnhqfd5g9pnadnasm2wpwrqe6sh0jh64y50wdrcr7nywn3t7sy0fh66uf2wftz4lwc303su8t03wzh2yqhqwn5u',
  DOT: '0x93812EE085718eC2ae1cF33921020e9CE9E3f2dC',
  SOL: 'BHdJyRkTkxVRCqKWi8oKbcD2ijKFwXYeH1ZfogLcXxLb',
};
```

⚠️ **IMPORTANT**: Set these in your `.env` file, NOT in code!

---

## 💰 Pricing Structure

### Subscription Plans
```javascript
Foundation:  $50,000/year  ($5,000/month)
Guardian:    $250,000/year ($25,000/month)
Sovereign:   $1,000,000+/year (custom)
```

### One-Time Services
```javascript
Tax Report:        $99
Expert Recovery:   Custom (10-20% success fee)
Security Audit:    From $10,000
```

---

## 🔄 Payment Flow

### Fiat Payments (Stripe)
1. Customer clicks "Select Plan" on pricing page
2. Redirected to Stripe checkout
3. Enters credit card info
4. Stripe processes payment
5. Webhook notifies your backend
6. User subscription activated automatically

### Crypto Payments
1. Customer selects crypto payment option
2. System shows your wallet address + QR code
3. Customer sends crypto to your wallet
4. Customer submits transaction hash
5. You verify payment manually (24-48 hours)
6. Activate subscription in admin panel

---

## 🔧 Stripe Setup (Required)

### 1. Create Stripe Account
Go to: https://stripe.com/register

### 2. Get API Keys
Dashboard → Developers → API Keys

**Test Mode** (for development):
```
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```

**Live Mode** (for production):
```
STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
```

### 3. Set Up Webhook
Dashboard → Developers → Webhooks → Add Endpoint

**Endpoint URL**: `https://your-backend-url.com/api/payments/webhook`

**Events to listen for**:
- `checkout.session.completed`

**Copy Signing Secret**:
```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Test Payment
Use Stripe test card:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

---

## 📊 Payment Tracking

All payments are tracked in Supabase database in the `audit_logs` table.

---

## 🔐 Security Best Practices

### Protect Your Wallets
- ✅ Never share private keys
- ✅ Use hardware wallet for large amounts
- ✅ Enable 2FA on all exchanges
- ✅ Regularly move funds to cold storage
- ✅ Keep backup of seed phrases (offline)

### Protect Your Stripe Account
- ✅ Enable 2FA
- ✅ Use strong password
- ✅ Restrict API key permissions
- ✅ Monitor for suspicious activity
- ✅ Set up fraud detection rules

---

## 📈 Revenue Tracking

Track payments in a spreadsheet:

| Date | Customer | Plan | Amount | Method | Status |
|------|----------|------|--------|--------|--------|
| YYYY-MM-DD | Customer Name | Plan Type | $Amount | Payment Method | Status |

---

## 🎯 Setup Checklist

- [ ] Create Stripe account and get API keys
- [ ] Set up Stripe webhook
- [ ] Generate crypto wallet addresses
- [ ] Add all credentials to `.env` file
- [ ] Test payment with Stripe test card
- [ ] Verify crypto wallets are accessible
- [ ] Set up payment tracking system

---

## 📝 Environment Variables Needed

Add these to your `.env` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Crypto Wallets
PAYMENT_WALLET_BTC=bc1qshs529g7r3uhfvr4uf68yj9l243nnkz8082ve7
PAYMENT_WALLET_ETH=0x6f3d73eadffad9ad3f8cb04d133282de95d6c3cd
PAYMENT_WALLET_ADA=addr1q9de789ay5ygnhqfd5g9pnadnasm2wpwrqe6sh0jh64y50wdrcr7nywn3t7sy0fh66uf2wftz4lwc303su8t03wzh2yqhqwn5u
PAYMENT_WALLET_DOT=0x93812EE085718eC2ae1cF33921020e9CE9E3f2dC
PAYMENT_WALLET_SOL=BHdJyRkTkxVRCqKWi8oKbcD2ijKFwXYeH1ZfogLcXxLb
```

**⚠️ Never commit your actual `.env` file to version control!**