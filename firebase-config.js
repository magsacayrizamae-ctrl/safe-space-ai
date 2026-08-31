

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAXjYReIsMR0-3AD5KZm8hT6dvN8ojd6Gc",
  authDomain: "safespace-sip.firebaseapp.com",
  projectId: "safespace-sip",
  storageBucket: "safespace-sip.firebasestorage.app",
  messagingSenderId: "700789227427",
  appId: "1:700789227427:web:990e063abb6b35cfe3a416",
  measurementId: "G-LRCJRYDE6Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };





