import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { get, ref } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Get the currently logged-in user
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userId = user.uid; // Get the user ID of the logged-in user

                // Fetch user data from the database
                const userDataSnapshot = await get(ref(db, `users/${userId}`));
                const userData = userDataSnapshot.val();

                // Update profile elements with user data
                document.getElementById('username').textContent = `${userData.username}`;
                document.getElementById('email').textContent = `${userData.email}`;
                document.getElementById('bio').textContent = `Bio: ${userData.bio}`;
                document.querySelector('.user-image-container img').src = userData.imageUrl;

                // Fetch and display the number of bookmarks (books) for the user
                const userBooksSnapshot = await get(ref(db, `users/${userId}/books`));
                let numBookmarks = 0;
                if (userBooksSnapshot.exists()) {
                    userBooksSnapshot.forEach(() => {
                        numBookmarks++;
                    });
                }
                document.getElementById('bookmarks').textContent = `Bookmarks: ${numBookmarks}`;
            } catch (error) {
                console.error("Error fetching user data:", error);
                // Handle the error here, e.g., display an error message to the user
            }
        } else {
            // User is not logged in
            // Handle this case if needed
        }
    });
});
