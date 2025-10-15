#!/bin/bash

# VaultGuard Deployment Verification Script
echo "🔍 VaultGuard Deployment Verification"
echo "===================================="

# Check if vercel.json exists in frontend directory
echo "1. Checking vercel.json configuration..."
if [ -f "frontend/vercel.json" ]; then
    echo "✅ vercel.json found in frontend directory"
else
    echo "❌ vercel.json not found in frontend directory"
    exit 1
fi

# Check if .env.example files exist
echo "2. Checking environment configuration files..."
if [ -f ".env.example" ]; then
    echo "✅ Root .env.example found"
else
    echo "❌ Root .env.example not found"
fi

if [ -f "frontend/.env.example" ]; then
    echo "✅ Frontend .env.example found"
else
    echo "❌ Frontend .env.example not found"
fi

if [ -f "backend/.env.example" ]; then
    echo "✅ Backend .env.example found"
else
    echo "❌ Backend .env.example not found"
fi

# Check if deployment guide exists
echo "3. Checking deployment documentation..."
if [ -f "Vercel-Deployment-Guide.md" ]; then
    echo "✅ Deployment guide found"
else
    echo "❌ Deployment guide not found"
fi

# Check if frontend package.json has correct build scripts
echo "4. Checking frontend build configuration..."
if [ -f "frontend/package.json" ]; then
    if grep -q '"build": "tsc && vite build"' frontend/package.json; then
        echo "✅ Frontend build script found"
    else
        echo "❌ Frontend build script not configured correctly"
    fi
else
    echo "❌ Frontend package.json not found"
fi

# Check if vite.config.ts has production optimizations
echo "5. Checking Vite configuration..."
if [ -f "frontend/vite.config.ts" ]; then
    if grep -q "minify: 'terser'" frontend/vite.config.ts; then
        echo "✅ Vite production optimizations found"
    else
        echo "⚠️  Vite production optimizations may need review"
    fi
else
    echo "❌ Vite config not found"
fi

# Check for proper directory structure
echo "6. Checking repository structure..."
if [ -d "frontend" ] && [ -d "backend" ]; then
    echo "✅ Proper monorepo structure detected"
else
    echo "❌ Invalid repository structure"
fi

# Check if API configuration is properly set up for external backend
echo "7. Checking API configuration..."
if grep -q "VITE_API_URL" frontend/.env.example; then
    echo "✅ API URL configuration found in frontend"
else
    echo "❌ API URL configuration missing"
fi

echo ""
echo "🎉 Deployment verification complete!"
echo ""
echo "Next steps:"
echo "1. Set up your backend hosting (Railway, DigitalOcean, etc.)"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Update VITE_API_URL to point to your backend domain"
echo "4. Deploy frontend to Vercel"
echo ""
echo "Refer to Vercel-Deployment-Guide.md for detailed instructions."