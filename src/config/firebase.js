import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 🚀 ИНСТРУКЦИЯ:
// Замените значения ниже на свои конфигурационные данные из Firebase Console
// Следуйте FIREBASE_SETUP_KY.md для получения ключей

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const isFirebaseReady = requiredKeys.every((key) => {
  const value = firebaseConfig[key];
  return Boolean(value) && !String(value).includes('your_');
});

if (!isFirebaseReady) {
  console.error(
    'Firebase config missing or invalid. Copy .env.example to .env.local and fill in VITE_FIREBASE_* values from your Firebase Console.'
  );
}

let app = null;
let db = null;
let auth = null;
let provider = null;
let storage = null;

if (isFirebaseReady) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  storage = getStorage(app);

  auth.languageCode = 'ru';

  console.log('✅ Firebase инициализирован');
  console.log('📝 Project ID:', firebaseConfig.projectId);
}

export { app, db, auth, provider, storage, isFirebaseReady };
