#!/bin/bash

echo "🧹 Cleaning old build files..."
rm -rf dist/client/*

echo "📦 Building React frontend..."
NODE_ENV=production vite build --outDir dist/client --mode production

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🗂️ Verifying build output..."
ls -la dist/client/

echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployment successful!"
    echo "🌍 Your updated site is live at: https://alyusrinstitute-net.web.app"
    echo "🔄 Cache cleared - fresh content should be visible"
else
    echo "❌ Deployment failed!"
    exit 1
fi