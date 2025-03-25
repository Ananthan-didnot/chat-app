// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXkLsRPislcx3wklP10dzaSjDZauEJh-w",
  authDomain: "chatapp-a671c.firebaseapp.com",
  projectId: "chatapp-a671c",
  storageBucket: "chatapp-a671c.firebasestorage.app",
  messagingSenderId: "626403431572",
  appId: "1:626403431572:web:c6c36c29430f3dd0f55081",
  measurementId: "G-3YZFFZ9J9L"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Initialize Auth
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Google Auth Provider
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  display: 'popup',
  prompt: 'select_account'
});

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Multiple tabs open, persistence disabled');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('Browser doesn\'t support persistence');
    }
  });
