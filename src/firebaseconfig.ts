// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL-drvo3WysI1TNy4D_D4L0iSQYxE6XSg",
  authDomain: "batchbook-ea5ea.firebaseapp.com",
  projectId: "batchbook-ea5ea",
  storageBucket: "batchbook-ea5ea.firebasestorage.app",
  messagingSenderId: "409130724391",
  appId: "1:409130724391:web:92ff957c8f4c40b6ad3202",
  measurementId: "G-1T83S7Q73J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); // Export auth instance
export default app; // Export app instance