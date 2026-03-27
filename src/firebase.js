import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "sai-rolotech-offical.firebaseapp.com",
  projectId: "sai-rolotech-offical",
  storageBucket: "sai-rolotech-offical.firebasestorage.app",
  messagingSenderId: "1090230838763",
  appId: "1:1090230838763:web:63f4db80f4b02c414465ae",
  measurementId: "G-9PFFRCCP7F",
};

export const isFirebaseConfigured = Boolean(apiKey && apiKey.startsWith("AIzaSy"));

let auth = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (e) {
    console.warn("Firebase init failed:", e.message);
  }
}

export { auth };
