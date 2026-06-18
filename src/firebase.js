import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC72K-GIrcNgwMkd29QPgWk7FJEFaubp4M",
  authDomain: "tickets-b13d6.firebaseapp.com",
  projectId: "tickets-b13d6",
  storageBucket: "tickets-b13d6.firebasestorage.app",
  messagingSenderId: "93296978878",
  appId: "1:93296978878:web:b8a2a54b24878e866727ef",
  measurementId: "G-GECS71XGK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
