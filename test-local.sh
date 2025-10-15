#!/bin/bash

# VaultGuard Local Testing Script
# Run this to test everything works before deploying

echo "🛡️  VaultGuard Local Testing Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
echo ""

# Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version) installed${NC}"
echo ""

# Check frontend dependencies
echo "Checking frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Frontend dependencies not installed${NC}"
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi
echo ""

# Check backend dependencies
echo "Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Backend dependencies not installed${NC}"
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
fi
echo ""

# Check frontend .env
echo "Checking frontend environment variables..."
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠ Frontend .env file not found${NC}"
    echo "Creating frontend/.env from template..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
EOF
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ Frontend .env exists${NC}"
fi
echo ""

# Check backend .env
echo "Checking backend environment variables..."
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Backend .env file not found${NC}"
    echo "Please create backend/.env with required variables"
    echo "See DEPLOYMENT_GUIDE.md for details"
    exit 1
else
    echo -e "${GREEN}✓ Backend .env exists${NC}"
fi
echo ""

# Test frontend build
echo "Testing frontend build..."
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend builds successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    echo "Run 'cd frontend && npm run build' to see errors"
    exit 1
fi
cd ..
echo ""

# Test backend build
echo "Testing backend build..."
cd backend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend builds successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    echo "Run 'cd backend && npm run build' to see errors"
    exit 1
fi
cd ..
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Visit: http://localhost:5173"
echo ""
echo "Or deploy to production:"
echo "1. Read DEPLOYMENT_GUIDE.md"
echo "2. Deploy frontend to Vercel"
echo "3. Deploy backend to Railway"
echo ""
echo "Good luck! 🚀"
