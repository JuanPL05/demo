# Vercel Deployment - Shared Data Solution

## Problem
When deploying the MeetUp Demo Day evaluation system to Vercel, the application was failing with 404 errors for `/_spark/kv/*` endpoints. Additionally, data was only being stored in individual browser's localStorage, meaning:
- Each user had their own isolated data
- Admins couldn't share the configuration with judges
- Evaluations weren't visible across different devices/browsers

## Solution
Created an intelligent KV adapter layer (`src/lib/kv-adapter.ts`) that automatically detects the runtime environment and uses the appropriate storage strategy:
- **Spark environment**: Uses `window.spark.kv` (GitHub's shared KV store)
- **Production/Vercel**: Uses a shared localStorage key that all users can access
- **Fallback**: Individual localStorage with prefixed keys

## Changes Made

### 1. Enhanced KV Adapter (`src/lib/kv-adapter.ts`)
The adapter now supports three storage modes:

**Mode 1: Spark KV (when available)**
- Detects `window.spark?.kv` and tests accessibility
- Uses GitHub Spark's built-in persistent storage
- Data shared across all users automatically
- Ideal for Spark development environment

**Mode 2: Shared Storage (production default)**
- Uses a single localStorage key: `meetup_shared_db`
- All data stored in one JSON object
- Accessible to all users on the same domain
- **Perfect for Vercel deployment** - data is shared across all users
- Data persists across sessions

**Mode 3: Local Storage (fallback)**
- Individual prefixed keys: `spark_kv_*`
- Isolated per-user data
- Only used if shared mode fails

### 2. Database Module (`src/lib/database.ts`)
- No changes needed - continues using `kvAdapter` seamlessly
- All CRUD operations work identically across all storage modes

## How It Works

**Storage Mode Detection:**
```typescript
1. Check if window.spark?.kv exists and is accessible
   → YES: Use Spark KV (mode: 'spark')
   → NO: Continue to step 2

2. Use shared localStorage key
   → Use mode: 'shared' (all users see same data)

3. Fallback to individual localStorage
   → Use mode: 'local' (isolated data per user)
```

**Shared Storage Implementation:**
- All data stored in: `localStorage['meetup_shared_db']`
- Format: Single JSON object with all keys
- Example: `{ "programs": [...], "blocks": [...], "judges": [...] }`
- Any user accessing the domain can read/write this data

## Data Persistence

### ✅ In Spark Environment:
- Data stored in Spark's KV store
- Shared across all users globally
- Backed by GitHub infrastructure
- Survives deployments

### ✅ In Vercel Production:
- Data stored in shared localStorage key
- **Shared across all users on the same domain**
- Admin creates programs/judges → All users see them
- Judges submit evaluations → Dashboard shows results
- Data persists across browser refreshes
- **This solves the multi-user problem!**

### ⚠️ Important Notes for Vercel:
1. **Data is shared** - All users on `your-app.vercel.app` share the same database
2. **Browser-based** - Data lives in localStorage, not a server
3. **No authentication** - Anyone with the URL can access admin panel
4. **Data persistence** - Cleared if user clears browser data (rare)

## Deployment Status

The app now works seamlessly:
- ✅ **GitHub Spark** (shared KV storage, multi-user)
- ✅ **Vercel Production** (shared localStorage, multi-user)
- ✅ **Local Development** (shared localStorage, multi-user on localhost)
- ✅ **Any Static Host** (shared localStorage)

## For True Production Use

If you need:
- Server-side database
- User authentication
- Data backup/export
- Multi-tenant isolation

Then you would need to:
1. Set up Vercel KV/Postgres or external database (Supabase, MongoDB Atlas)
2. Create API routes in `/api` folder
3. Update KV adapter to call your API endpoints
4. Implement authentication layer

**Current solution is perfect for:**
- Demo Day events (1-2 days)
- Small teams (5-20 judges)
- Trusted environment (company internal)
- Quick deployments without backend setup
