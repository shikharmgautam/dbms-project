import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqkWKdYCa25ULxVPLo-MKFMN04K7Z_VAI",
  authDomain: "ipap-66d4f.firebaseapp.com",
  projectId: "ipap-66d4f",
  storageBucket: "ipap-66d4f.firebasestorage.app",
  messagingSenderId: "975310342663",
  appId: "1:975310342663:web:557e0342ec004861a938a2",
  measurementId: "G-MJE91GWJSZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
