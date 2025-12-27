# How to Run Bus Tracker

## 🚀 Quick Start

### Option 1: Development Mode (Local Testing)

1. **Start the development server:**
   ```powershell
   npm run dev
   ```

2. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - Or manually visit: http://localhost:3000

3. **What you'll see:**
   - Home page with feature overview
   - Click "Track Buses" to see the tracker
   - Note: You'll need to configure Firebase first for full functionality

### Option 2: Production Build (Deploy to Firebase)

1. **Configure Firebase** (First time only):
   ```powershell
   # Login to Firebase
   npm run firebase:login
   
   # Initialize Firebase project
   npm run firebase:init
   ```

2. **Update Firebase Config:**
   - Open `src/firebase/config.js`
   - Replace placeholder values with your Firebase config
   - Get config from: Firebase Console > Project Settings > General > Your apps

3. **Update Google Maps API Key:**
   - Get API key from Google Cloud Console
   - Update in `src/components/BusTracker.jsx` (line with LoadScript)

4. **Build and Deploy:**
   ```powershell
   # Build the app
   npm run build
   
   # Deploy to Firebase Hosting
   npm run deploy:hosting
   ```

5. **Visit your deployed app:**
   - Check Firebase Console > Hosting for your URL
   - Usually: `https://YOUR_PROJECT_ID.web.app`

## 📋 Prerequisites Checklist

Before running, make sure you have:

- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Firebase account created
- [ ] Firebase project created
- [ ] Google Maps API key (for maps to work)
- [ ] Firebase config values (for database/auth to work)

## 🔧 Configuration Steps

### Step 1: Get Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Click ⚙️ (Settings) > Project Settings
4. Scroll to "Your apps" section
5. Click on Web app (</>) icon
6. Copy the config object

### Step 2: Update Firebase Config

Edit `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Library"
4. Enable "Maps JavaScript API"
5. Go to "Credentials" > Create API Key
6. Restrict key to: HTTP referrers + Maps JavaScript API

### Step 4: Update Maps API Key

Edit `src/components/BusTracker.jsx` (around line 140):

```javascript
<LoadScript googleMapsApiKey="YOUR_ACTUAL_MAPS_API_KEY">
```

Or use environment variable (recommended):

1. Create `.env.local` file:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

2. Update `src/firebase/config.js`:
```javascript
apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
```

## 🎯 Running Commands

### Development
```powershell
npm run dev              # Start dev server (http://localhost:3000)
```

### Build
```powershell
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Firebase
```powershell
npm run firebase:login   # Login to Firebase
npm run firebase:init    # Initialize Firebase project
npm run deploy           # Deploy everything
npm run deploy:hosting   # Deploy frontend only
npm run deploy:functions # Deploy Cloud Functions only
npm run deploy:firestore # Deploy Firestore rules only
```

## 🐛 Troubleshooting

### "Firebase not initialized"
- Make sure you've updated `src/firebase/config.js` with your actual config
- Check that your Firebase project exists

### "Maps not loading"
- Verify Google Maps API key is correct
- Check API key restrictions
- Ensure Maps JavaScript API is enabled

### "Location not working"
- App must run on HTTPS (Firebase Hosting provides this)
- Allow location permissions in browser
- Test on mobile device for better GPS accuracy

### "Functions not deploying"
- Ensure billing is enabled in Firebase Console
- Check Node.js version (18+)
- Review function logs: `npm run firebase` then check logs

## 📱 Testing the App

1. **Open the app** (dev or deployed)
2. **Allow location permissions** when prompted
3. **Click "Track Buses"**
4. **Select a bus** from the list
5. **Tap "I'm on the Bus"** to start beacon
6. **Watch real-time tracking** on the map

## 🎉 You're Ready!

The app should now be running. For full functionality:
- Configure Firebase (database, auth, functions)
- Add Google Maps API key
- Deploy Cloud Functions for backend features
- Seed initial data (routes, stops, buses)

See `SETUP.md` for detailed setup instructions.

