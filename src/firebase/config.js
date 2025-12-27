import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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
export const functions = getFunctions(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

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

// FCM token helper
export const getFCMToken = async () => {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    return token;
  } catch (error) {
    console.error('FCM token error:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) return Promise.resolve();
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default app;

