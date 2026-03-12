import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnpvfFvRjs8ESEjxZfLhw0x47zP6QpBxY",
  authDomain: "budapestbingo.firebaseapp.com",
  projectId: "budapestbingo",
  storageBucket: "budapestbingo.firebasestorage.app",
  messagingSenderId: "102896914468",
  appId: "1:102896914468:web:992a845c7135ee7d7948b1",
  measurementId: "G-JMR22BKCJR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
