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
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";


function handleSubscriptionButtonClick(event) {
    const price = event.target.dataset.price;
    if (price) {
        window.location.href = `paymentpage.html?price=${price}`;
    } else {
        console.error("Price not found.");
    }
}

const subscribeButtons = document.querySelectorAll('.subscribe-btn');
subscribeButtons.forEach(button => {
    button.addEventListener('click', handleSubscriptionButtonClick);
});
