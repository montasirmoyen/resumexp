import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "resumexp-a4afa.firebaseapp.com",
  projectId: "resumexp-a4afa",
  storageBucket: "resumexp-a4afa.firebasestorage.app",
  messagingSenderId: "142164689959",
  appId: "1:142164689959:web:f6519c9dda8511181c3a02",
  measurementId: "G-X6B4XR9C7F"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };