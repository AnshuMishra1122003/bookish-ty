import { auth } from "./firebaseConfig.mjs";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

async function forget_password(e) {
  const email = document.getElementById("email").value;
  e.preventDefault();

  sendPasswordResetEmail(auth, email)
    .then((data) => {
      console.log(data);
      alert("Check your email to reset the password!");
      window.location.href = "/html/Login.html";
    })
    .catch((err) => {
      alert("Something went wrong: " + err.code);
    });
}

document
  .getElementById("forget-pass-btn")
  .addEventListener("click", function (event) {
    forget_password(event);
  });
