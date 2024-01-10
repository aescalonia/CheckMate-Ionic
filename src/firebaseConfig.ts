// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHKS85vu0oKGMWjHg6Qo7h8iaJEfVJRSU",
  authDomain: "checkmate-b832c.firebaseapp.com",
  projectId: "checkmate-b832c",
  storageBucket: "checkmate-b832c.appspot.com",
  messagingSenderId: "681860610035",
  appId: "1:681860610035:web:4ef17a011ddc81e611c486",
  measurementId: "G-Y81B5WL7F6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);


export { app, analytics, auth, database };
