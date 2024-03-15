import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { get, ref } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userId = user.uid; 

                const userDataSnapshot = await get(ref(db, `users/${userId}`));
                const userData = userDataSnapshot.val();

                document.getElementById('username').textContent = `${userData.username}`;
                document.getElementById('email').textContent = `${userData.email}`;
                document.getElementById('bio').textContent = `${userData.bio}`;
                document.querySelector('.user-image-container img').src = userData.imageUrl;

                const userBooksSnapshot = await get(ref(db, `users/${userId}/books`));
                let numBookmarks = 0;
                if (userBooksSnapshot.exists()) {
                    userBooksSnapshot.forEach(() => {
                        numBookmarks++;
                    });
                }
                document.getElementById('bookmarks').textContent = `${numBookmarks}`;
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            console.log("User Not Logged in")
        }
    });
});
