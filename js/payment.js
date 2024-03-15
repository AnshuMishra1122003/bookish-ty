import { db, auth } from "./firebaseConfig.mjs";
import { set, ref, get } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in.");
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener("submit", handlePayment);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const dataPrice = urlParams.get('price');
        if (dataPrice) {
            const priceLabel = document.getElementById('price');
            if (priceLabel) {
                priceLabel.textContent = `Pay: Rs.${dataPrice}`;
            }
        }
    } else {
        console.log("User not logged in.");
    }
});

async function handlePayment(event) {
    event.preventDefault(); 

    const user = auth.currentUser;
    if (!user) {
        console.log("User not logged in.");
        return;
    }
    const userId = user.uid;
    console.log("User ID:", userId);

    try {
        const userDetails = await getUserDetails(userId);
        if (!userDetails) {
            console.log("User details not found.");
            return;
        }
        console.log("User details:", userDetails);

        const email = document.getElementById("s-email").value;
        const country = document.getElementById("s-country").value;
        const cardNumber = document.getElementById("s-cardnumber").value;
        const cardholder = document.getElementById("s-cardholder").value;
        const expMonth = document.getElementById("s-expmonth").value;
        const cvv = document.getElementById("s-cvv").value;
        console.log("Form Data:", { email, country, cardNumber, cardholder, expMonth, cvv });

        const urlParams = new URLSearchParams(window.location.search);
        const dataPrice = urlParams.get('price');
        console.log("Data Price:", dataPrice);

        const receiptUrl = `/html/receipt.html?cardholder=${encodeURIComponent(cardholder)}&dataPrice=${encodeURIComponent(dataPrice)}&cardNumber=${encodeURIComponent(cardNumber)}`;
        window.open(receiptUrl, '_blank');

        const userRef = ref(db, `users/${userId}`);
        await set(userRef, { ...userDetails, subscribeduser: true });

        const subscribedUsersRef = ref(db, `users/${userId}/subscribedusers`);
        await set(subscribedUsersRef, {
            email,
            country,
            cardNumber,
            cardholder,
            expMonth,
            cvv,
            dataPrice
        });

        console.log("User details added to subscribedusers node:", userDetails);
        alert("Payment successful!");
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error handling payment:", error);
        alert("An error occurred. Please try again.");
    }
}

async function getUserDetails(userId) {
    try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.val();
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
}


