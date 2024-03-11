// Import necessary functions from Firebase SDK
import { auth, db } from "./firebaseConfig.mjs";
import {
    query,
    orderByChild,
    equalTo,
    ref,
    onValue,
    set,
    push,
    get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";


// Function to handle subscription button click
function handleSubscriptionButtonClick(event) {
    const price = event.target.dataset.price;
    if (price) {
        // Redirect to payment page with selected price as URL parameter
        window.location.href = `paymentpage.html?price=${price}`;
    } else {
        console.error("Price not found.");
    }
}

// Add event listeners to subscription buttons
const subscribeButtons = document.querySelectorAll('.subscribe-btn');
subscribeButtons.forEach(button => {
    button.addEventListener('click', handleSubscriptionButtonClick);
});
