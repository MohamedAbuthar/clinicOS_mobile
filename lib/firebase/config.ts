// Firebase Configuration for React Native
// Using the same Firebase project as the web application
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Same Firebase configuration as your web app
const firebaseConfig = {
  apiKey: "AIzaSyCxiNhzHX_GqL67RSzwXuEl1ODz84GtYww",
  authDomain: "areal-59464.firebaseapp.com",
  projectId: "areal-59464",
  storageBucket: "areal-59464.firebasestorage.app",
  messagingSenderId: "715403586937",
  appId: "1:715403586937:web:3940b4a3061776d7b4d3a8",
  measurementId: "G-4ZW4YH22PX"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize if not already initialized
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app);
  
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
export default app;
