#!/bin/bash

echo "========================================="
echo "Production Build Script - DEBUG MODE"
echo "========================================="
echo ""
echo "⚠️  WARNING: Debug mode exposes error details!"
echo "⚠️  Only use while testing with auth protection!"
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

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "Creating .env.production file with debug mode..."
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.kredit.az/api
NEXT_PUBLIC_SITE_URL=https://kredit.az
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_BUILD_VERSION=$(date +%s)
EOF
    echo "✓ .env.production file created with debug mode"
else
    # Update build version and ensure debug mode is ON
    BUILD_VERSION=$(date +%s)
    echo "📝 Setting build version: $BUILD_VERSION"
    sed -i "s/NEXT_PUBLIC_BUILD_VERSION=.*/NEXT_PUBLIC_BUILD_VERSION=$BUILD_VERSION/" .env.production
    sed -i "s/NEXT_PUBLIC_DEBUG_MODE=.*/NEXT_PUBLIC_DEBUG_MODE=true/" .env.production
    echo "✓ Debug mode: ON"
fi

echo ""
echo "Environment configuration:"
grep -E "API_URL|SITE_URL|DEBUG_MODE" .env.production
echo ""

# Clean build and dependencies
echo "🧹 Cleaning old build and dependencies..."
rm -rf .next
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run the build with source maps enabled for debugging
echo "🔨 Building production bundle with source maps..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build completed successfully with debug mode!"
echo ""

# Check if PM2 process exists
if pm2 list | grep -q "next.kredit.az"; then
    echo "🔄 Restarting existing PM2 process..."
    pm2 restart next.kredit.az
else
    echo "🚀 Starting new PM2 process on port 3030..."
    pm2 start npm --name next.kredit.az -- start -- -p 3030
fi

# Save PM2 configuration
pm2 save

echo ""
echo "✅ Debug deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Debug mode is enabled!"
echo "   - Error pages show full stack traces"
echo "   - Source maps are enabled for debugging"
echo "   - Browser console shows actual file names and line numbers"
echo ""
echo "⚠️  To disable debug mode, run: ./build-production.sh"
echo ""
echo "Check status with: pm2 status next.kredit.az"
echo "View logs with: pm2 logs next.kredit.az"
echo "View errors in browser console with detailed stack traces"
echo ""
echo "Note: Clear nginx cache in WHM if users see old version"