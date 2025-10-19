# Production Build Scripts

## Available Scripts

### 1. `./build-production.sh` - Normal Production Build
Use this for **live production** with real users.

**Features:**
- ✅ Debug mode OFF - no error details exposed
- ✅ Optimized for performance
- ✅ No source maps (smaller bundle size)
- ✅ Pulls latest code from git
- ✅ Cleans and rebuilds everything
- ✅ Auto-restarts PM2

**Usage:**
```bash
cd /root/next.kredit.az
./build-production.sh
```

---

### 2. `./build-production-debug.sh` - Debug Build
Use this for **testing/staging** when you need to debug issues.

**Features:**
- ⚠️ Debug mode ON - shows full error details
- ⚠️ Source maps enabled - see actual file names in errors
- ⚠️ Custom error pages with stack traces
- ⚠️ Better debugging in browser console
- ✅ Same build process as production
- ✅ Protected by basic auth

**Usage:**
```bash
cd /root/next.kredit.az
./build-production-debug.sh
```

**When to use:**
- When debugging production issues
- During testing phase
- When you need to see detailed error messages
- To identify exact line numbers of errors

---

## Important Notes

### Cache Issues
If users still see old version after deployment:
1. Clear nginx cache in WHM → NGINX® Manager → Clear Cache for All Users
2. Users may need to hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Environment Variables
Both scripts manage these automatically:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Frontend URL  
- `NEXT_PUBLIC_DEBUG_MODE` - true/false (controlled by script)
- `NEXT_PUBLIC_BUILD_VERSION` - Unique timestamp for cache busting

### PM2 Commands
```bash
pm2 status next.kredit.az  # Check if running
pm2 logs next.kredit.az     # View logs
pm2 restart next.kredit.az  # Restart app
pm2 stop next.kredit.az     # Stop app
```

### Basic Auth
Username: `admin`
Password: `Baku2025`

## Quick Reference

| Scenario | Use Script |
|----------|-----------|
| Go live with real users | `./build-production.sh` |
| Testing with team | `./build-production-debug.sh` |
| Debug production issue | `./build-production-debug.sh` |
| Final production deploy | `./build-production.sh` |