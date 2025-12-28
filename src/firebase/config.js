import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Cloud Functions removed - not needed for free tier
// import { getFunctions } from 'firebase/functions';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAchG_Z-4Oha8S4eBelUUfHtyWxT_kI2gg",
  authDomain: "bus-tracker-266d9.firebaseapp.com",
  projectId: "bus-tracker-266d9",
  storageBucket: "bus-tracker-266d9.appspot.com",
  messagingSenderId: "298484294664",
  appId: "1:298484294664:web:7d90f422b4ba576fa09dbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Cloud Functions not available on free tier
// export const functions = getFunctions(app);
// export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Anonymous authentication helper
export const authenticateAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous auth error:', error);
    throw error;
  }
};

// FCM (Push Notifications) - Disabled for free tier
// Push notifications require Cloud Functions (Blaze plan)
// export const getFCMToken = async () => { ... }
// export const onMessageListener = () => { ... }

export default app;

