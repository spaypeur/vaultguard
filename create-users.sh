#!/bin/bash

echo "🔐 Creating VaultGuard Users..."
echo "================================"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Create Admin User
echo ""
echo "👤 Creating Admin User..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "spaypeur@gmail.com",
    "password": "31101986",
    "firstName": "System",
    "lastName": "Administrator",
    "phoneNumber": "+1-555-0100",
    "role": "admin",
    "jurisdiction": "US"
  }')

echo "$ADMIN_RESPONSE" | jq '.'

# Create Regular User
echo ""
echo "👤 Creating Regular User..."
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@vaultguard.com",
    "password": "User@123456",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-0200",
    "role": "client",
    "jurisdiction": "US"
  }')

echo "$USER_RESPONSE" | jq '.'

echo ""
echo "✅ User Creation Complete!"
echo "================================"
echo ""
echo "📧 Admin Credentials:"
echo "   Email: spaypeur@gmail.com"
echo "   Password: 31101986"
echo ""
echo "📧 User Credentials:"
echo "   Email: user@vaultguard.com"
echo "   Password: User@123456"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3002/api"
echo ""
