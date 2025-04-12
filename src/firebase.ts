// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd0UoZBRiuZ88QWE5q7ndcFfSIPdvD4lM",
  authDomain: "hrv-data-a12d2.firebaseapp.com",
  databaseURL: "https://hrv-data-a12d2-default-rtdb.firebaseio.com",
  projectId: "hrv-data-a12d2",
  storageBucket: "hrv-data-a12d2.firebasestorage.app",
  messagingSenderId: "1097049490189",
  appId: "1:1097049490189:web:1bdd18d1b5e2578a2b6644",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
