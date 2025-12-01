import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB7KgGZmkJyJ8tCaIzwsZx0C7IYYGOYM6o",
    authDomain: "conexionconfirebase-16b0d.firebaseapp.com",
    projectId: "conexionconfirebase-16b0d",
    storageBucket: "conexionconfirebase-16b0d.firebasestorage.app",
    messagingSenderId: "31893200422",
    appId: "1:31893200422:web:1b0d56b9aed74ca77fd0e7",
    measurementId: "G-Q2BXXH3KZW"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
