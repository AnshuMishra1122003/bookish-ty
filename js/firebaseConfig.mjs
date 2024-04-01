import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJzVIIEFRHw1WTAKn7ZZO4YsMkwwtga0M",
  authDomain: "bookish-real.firebaseapp.com",
  projectId: "bookish-real",
  storageBucket: "bookish-real.appspot.com",
  messagingSenderId: "908005148397",
  appId: "1:908005148397:web:d6d0e6973043459f15aee4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);