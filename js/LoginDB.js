import { db, auth } from "./firebaseConfig.mjs";
import {
  set,
  ref,
  update,
  getDatabase,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

function updateUserDisplayName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.displayName ?? "User Name";
  }
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById("Email_TextBox").value;
  const password = document.getElementById("Password_TextBox").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    sessionStorage.setItem('user', JSON.stringify(user));
    window.location.href = `/index.html?userId=${user.uid}`;
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your email and password.");
  }
}

document.getElementById("Login_Btn").addEventListener("click", function (event) {
  login(event);
});



function logout() {

  sessionStorage.removeItem('user');

  auth.signOut().then(() => {

    window.location.href = "/html/Login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
    alert("Logout failed.");
  });
}

document.getElementById("logout-link").addEventListener("click", logout);


const currentUser = sessionStorage.getItem('user');
if (currentUser) {
  const user = JSON.parse(currentUser);
  updateUserDisplayName(user);
}

document.getElementById("Login_Btn").addEventListener("click", function (event) {
  login(event);
});

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  login_hint: "user@example.com",
});


async function loginOAuth() {
  signInWithPopup(auth, provider)
    .then(async (authData) => {
      const credential = GoogleAuthProvider.credentialFromResult(authData);
      const token = credential.accessToken;

      const user = authData.user;

      await set(ref(db, `users/${user.uid}`), {
        username: user?.displayName ?? "google",
        email: user?.email,
        password: "bookish@123",
      });
      alert("Login successfully");
      window.location.href = `/index.html?userId=${user.uid}`;
    })
    .catch((error) => {
      console.log({ message: error.message });
      alert(error.code);
    });
}

document
  .getElementById("google-login-btn")
  .addEventListener("click", loginOAuth);

  document.addEventListener("DOMContentLoaded", function () {
    const userToggleBtn = document.getElementById("user-toggle-btn");
    const adminToggleBtn = document.getElementById("admin-toggle-btn");
    const userLoginForm = document.querySelector(".user-login-form");
    const adminLoginForm = document.querySelector(".admin-login-form");
  
    userToggleBtn.addEventListener("click", function () {
      userLoginForm.style.display = "block";
      adminLoginForm.style.display = "none";
    });
  
    adminToggleBtn.addEventListener("click", function () {
      userLoginForm.style.display = "none";
      adminLoginForm.style.display = "block";
    });
  
    document.getElementById("AdminLogin_Btn").addEventListener("click", async function (event) {
      event.preventDefault();
      const secretKey = document.getElementById("AdminSecretKey_TextBox").value;
  
      if (secretKey === "adminkey") {
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        
        // Check if currentUser is not null before accessing its properties
        if (currentUser && currentUser.uid) {
          currentUser.role = "admin";
  
          try {
            await update(ref(getDatabase(), `users/${currentUser.uid}`), {
              role: "admin"
            });
          } catch (error) {
            console.error("Error updating user role:", error);
            alert("Failed to update user role. Please try again.");
            return;
          }
  
          sessionStorage.setItem('user', JSON.stringify(currentUser));
  
          window.location.href = `/index.html?userId=${currentUser.uid}&role=admin`;
        } else {
          alert("User not authenticated. Please log in again.");
        }
      } else {
        alert("Invalid secret key. Please try again.");
      }
    });
  });
  
  const rmCheck = document.getElementById("remember_me"),
      emailInput = document.getElementById("Email_TextBox");
  
  if (localStorage.checkbox && localStorage.checkbox !== "") {
    rmCheck.setAttribute("checked", "checked");
    emailInput.value = localStorage.username;
  } else {
    rmCheck.removeAttribute("checked");
    emailInput.value = "";
  }
  
  function lsRememberMe() {
    if (rmCheck.checked && emailInput.value !== "") {
      localStorage.username = emailInput.value;
      localStorage.checkbox = rmCheck.value;
    } else {
      localStorage.username = "";
      localStorage.checkbox = "";
    }
  }
  