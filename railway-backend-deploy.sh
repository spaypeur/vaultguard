#!/bin/bash

# VaultGuard Backend Deployment to Railway (Free Tier)
# This script helps deploy the backend to Railway's free tier

echo "🚀 VaultGuard Backend - Railway Deployment Setup"
echo "================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    # Install Railway CLI
    curl -fsSL https://railway.app/install.sh | sh
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

echo "📋 Pre-deployment checklist:"
echo "1. Sign up at https://railway.app (free account)"
echo "2. Connect your GitHub account to Railway"
echo "3. Make sure you have your Supabase credentials ready"
echo ""

echo "🔧 Setting up Railway project..."

# Navigate to backend directory
cd backend

# Initialize Railway project
echo "Initializing Railway project..."
railway login

# Create new project
railway link

echo "🌍 Setting environment variables..."
echo "Please set these environment variables in Railway dashboard:"
echo ""
echo "NODE_ENV=production"
echo "PORT=\$PORT"
echo "SUPABASE_URL=your-supabase-url"
echo "SUPABASE_ANON_KEY=your-supabase-anon-key"
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "JWT_SECRET=your-jwt-secret-32-chars-minimum"
echo "JWT_REFRESH_SECRET=your-refresh-secret-32-chars-minimum"
echo "FRONTEND_URL=https://your-vercel-domain.vercel.app"
echo "COOKIE_SECRET=your-cookie-secret"
echo ""

echo "📝 Creating railway.json for automatic deployment..."
cat > railway.json << 'EOL'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
EOL

echo "📝 Creating Procfile for Railway..."
cat > Procfile << 'EOL'
web: npm start
EOL

echo "🔧 Updating package.json scripts..."
# Add build and start scripts for Railway
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.build = 'npx tsc';
pkg.scripts.start = 'node dist/index.js';
pkg.scripts.postinstall = 'npm run build';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "✅ Railway setup complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to Railway dashboard and connect this repository"
echo "3. Set the environment variables in Railway dashboard"
echo "4. Deploy will happen automatically"
echo ""
echo "💡 Your Railway backend URL will be: https://your-project-name.up.railway.app"
echo "Use this URL in your Vercel frontend environment variables (VITE_API_URL)"

cd ..