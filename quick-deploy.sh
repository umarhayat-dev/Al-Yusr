#!/bin/bash

echo "🚀 Quick Firebase deployment process..."

# Clean old builds
echo "🧹 Cleaning old build files..."
rm -rf dist/public
rm -rf functions/lib

# Build frontend only with timeout protection
echo "📦 Building React frontend..."
timeout 300 vite build

# Check if frontend build was successful
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed or timed out!"
    exit 1
fi

# Verify the build output exists
if [ ! -d "dist/public" ]; then
    echo "❌ Build output directory dist/public not found!"
    exit 1
fi

echo "✅ Frontend build completed successfully"
echo "📁 Build output in dist/public:"
ls -la dist/public/

# Deploy to Firebase (hosting only)
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Your app is now live at: https://alyusrinstitute-net.web.app"
else
    echo "❌ Deployment failed!"
    exit 1
fi