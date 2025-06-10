#!/bin/bash
# Firebase deployment script for AlYusr Institute

echo "🔥 Starting Firebase deployment process..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Copy shared schema to functions
echo "📋 Copying shared schema to functions..."
mkdir -p functions/src/shared
cp shared/schema.ts functions/src/shared/

# Build Firebase functions
echo "🔧 Building Firebase functions..."
cd functions
npm install
npm run build
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"