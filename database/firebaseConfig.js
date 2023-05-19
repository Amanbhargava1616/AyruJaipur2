import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const serviceAccount = {
    apiKey: "AIzaSyAyI0kTcWuibDvgWmUT9f0bKjTeehjJH6A",
    authDomain: "ayru-jaipur-f2a3f.firebaseapp.com",
    projectId: "ayru-jaipur-f2a3f",
    storageBucket: "ayru-jaipur-f2a3f.appspot.com",
    messagingSenderId: "26351795389",
    appId: "1:26351795389:web:bf2191d5593bb0cc0bcbd4",
    measurementId: "G-BWNMT8VGBT"

}

const firebaseApp = initializeApp( serviceAccount );

const db = getFirestore( firebaseApp );
const storage = getStorage( firebaseApp );


export default {
    db: db,
    storage: storage
}

