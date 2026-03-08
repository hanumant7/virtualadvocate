// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Your Firebase configuration (as provided)
const firebaseConfig = {
  apiKey: "AIzaSyANcz1FndpPpsWAqlzIoVnPZuGAfydWEnk",
  authDomain: "virtualadvocateprototype3.firebaseapp.com",
  projectId: "virtualadvocateprototype3",
  storageBucket: "virtualadvocateprototype3.firebasestorage.app",
  messagingSenderId: "235961614990",
  appId: "1:235961614990:web:2e0853afcfe50f61dbbfdf",
  measurementId: "G-V48657DRBK"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
