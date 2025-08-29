// Import the functions you need from the SDKs you need
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCalXAAWqu69rdE9-mLuww81lYohd1qDy8",
  authDomain: "thetalkofthepast.firebaseapp.com",
  projectId: "thetalkofthepast",
  storageBucket: "thetalkofthepast.firebasestorage.app",
  messagingSenderId: "902132034312",
  appId: "1:902132034312:web:a926dbec0d18a3fd56dabd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { googleProvider };