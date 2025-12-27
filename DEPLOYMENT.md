# Deployment Guide

## ⚠️ Important: Always Run Commands from Project Root

**The project root is:** `C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER`

Always navigate to this directory before running npm or firebase commands.

## Quick Commands

### Navigate to Project Directory
```powershell
cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
```

### Install Dependencies
```powershell
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Development
```powershell
# Start development server
npm run dev
```

### Build for Production
```powershell
# Build frontend
npm run build
```

### Deploy to Firebase

```powershell
# Make sure you're in project root
cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy frontend (after building)
npm run build
firebase deploy --only hosting
```

### Deploy Everything at Once
```powershell
# Build frontend first
npm run build

# Deploy all Firebase services
firebase deploy
```

## Common Errors & Solutions

### Error: "Could not read package.json"
**Problem:** Running npm from wrong directory

**Solution:**
```powershell
# Always navigate to project root first
cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
# Then run your npm commands
```

### Error: "Firebase not initialized"
**Problem:** Firebase not logged in or project not initialized

**Solution:**
```powershell
firebase login
firebase init
```

### Error: "Functions deployment failed"
**Problem:** Billing not enabled or Node version mismatch

**Solution:**
- Enable billing in Firebase Console
- Check Node.js version (should be 18+, but 24+ also works)

### Error: "Maps not loading"
**Problem:** Google Maps API key not configured

**Solution:**
- Update `src/firebase/config.js` with your Firebase config
- Update Google Maps API key in environment or code

## Step-by-Step First Deployment

1. **Navigate to project directory**
   ```powershell
   cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
   ```

2. **Install dependencies**
   ```powershell
   npm install
   cd functions
   npm install
   cd ..
   ```

3. **Login to Firebase**
   ```powershell
   firebase login
   ```

4. **Initialize Firebase (if not done)**
   ```powershell
   firebase init
   ```

5. **Configure Firebase**
   - Update `src/firebase/config.js` with your config
   - Get config from Firebase Console > Project Settings

6. **Deploy Firestore rules**
   ```powershell
   firebase deploy --only firestore:rules
   ```

7. **Deploy indexes**
   ```powershell
   firebase deploy --only firestore:indexes
   ```

8. **Deploy Cloud Functions**
   ```powershell
   firebase deploy --only functions
   ```
   ⏱️ First deployment takes 5-10 minutes

9. **Build frontend**
   ```powershell
   npm run build
   ```

10. **Deploy frontend**
    ```powershell
    firebase deploy --only hosting
    ```

## Verification

After deployment, check:
- ✅ Firebase Console > Hosting - Your site URL
- ✅ Firebase Console > Functions - All functions deployed
- ✅ Firebase Console > Firestore - Rules active
- ✅ Visit your site and test functionality

## Troubleshooting

### Check Current Directory
```powershell
pwd  # PowerShell
# or
Get-Location  # PowerShell
```

### Verify Files Exist
```powershell
ls package.json  # Should show package.json
ls firebase.json  # Should show firebase.json
```

### Check Firebase Project
```powershell
firebase projects:list
firebase use <project-id>
```

## Tips

1. **Always start from project root** - Create a shortcut or bookmark
2. **Use VS Code terminal** - Opens in correct directory
3. **Check directory first** - Run `ls` or `dir` to verify
4. **Use relative paths** - Scripts handle subdirectories

## Environment Setup

For easier development, you can create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

Then update `src/firebase/config.js` to use:
```javascript
apiKey: import.meta.env.VITE_FIREBASE_API_KEY
```

---

**Remember:** Always navigate to the project root directory before running commands!

