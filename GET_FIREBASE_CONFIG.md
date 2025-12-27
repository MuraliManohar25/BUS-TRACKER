# How to Get Complete Firebase Config

Your project ID is: **bus-tracker-266d9**

## Quick Steps to Get Full Firebase Config

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **bus-tracker-266d9**

### Step 2: Get Web App Config
1. Click the ⚙️ (Settings) icon in the left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **</>** (Web) icon
   - Register app with a nickname (e.g., "Bus Tracker Web")
   - Click "Register app"
5. Copy the `firebaseConfig` object that appears

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "bus-tracker-266d9.firebaseapp.com",
  projectId: "bus-tracker-266d9",
  storageBucket: "bus-tracker-266d9.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Step 3: Update the Config File

Open `src/firebase/config.js` and replace with your complete config.

### Step 4: Enable Required Services

In Firebase Console, enable:

1. **Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose location

2. **Authentication:**
   - Go to Authentication
   - Click "Get started"
   - Enable "Anonymous" sign-in method

3. **Cloud Functions:**
   - Go to Functions
   - Click "Get started"
   - Enable billing (required for Cloud Functions)

4. **Hosting:**
   - Go to Hosting
   - Click "Get started"

## Already Updated

✅ **Project ID:** bus-tracker-266d9  
✅ **Google Maps API Key:** AIzaSyAI-igBUNSqOXz6aouzNTbL76uhBbttn_U

## Still Need

- Firebase API Key
- Messaging Sender ID  
- App ID

Get these from Firebase Console > Project Settings > Your apps > Web app config.

