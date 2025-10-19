# Next.js Production Debugging Guide

## Quick Start - Enable Debug Mode

On production server:
```bash
./build-production-debug.sh
```

This will enable:
- Source maps in production
- Detailed error pages
- Stack traces in browser console
- Component error boundaries

## Debug Features Enabled

### 1. Source Maps
- `productionBrowserSourceMaps: true` in next.config.mjs
- Shows actual source code locations in browser DevTools
- Makes debugging minified code much easier

### 2. Error Pages
- `/app/[lang]/error.tsx` - Catches page-level errors
- `/app/global-error.tsx` - Catches app-wide errors
- Shows full error messages, stack traces, and error IDs

### 3. Browser Console
When debug mode is enabled, you'll see:
- Full error stack traces
- Component names where errors occurred
- Line numbers from source files (not minified)

## How to Debug Production Errors

### 1. Check Browser Console
Press F12 and look at Console tab for:
- Red error messages with stack traces
- Warning messages
- API call failures

### 2. Check Network Tab
Look for:
- Failed API calls (404, 500 errors)
- Slow responses
- CORS issues

### 3. Check PM2 Logs
```bash
pm2 logs next.kredit.az --lines 100
```

### 4. Check Next.js Server Logs
```bash
cd /root/next.kredit.az
tail -f .next/server/logs/*.log
```

## Common Issues and Solutions

### "map is not a function"
**Cause**: API returns non-array data
**Solution**: Add Array.isArray() checks before .map()
```javascript
// Bad
data.map(item => ...)

// Good
Array.isArray(data) && data.map(item => ...)
```

### "Cannot read property of undefined"
**Cause**: Accessing nested properties without checks
**Solution**: Use optional chaining
```javascript
// Bad
data.user.name

// Good
data?.user?.name
```

### API 404 Errors
**Cause**: Endpoint doesn't exist in backend
**Solution**: Check Laravel routes or add fallback data

## Disable Debug Mode for Production

**IMPORTANT**: Before going live with real users:

1. Edit `.env.production`:
```env
NEXT_PUBLIC_DEBUG_MODE=false
```

2. Run normal production build:
```bash
./build-production.sh
```

3. Remove source maps by editing `next.config.mjs`:
```javascript
productionBrowserSourceMaps: false
```

## Environment Variables

- `NEXT_PUBLIC_DEBUG_MODE=true` - Shows detailed errors
- `NODE_ENV=production` - Production mode (set automatically)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Frontend URL

## Error Tracking Services (Optional)

For production, consider adding:
- Sentry: `npm install @sentry/nextjs`
- LogRocket: `npm install logrocket`
- Bugsnag: `npm install @bugsnag/js @bugsnag/plugin-react`

These services provide:
- Real-time error alerts
- User session replay
- Performance monitoring
- Error grouping and trends