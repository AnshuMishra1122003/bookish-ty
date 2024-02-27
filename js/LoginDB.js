import { db, auth } from "./firebaseConfig.mjs";
import {
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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
document.getElementById("Login_Btn").addEventListener("click", function (event) {
  login(event);
});



function logout() {
 
  sessionStorage.removeItem('user');
  
  auth.signOut().then(() => {
   
    window.location.href = "/login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
    alert("Logout failed.");
  });
}

document.querySelector(".sub-icon-link").addEventListener("click", logout);


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
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(authData);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = authData.user;

      await set(ref(db,`users/${user.uid}`), {
        username: user?.displayName ?? "google",
        email: user?.email,
        password: "bookish@123",
      });
      alert("Login successfully");
      window.location.href = `/index.html?userId=${user.uid}`; // Pass user ID as URL parameter
    })
    .catch((error) => {
      // Handle Errors here.
      console.log({ message: error.message });
      alert(error.code);
    });
}

document
  .getElementById("google-login-btn")
  .addEventListener("click", loginOAuth);