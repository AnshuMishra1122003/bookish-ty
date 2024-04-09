// Import necessary functions from Firebase SDK

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
