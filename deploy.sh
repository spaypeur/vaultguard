#!/bin/bash

# Configuration
HOSTING_USER="vaultgua"
HOSTING_SERVER="panel.freehosting.com"
HOSTING_IP="195.201.179.80"
PUBLIC_HTML="/home/vaultgua/public_html"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting deployment to vaultguard.io..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Build backend
echo "📦 Building backend..."
cd ../backend
npm run build || {
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Backend built successfully${NC}"

# Create deployment directory
echo "📁 Creating deployment structure..."
mkdir -p deploy/public_html

# Copy frontend files
echo "📂 Copying frontend files..."
cp -r frontend/dist/* deploy/public_html/

# Copy backend files
echo "📂 Copying backend files..."
mkdir -p deploy/backend
cp -r backend/dist/* deploy/backend/
cp backend/package.json deploy/backend/
cp backend/.env deploy/backend/ 2>/dev/null || echo "⚠️  Warning: No .env file found"

# Create deployment archive
echo "📦 Creating deployment archive..."
cd deploy
tar -czf ../vaultguard-deploy.tar.gz *

echo -e "${GREEN}✅ Deployment package created successfully${NC}"
echo "
🔷 Next steps:
1. Log in to panel.freehosting.com:2222/evo/
2. Go to File Manager
3. Navigate to public_html
4. Upload the frontend files from 'frontend/dist'
5. Set up your Node.js backend:
   - Create a new Node.js application
   - Upload the backend files
   - Set environment variables
   - Start the backend service

📝 Important notes:
- Domain: vaultguard.io
- Server: ${HOSTING_SERVER}
- IP: ${HOSTING_IP}
- Username: ${HOSTING_USER}
- Public HTML path: ${PUBLIC_HTML}

⚠️  Remember to:
1. Configure environment variables in the hosting panel
2. Set up SSL certificate if available
3. Configure domain DNS settings if not already done
4. Test the website after deployment

Need help? Check the hosting panel's documentation or contact support.
"