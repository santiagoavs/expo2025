# Backend Switching Guide

Simple backend switching for development and testing. **Render is the default backend** for all environments.

## 🚀 Quick Switch Methods

### Method 1: Using npm scripts (Recommended)
```bash
# Switch to local backend for testing
npm run dev:local

# Switch back to Render backend (default)
npm run dev:render
```

### Method 2: Using the switch script directly
```bash
# Switch to local backend for testing
node switch-backend.js local

# Switch back to Render backend (default)
node switch-backend.js render
```

### Method 3: Manual .env editing
Edit the `.env` file and change:
```env
VITE_BACKEND_MODE=render   # Default - Render backend (production)
VITE_BACKEND_MODE=local    # Testing - Local backend only
```

## 🌐 Backend URLs

- **Render (Default)**: `https://expo2025-8bjn.onrender.com/api`
- **Local (Testing)**: `http://localhost:4000/api`

## 📁 Configuration Files

- **`.env`** - Main configuration with `VITE_BACKEND_MODE` (defaults to render)
- **`.env.production`** - Production override (always render)
- **`switch-backend.js`** - Simple switching script
- **`src/api/apiClient.js`** - Axios client with backend detection
- **`vite.config.js`** - Vite proxy configuration

## ⚙️ How It Works

**Simple Logic:**
1. **Default**: All API calls go to Render backend
2. **Testing**: Set `VITE_BACKEND_MODE=local` to use local backend
3. **Production**: Always uses Render (enforced by `.env.production`)

**All API services automatically use the correct backend** - no hardcoded URLs anywhere.

## 📝 Important Notes

- ⚠️ **Always restart your dev server** after switching backends
- 🔒 **Local mode** requires your backend server running on `localhost:4000`
- ☁️ **Render mode** works immediately but may have cold start delays (30-60s)
- 🧪 **Use local mode** for testing new features and debugging
- 🚀 **Use Render mode** for production-like testing
- 🔄 **No hardcoded URLs** - all API calls use dynamic resolution

## 🔧 Troubleshooting

### Connection Errors

1. **For local mode**: 
   - Ensure your backend server is running on port 4000
   - Check backend console for errors
   - Verify CORS is configured for `localhost:5173`

2. **For Render mode**: 
   - Check if the Render service is awake (may take 30-60 seconds on first request)
   - Verify Render deployment is healthy
   - Check Render logs for errors

3. **General debugging**:
   - Check browser console for detailed API client logs
   - Verify `.env` file has correct `VITE_BACKEND_MODE` value
   - Ensure dev server was restarted after switching
   - Clear browser cache if seeing stale data

### Verification

After switching, verify the backend mode:
```bash
# Check .env file
cat .env | grep VITE_BACKEND_MODE

# Start dev server and check console output
npm run dev
# Look for: "🏠 [apiClient] Using LOCAL backend mode" or "☁️ [apiClient] Using RENDER backend mode"
```

## 🎯 Usage

**Normal Development (Default):**
```bash
npm run dev  # Uses Render backend by default
```

**Local Backend Testing:**
```bash
npm run dev:local  # Switch to local backend for testing
```

**Back to Default:**
```bash
npm run dev:render  # Switch back to Render backend
```

**Production:** Always uses Render backend automatically.
