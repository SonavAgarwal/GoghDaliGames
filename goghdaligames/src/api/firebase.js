// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA42Niay7uNcTIPr5fQ_189PcSMGfzLAYY",
    authDomain: "goghdaligames.firebaseapp.com",
    projectId: "goghdaligames",
    storageBucket: "goghdaligames.appspot.com",
    messagingSenderId: "1005031983809",
    appId: "1:1005031983809:web:8ec19215f2d674d3056240",
    measurementId: "G-0F3DHKNKYX",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
export const db = getFirestore();
export const analytics = getAnalytics(firebase);
