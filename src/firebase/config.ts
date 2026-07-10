import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjk8qstyzMmNkh-mYaDVw1x1m4RIgGzMQ",
  authDomain: "lucky-balls-419da.firebaseapp.com",
  projectId: "lucky-balls-419da",
  storageBucket: "lucky-balls-419da.firebasestorage.app",
  messagingSenderId: "1038344219107",
  appId: "1:1038344219107:web:273d3e996299bdbb0698d6",
  measurementId: "G-YJLYFK8BJB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = !getApps().length 
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
export default firebaseConfig;
