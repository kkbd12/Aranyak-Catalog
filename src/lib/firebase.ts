import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: (import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID) || rawConfig.projectId,
  appId: (import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID) || rawConfig.appId,
  apiKey: (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) || rawConfig.apiKey,
  authDomain: (import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || rawConfig.authDomain,
  firestoreDatabaseId: (import.meta.env && import.meta.env.VITE_FIREBASE_DATABASE_ID) || rawConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || rawConfig.storageBucket,
  messagingSenderId: (import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || rawConfig.messagingSenderId,
};

let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('Firebase initializeApp warning:', error);
  app = getApps()[0] || initializeApp(firebaseConfig);
}

let dbInstance: Firestore;
try {
  dbInstance = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (err) {
  console.warn('Custom databaseId initialization failed, falling back to default database:', err);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export { app };
