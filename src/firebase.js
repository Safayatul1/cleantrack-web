// src/firebase.js

// Import core SDK
import { initializeApp } from "firebase/app";

// Import Firestore
import { getFirestore } from "firebase/firestore";

// (Optional) Analytics, if you want it later
// import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBy6kRpmIVyfx8CNFL9cmjJAryIxDnCtJ4",
  authDomain: "cleantrack-c9d93.firebaseapp.com",
  projectId: "cleantrack-c9d93",
  storageBucket: "cleantrack-c9d93.appspot.com", // fix: add ".appspot.com"
  messagingSenderId: "12970250860",
  appId: "1:12970250860:web:a1b7545a56a08d19927e49",
  measurementId: "G-4FSF31PM5R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore
export { db };
