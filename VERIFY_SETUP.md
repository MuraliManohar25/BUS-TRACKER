# Firebase Setup Verification Guide

## ✅ What You've Done
- Accessed Firebase Console: https://console.firebase.google.com/project/bus-tracker-266d9/overview

## 🔍 Verify These Services Are Enabled

### 1. Firestore Database
**Check:** https://console.firebase.google.com/project/bus-tracker-266d9/firestore

**Status:**
- ✅ If you see a database with collections = **Ready**
- ⚠️ If you see "Create database" button = **Needs Setup**

**If not created:**
1. Click "Create database"
2. Start in **production mode**
3. Choose location (closest to your users)
4. Click "Enable"

### 2. Authentication
**Check:** https://console.firebase.google.com/project/bus-tracker-266d9/authentication

**Status:**
- ✅ If you see "Sign-in method" tab = **Ready**
- ⚠️ If you see "Get started" button = **Needs Setup**

**If not enabled:**
1. Click "Get started"
2. Go to "Sign-in method" tab
3. Click on "Anonymous"
4. Toggle "Enable"
5. Click "Save"

### 3. Cloud Functions (Optional - for backend features)
**Check:** https://console.firebase.google.com/project/bus-tracker-266d9/functions

**Status:**
- ✅ If you see functions list = **Ready**
- ⚠️ If you see "Get started" = **Needs Setup**

**If not enabled:**
1. Click "Get started"
2. Enable billing (required)
3. Wait for setup to complete

## 🚀 Next Steps After Verification

### Step 1: Deploy Firestore Rules
```powershell
npm run deploy:firestore
```

This deploys security rules so your app can read/write data.

### Step 2: (Optional) Deploy Cloud Functions
```powershell
npm run deploy:functions
```

This deploys backend functions for:
- Automatic location aggregation
- Server-side ETA calculations
- Automatic cleanup
- Admin statistics

**Note:** First deployment takes 5-10 minutes

### Step 3: Seed Initial Data (Optional)
If you want sample routes and stops:

1. Download service account key from Firebase Console:
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `functions/serviceAccountKey.json`

2. Run seed script:
   ```powershell
   node scripts/seed-data.js
   ```

## 🧪 Test Your Setup

1. **Open your app:** http://localhost:3000
2. **Open browser console** (F12)
3. **Check for errors:**
   - ✅ No Firestore errors = Database working
   - ✅ No auth errors = Authentication working
   - ⚠️ Permission errors = Rules need deployment

4. **Test features:**
   - Try clicking "Track Buses"
   - Try toggling "I'm on the Bus"
   - Check if data appears in Firestore console

## 📊 Quick Status Check

Run this in your browser console (F12) on your app:
```javascript
// Check Firebase connection
import { db, auth } from './firebase/config';
console.log('Firestore:', db);
console.log('Auth:', auth);
```

## ✅ Complete Setup Checklist

- [ ] Firestore Database created
- [ ] Anonymous Authentication enabled
- [ ] Firestore Rules deployed
- [ ] (Optional) Cloud Functions deployed
- [ ] (Optional) Initial data seeded
- [ ] App tested and working

## 🆘 Troubleshooting

### "Permission denied" error
→ Deploy Firestore rules: `npm run deploy:firestore`

### "Auth not enabled" error
→ Enable Anonymous auth in Firebase Console

### "Functions not found" error
→ Deploy functions: `npm run deploy:functions`

### No data showing
→ Check if Firestore is created and rules are deployed

