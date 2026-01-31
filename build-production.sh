#!/bin/bash

echo "========================================="
echo "Production Build Script for alert.az"
echo "(Minimal-downtime deployment)"
echo "========================================="
echo ""

# Pull latest changes from git
echo "📥 Pulling latest changes from git..."
git pull

if [ $? -ne 0 ]; then
    echo "⚠️  WARNING: Git pull failed! Please resolve conflicts manually."
    exit 1
fi

echo "✓ Git pull completed"
echo ""

# Update build version and widget cache buster
echo "🔄 Updating build version..."
BUILD_VERSION=$(date +%s)
sed -i "s/NEXT_PUBLIC_BUILD_VERSION=.*/NEXT_PUBLIC_BUILD_VERSION=${BUILD_VERSION}/" .env.production
sed -i "s|NEXT_PUBLIC_SATIS_WIDGET_URL=.*|NEXT_PUBLIC_SATIS_WIDGET_URL=https://api.satis.az/widget.js?v=${BUILD_VERSION}|" .env.production
echo "✓ Build version set to: ${BUILD_VERSION}"
echo ""

# Install dependencies (incremental - no delete)
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

# Build to temp directory while old is still running
echo "🔨 Building new version (old version still serving)..."
DIST_DIR=.next-new NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build completed successfully!"
echo ""

# Copy old chunks to new build (so old clients still work)
echo "📦 Preserving old chunks for active users..."
if [ -d ".next/static/chunks" ]; then
    cp -r .next/static/chunks/* .next-new/static/chunks/ 2>/dev/null || true
fi

# Quick swap
echo "🔄 Quick swap..."
rm -rf .next-old
mv .next .next-old 2>/dev/null || true
mv .next-new .next

# Restart PM2
if pm2 list | grep -q "next.alert.az"; then
    echo "🔄 Restarting PM2..."
    pm2 restart next.alert.az
else
    echo "🚀 Starting PM2 on port 3032..."
    pm2 start npm --name next.alert.az -- start -- -p 3032
fi

# Cleanup
rm -rf .next-old

pm2 save

echo ""
echo "========================================="
echo "✅ Production deployment complete!"
echo "✅ Using API: https://api.alert.az"
echo "========================================="
echo ""
echo "📊 pm2 status next.alert.az"
echo "📜 pm2 logs next.alert.az"
