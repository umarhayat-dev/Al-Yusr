#!/bin/bash

echo "🚀 Starting Firebase deployment process..."

# Clean old builds
echo "🧹 Cleaning old build files..."
rm -rf dist/public
rm -rf functions/lib

# Build the frontend with Vite
echo "📦 Building React frontend..."
npm run build

# Check if frontend build was successful
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Install and build Firebase Functions
echo "🔧 Installing and building Firebase Functions..."
cd functions
npm install
npm run build

# Check if functions build was successful
if [ $? -ne 0 ]; then
    echo "❌ Functions build failed!"
    exit 1
fi

cd ..

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