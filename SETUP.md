# Setup Guide

## Prerequisites

Before setting up the Bus Tracker application, ensure you have:

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Firebase CLI** installed globally
- **Google Cloud** account with billing enabled
- **Google Maps API** key

## Step 1: Firebase Project Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "bus-tracker")
4. Enable Google Analytics (optional)
5. Create project

### Enable Firebase Services

1. **Firestore Database**
   - Go to Firestore Database
   - Click "Create Database"
   - Start in production mode
   - Choose location (closest to your users)

2. **Authentication**
   - Go to Authentication
   - Click "Get Started"
   - Enable "Anonymous" sign-in method

3. **Cloud Functions**
   - Go to Functions
   - Click "Get Started"
   - Follow setup wizard
   - Enable billing (required for Cloud Functions)

4. **Cloud Messaging (FCM)**
   - Go to Cloud Messaging
   - Generate VAPID key (save for later)
   - Note your Server Key

5. **Hosting**
   - Go to Hosting
   - Click "Get Started"
   - Follow setup wizard

## Step 2: Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Library"
4. Enable "Maps JavaScript API"
5. Go to "Credentials"
6. Create API Key
7. Restrict API key to:
   - HTTP referrers (for web)
   - Maps JavaScript API only

## Step 3: Local Development Setup

### Clone and Install

```bash
# Navigate to project directory
cd bus-tracker

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Firebase CLI Login

```bash
firebase login
```

### Initialize Firebase

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Use existing project (select your project)

### Configure Firebase Config

1. Open `src/firebase/config.js`
2. Replace with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from:
- Firebase Console > Project Settings > General > Your apps

### Configure Google Maps API

1. Open `index.html`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key

### Configure FCM VAPID Key

1. Open `src/firebase/config.js`
2. Replace `YOUR_VAPID_KEY` with your VAPID key from Firebase Console

## Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Step 5: Create Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

## Step 6: Deploy Cloud Functions

```bash
cd functions
npm run deploy
# Or
firebase deploy --only functions
```

**Note**: First deployment may take 5-10 minutes.

## Step 7: Seed Initial Data (Optional)

Create initial routes and stops in Firestore:

### Routes Collection

```javascript
// routes/route-1
{
  name: "Campus Loop",
  description: "Main campus circular route",
  stops: ["stop-1", "stop-2", "stop-3"]
}
```

### Stops Collection

```javascript
// stops/stop-1
{
  routeId: "route-1",
  name: "Main Entrance",
  latitude: 37.7749,
  longitude: -122.4194,
  order: 1
}
```

### Buses Collection

```javascript
// buses/bus-1
{
  routeId: "route-1",
  name: "Bus 1",
  isActive: true,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: Date.now()
  },
  beaconCount: 0,
  lastUpdate: Timestamp
}
```

## Step 8: Build and Deploy Frontend

### Development

```bash
npm run dev
```

App will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Step 9: Verify Deployment

1. Visit your Firebase Hosting URL
2. Test anonymous authentication
3. Enable location permissions
4. Test beacon activation
5. Verify real-time updates

## Environment Variables

For local development, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

Update `src/firebase/config.js` to use:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

## Troubleshooting

### Cloud Functions Not Deploying

- Ensure billing is enabled
- Check Node.js version (18+)
- Review function logs: `firebase functions:log`

### Firestore Rules Errors

- Test rules in Firebase Console > Firestore > Rules
- Use Rules Playground to test queries

### Maps Not Loading

- Verify API key is correct
- Check API restrictions
- Ensure Maps JavaScript API is enabled
- Check browser console for errors

### Location Not Working

- Ensure HTTPS (required for geolocation)
- Check browser permissions
- Test on mobile device (more accurate GPS)

### Notifications Not Working

- Verify FCM setup
- Check VAPID key
- Ensure service worker is registered
- Test on supported browser

## Production Checklist

- [ ] Firebase project created
- [ ] All services enabled
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend built and deployed
- [ ] Google Maps API configured
- [ ] FCM configured
- [ ] Initial data seeded
- [ ] Security rules tested
- [ ] Performance tested
- [ ] Error monitoring set up

## Monitoring

### Firebase Console

- **Functions**: Monitor execution and errors
- **Firestore**: Monitor reads/writes
- **Analytics**: Track usage (if enabled)

### Cloud Functions Logs

```bash
firebase functions:log
```

### Real-time Monitoring

- Set up alerts in Firebase Console
- Monitor function execution times
- Track Firestore usage

## Cost Optimization

### Free Tier Limits

- Firestore: 50K reads/day, 20K writes/day
- Functions: 2M invocations/month
- Hosting: 10GB storage, 360MB/day transfer

### Optimization Tips

- Use Firestore indexes efficiently
- Minimize function invocations
- Cache data locally
- Use scheduled functions wisely
- Monitor usage in Firebase Console

## Support

For issues:
1. Check Firebase Console for errors
2. Review function logs
3. Check browser console
4. Verify all configurations
5. Review documentation

## Next Steps

After setup:
1. Test with multiple users
2. Monitor performance
3. Adjust update intervals if needed
4. Configure notifications
5. Set up admin dashboard access

