#!/bin/bash

# VaultGuard Production Deployment Script
# This script deploys VaultGuard to Kubernetes with production Supabase credentials

set -e

echo "🚀 Deploying VaultGuard to Kubernetes (Production)"

# Apply configurations in order
echo "📦 Creating namespace..."
kubectl apply -f deployment.yaml  # Contains namespace

echo "🔐 Creating secrets..."
kubectl apply -f secret.yaml

echo "💾 Creating persistent volume claim..."
kubectl apply -f deployment.yaml  # Contains PVC

echo "🌐 Creating services..."
kubectl apply -f deployment.yaml  # Contains services

echo "⚙️ Creating deployments..."
kubectl apply -f deployment.yaml  # Contains deployments

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/vaultguard-backend -n vaultguard
kubectl wait --for=condition=available --timeout=300s deployment/vaultguard-frontend -n vaultguard
kubectl wait --for=condition=available --timeout=300s deployment/vaultguard-redis -n vaultguard

echo "✅ Deployment completed!"
echo ""
echo "🔍 Check deployment status:"
echo "kubectl get pods -n vaultguard"
echo "kubectl get services -n vaultguard"
echo ""
echo "📊 View logs:"
echo "kubectl logs -f deployment/vaultguard-backend -n vaultguard"
echo ""
echo "🌐 Get frontend URL:"
echo "kubectl get svc vaultguard-frontend -n vaultguard"