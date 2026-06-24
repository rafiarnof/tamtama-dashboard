// Firebase Configuration
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ============================================
// 🔥 FIREBASE CONFIG - GANTI DENGAN MILIK ANDA!
// ============================================
//
// Cara mendapatkan config:
// 1. Buka: https://console.firebase.google.com/
// 2. Pilih project Anda
// 3. Klik ⚙️ (Settings) → Project settings
// 4. Scroll ke bawah ke "Your apps"
// 5. Copy nilai dari firebaseConfig
// 6. Paste di bawah ini (ganti yang ada tanda panah ←)
//
// ATAU gunakan environment variables (.env file)
//
const firebaseConfig = {
  apiKey: "AIzaSyDeW9VN5CEePkJAiCWa4pFKmnPZhprfCUU",
  authDomain: "tamtamaproject.firebaseapp.com",
  projectId: "tamtamaproject",
  storageBucket: "tamtamaproject.firebasestorage.app",
  messagingSenderId: "278165926331",
  appId: "1:278165926331:web:4306b184dfae6d2846949e",
  measurementId: "G-NW3R6YPBN6"
};

// ============================================
// Jangan edit kode di bawah ini
// ============================================

// Initialize Firebase (hanya sekali, cegah duplicate app error)
export const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (opsional untuk future features)
export const auth = getAuth(app);

// Export config for debugging
export const getFirebaseConfig = () => {
  return {
    projectId: firebaseConfig.projectId,
    isConfigured: firebaseConfig.apiKey !== "YOUR_API_KEY",
  };
};