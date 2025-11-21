#!/bin/bash

# Ethio Herd Connect - Deployment Script
# Deploy to Vercel for live testing

echo "🚀 Deploying Ethio Herd Connect MVP to Vercel..."
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📱 Your MVP is now live! Test these features:"
    echo "   🐄 Animal Registration (3-click flow)"
    echo "   🏪 Marketplace with posting fees"
    echo "   📢 Advertising banners"
    echo "   📹 Video verification workflow"
    echo "   🌐 Offline functionality"
    echo ""
    echo "🇪🇹 Ethiopian farmer-focused features:"
    echo "   • Amharic/English bilingual UI"
    echo "   • Ethiopian Birr pricing"
    echo "   • Local payment methods"
    echo "   • Rural connectivity optimization"
else
    echo "❌ Deployment failed!"
    exit 1
fi