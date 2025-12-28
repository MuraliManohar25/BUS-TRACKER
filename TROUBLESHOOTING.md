# Troubleshooting Guide

## Issues Fixed

### ✅ Maps Not Loading
**Problem:** Google Maps API key was incorrectly accessed  
**Fix:** Changed from invalid `import.meta.env.AIzaSy...` to proper `import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAI-igBUNSqOXz6aouzNTbL76uhBbttn_U"`

### ✅ Toggle Button Not Working
**Problem:** Toggle might fail if no bus selected or services not initialized  
**Fix:** Added proper error handling and validation

### ⚠️ Backend Not Working
**Problem:** Firestore not set up or rules not deployed  
**Solution:** See setup steps below

## Quick Fixes

### 1. Maps Still Not Loading?

Check browser console (F12) for errors:
- "Google Maps API key" error → API key issue
- "LoadScript" error → Check network connection
- No errors but blank map → Check API key restrictions in Google Cloud Console

**Verify API Key:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Check if key is active
3. Verify "Maps JavaScript API" is enabled
4. Check API key restrictions

### 2. Toggle Button Still Not Working?

**Check:**
1. Open browser console (F12)
2. Look for errors when clicking toggle
3. Common errors:
   - "Permission denied" → Firestore rules not deployed
   - "No bus selected" → Select a bus first
   - "Services not initialized" → Refresh page

**Quick Test:**
- Check if `selectedBus` is set (should see bus name in top bar)
- Check if location permission is granted
- Check browser console for specific error messages

### 3. Backend Not Working?

**Symptoms:**
- Toggle works but data doesn't save
- No real-time updates
- "Permission denied" errors

**Solutions:**

**Option A: Deploy Firestore Rules (Recommended)**
```cmd
# Use Command Prompt (not PowerShell)
cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
npx firebase-tools deploy --only firestore:rules
```

**Option B: Deploy Rules Manually**
1. Go to: https://console.firebase.google.com/project/bus-tracker-266d9/firestore/rules
2. Copy contents of `firestore.rules` file
3. Paste into console
4. Click "Publish"

**Option C: Test Without Backend**
- App will work in offline mode
- Toggle will show errors but won't crash
- Location tracking works locally

## Testing Checklist

- [ ] Maps load (see Google Maps)
- [ ] Toggle button responds to clicks
- [ ] Location permission requested
- [ ] No console errors
- [ ] Bus data loads (or shows default)
- [ ] Toggle changes state visually

## Common Errors & Solutions

### "Permission denied" in console
→ Deploy Firestore rules (see above)

### "Auth not enabled"
→ Enable Anonymous auth in Firebase Console

### "Maps API key invalid"
→ Check API key in Google Cloud Console

### "No buses found"
→ App creates default bus for testing
→ Or seed data using `scripts/seed-data.js`

### Toggle doesn't change state
→ Check browser console for errors
→ Verify `selectedBus` is set
→ Check if location permission granted

## Still Having Issues?

1. **Open browser console** (F12)
2. **Copy all error messages**
3. **Check Network tab** for failed requests
4. **Verify Firebase services** are enabled:
   - Firestore: https://console.firebase.google.com/project/bus-tracker-266d9/firestore
   - Auth: https://console.firebase.google.com/project/bus-tracker-266d9/authentication

## Quick Test Commands

In browser console (F12):
```javascript
// Check Firebase connection
console.log('Firestore:', window.firebase?.firestore);
console.log('Auth:', window.firebase?.auth);

// Check if services initialized
console.log('User ID:', localStorage.getItem('firebase:authUser'));
```

