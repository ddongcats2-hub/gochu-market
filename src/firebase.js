import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA393jRMhk18W_NSJeavrZDwipdf_HlvPI",
  authDomain: "gochu-market.firebaseapp.com",
  databaseURL: "https://gochu-market-default-rtdb.firebaseio.com",
  projectId: "gochu-market",
storageBucket: "gochu-market.firebasestorage.app",
  messagingSenderId: "56898545763",
  appId: "1:56898545763:web:3d7d182925ccaff5167056",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;