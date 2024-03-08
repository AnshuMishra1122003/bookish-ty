import { auth, db } from "./firebaseConfig.mjs";

import {
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// function logout
onAuthStateChanged(auth, async (user) => {
  if (!user) {
alert("Login first!");
    return (window.location.href = "./loginPagePath.html");
  }
});


console.log(db);

async function register(event) {
  const email = document.getElementById("Email_TextBox").value;
  const password = document.getElementById("Password_TextBox").value;
  const username = document.getElementById("Username_TextBox").value;
  event.preventDefault();

  console.log(email, password, username);

  if (!email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
    alert("Invalid email format");
    return;
}

  try {
    const authData = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await set(ref(db, `users/${authData.user.uid}`), {
      username,
      email,
      password,
    });

    alert("Registration Successful!");
    window.location.href = "/html/Login.html";
  } catch (error) {
    console.error("Error during registration:", error.message);
    alert(error.code);
  }
}

document
  .getElementById("Register_Button")
  .addEventListener("click", function (event) {
    register(event);
  });
