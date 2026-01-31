#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="frontend"
NEW_DIR="${PARENT_DIR}/${APP_NAME}-new"
OLD_DIR="${PARENT_DIR}/${APP_NAME}-old"

echo "========================================="
echo "Zero-Downtime Deploy for alert.az"
echo "========================================="

# 1. Pull latest in current folder
cd "$SCRIPT_DIR"
git pull || exit 1

# 2. Update build version
BUILD_VERSION=$(date +%s)
sed -i "s/NEXT_PUBLIC_BUILD_VERSION=.*/NEXT_PUBLIC_BUILD_VERSION=${BUILD_VERSION}/" .env.production
sed -i "s|NEXT_PUBLIC_SATIS_WIDGET_URL=.*|NEXT_PUBLIC_SATIS_WIDGET_URL=https://api.satis.az/widget.js?v=${BUILD_VERSION}|" .env.production

# 3. Copy to new folder
rm -rf "$NEW_DIR"
cp -r "$SCRIPT_DIR" "$NEW_DIR"

# 4. Build in new folder (old keeps running)
cd "$NEW_DIR"
rm -rf .next node_modules
npm install || exit 1
NODE_ENV=production npm run build || exit 1

# 5. Quick swap
cd "$PARENT_DIR"
rm -rf "$OLD_DIR"
mv "$SCRIPT_DIR" "$OLD_DIR"
mv "$NEW_DIR" "$SCRIPT_DIR"

# 6. Restart PM2
cd "$SCRIPT_DIR"
pm2 restart next.alert.az || pm2 start npm --name next.alert.az -- start -- -p 3032
pm2 save

# 7. Cleanup
rm -rf "$OLD_DIR"

echo "Done! Build version: ${BUILD_VERSION}"
