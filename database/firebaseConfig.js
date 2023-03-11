import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const serviceAccount = {
    apiKey: "AIzaSyDywQ04Jm6dpkS7rxj2kC8d1v5VIyJ868M",
    authDomain: "demoproject-15f73.firebaseapp.com",
    projectId: "demoproject-15f73",
    storageBucket: "demoproject-15f73.appspot.com",
    messagingSenderId: "655354667682",
    appId: "1:655354667682:web:15a41ccbc819e172de2dfb",
    measurementId: "G-YV4NPZ0M06"
}

const firebaseApp = initializeApp( serviceAccount );

const db = getFirestore( firebaseApp );
const storage = getStorage( firebaseApp );


export default {
    db: db,
    storage: storage
}

