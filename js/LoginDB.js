import { db, auth } from "./firebaseConfig.mjs";
import {
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// Check if user is logged in, redirect to login page if not
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Login first!");
    window.location.href = "./loginPagePath.html";
  }
});

// Function to update user display name
function updateUserDisplayName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.displayName ?? "User Name";
  }
}

// Login with email and password
async function login(event) {
  event.preventDefault();
  const email = document.getElementById("Email_TextBox").value;
  const password = document.getElementById("Password_TextBox").value;

  if (!email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
    alert("Invalid email format");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    sessionStorage.setItem('user', JSON.stringify(user));
    window.location.href = `/index.html?userId=${user.uid}`; // Pass user ID as URL parameter
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your email and password.");
  }
}

// Event listener for login button
document.getElementById("Login_Btn").addEventListener("click", login);

// Logout function
function logout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('user'); // Remove user from session storage
    window.location.href = "./loginPagePath.html";
  }).catch((error) => {
    console.error("Logout error:", error);
    alert("Logout failed. Please try again.");
  });
}

// Event listener for logout
document.querySelector(".sub-icon-link").addEventListener("click", logout);

// Check if user is logged in and update display name
const currentUser = sessionStorage.getItem('user');
if (currentUser) {
  const user = JSON.parse(currentUser);
  updateUserDisplayName(user);
}

// Google OAuth login
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  login_hint: "user@example.com",
});

async function loginOAuth() {
  try {
    const authData = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(authData);
    const token = credential.accessToken;
    const user = authData.user;

    await set(ref(db, `users/${user.uid}`), {
      username: user?.displayName ?? "google",
      email: user?.email,
      password: "bookish@123",
    });

    alert("Login successfully");
    window.location.href = `/index.html?userId=${user.uid}`; // Pass user ID as URL parameter
  } catch (error) {
    console.error("Google login error:", error.message);
    alert(error.code);
  }
}

// Event listener for Google login button
document.getElementById("google-login-btn").addEventListener("click", loginOAuth);
