# Quick Start Guide

Get the Bus Tracker up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] Firebase account created
- [ ] Google Cloud billing enabled

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Login (30 sec)

```bash
firebase login
```

### 3. Initialize Firebase (1 min)

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions  
- ✅ Hosting
- Use existing project (or create new)

### 4. Configure (2 min)

**Update `src/firebase/config.js`:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // From Firebase Console
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... get from Firebase Console > Project Settings
};
```

**Update `index.html`:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry"></script>
```

**Get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable "Maps JavaScript API"
4. Create API key in Credentials

### 5. Deploy (30 sec)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions (first time: ~5 min)
firebase deploy --only functions

# Build and deploy frontend
npm run build
firebase deploy --only hosting
```

### 6. Seed Sample Data (Optional)

```bash
# Download service account key from Firebase Console
# Save as functions/serviceAccountKey.json
node scripts/seed-data.js
```

## Test It!

1. Visit your Firebase Hosting URL
2. Allow location permissions
3. Select a bus
4. Tap "I'm on the Bus"
5. See real-time tracking!

## Common Issues

**"Firebase not initialized"**
- Check `src/firebase/config.js` has correct values

**"Maps not loading"**
- Verify Google Maps API key in `index.html`
- Check API restrictions

**"Functions not working"**
- Ensure billing is enabled
- Check function logs: `firebase functions:log`

**"Location not working"**
- Must use HTTPS (Firebase Hosting provides this)
- Allow location permissions in browser

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [PRIVACY.md](PRIVACY.md) for privacy details

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed instructions
- Review Firebase Console for errors
- Check browser console for frontend errors
- Review function logs for backend errors

---

**You're all set! 🚀**

