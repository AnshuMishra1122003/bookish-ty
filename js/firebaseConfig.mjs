import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js";

//config code...........
const firebaseConfig = {
  apiKey: "AIzaSyCiNLLV_8GXpvSD7IeVUfp4dbq-_pcvn7w",
  authDomain: "bookish-proj.firebaseapp.com",
  databaseURL: "https://bookish-proj-default-rtdb.firebaseio.com",
  projectId: "bookish-proj",
  storageBucket: "bookish-proj.appspot.com",
  messagingSenderId: "351432216616",
  appId: "1:351432216616:web:59c46450f373a82ad9251d",
  measurementId: "G-DH4RJ9TML1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);