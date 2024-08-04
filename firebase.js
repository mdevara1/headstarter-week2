// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjeiYjYd-vqPl01qfVTgHU8nyGXAxy-BM",
  authDomain: "food-pantry-cbbd3.firebaseapp.com",
  projectId: "food-pantry-cbbd3",
  storageBucket: "food-pantry-cbbd3.appspot.com",
  messagingSenderId: "53841348724",
  appId: "1:53841348724:web:d6d4f4acd35c1c16572921",
  measurementId: "G-E1KS3RX0M9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app)

export {firestore, storage}