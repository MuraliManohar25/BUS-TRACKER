# Deployment Fix Guide

## Issues Fixed

### 1. ✅ Chunk Size Warning
**Fixed:** Optimized Vite build configuration to split large chunks into smaller bundles.

### 2. ✅ Firebase CLI Not Found
**Fixed:** Updated all scripts to use `npx firebase-tools` instead of requiring global installation.

## Updated Commands

### Using npx (No Global Install Required)

All Firebase commands now use `npx firebase-tools` which automatically downloads and runs Firebase CLI:

```powershell
# Login to Firebase
npm run firebase:login

# Initialize Firebase (if not done)
npm run firebase:init

# Deploy everything
npm run deploy

# Deploy individually
npm run deploy:hosting     # Frontend only
npm run deploy:functions   # Functions only
npm run deploy:firestore   # Firestore rules only
```

### Direct npx Commands

You can also use npx directly:

```powershell
# Login
npx firebase-tools login

# Initialize
npx firebase-tools init

# Deploy
npx firebase-tools deploy
```

## Build Optimization

The build is now optimized with code splitting:
- React vendor bundle
- Firebase vendor bundle  
- Maps vendor bundle
- Charts vendor bundle

This reduces initial load time and improves performance.

## Step-by-Step Deployment

1. **Navigate to project directory**
   ```powershell
   cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
   ```

2. **Login to Firebase (first time only)**
   ```powershell
   npm run firebase:login
   ```

3. **Initialize Firebase (if not done)**
   ```powershell
   npm run firebase:init
   ```

4. **Build frontend**
   ```powershell
   npm run build
   ```

5. **Deploy**
   ```powershell
   npm run deploy
   ```

## Alternative: Install Firebase CLI Globally

If you prefer global installation, you can try:

```powershell
# Using npm
npm install -g firebase-tools

# Or using chocolatey (if installed)
choco install firebase-tools

# Or download installer from:
# https://firebase.tools/bin/win/instant
```

But **npx is recommended** as it doesn't require global installation and always uses the latest version.

## Troubleshooting

### If npx fails:
1. Clear npm cache: `npm cache clean --force`
2. Update npm: `npm install -g npm@latest`
3. Try again with npx

### If build warnings persist:
The chunk size warning is now just informational. The build will still work fine. The optimization splits code into smaller chunks automatically.

## Next Steps

1. Run `npm run build` - should complete without errors
2. Run `npm run firebase:login` - login to Firebase
3. Run `npm run deploy` - deploy everything

All set! 🚀

