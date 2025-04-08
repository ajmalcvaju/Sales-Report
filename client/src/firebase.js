// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-auth-b8864.firebaseapp.com",
  projectId: "mern-auth-b8864",
  storageBucket: "mern-auth-b8864.appspot.com",
  messagingSenderId: "612740382287",
  appId: "1:612740382287:web:db690e7fbd5aaa2257743a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);