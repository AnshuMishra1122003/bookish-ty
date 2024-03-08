import { db, auth } from "./firebaseConfig.mjs";
import {
    ref,
    onValue,
    set,
    get
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// function logout
onAuthStateChanged(auth, async (user) => {
    if (!user) {
  alert("Login first!");
      return (window.location.href = "./loginPagePath.html");
    }
  });

  

document.addEventListener('DOMContentLoaded', () => {
    const editProfileImageContainer = document.getElementById('editProflileImageContainer');
    const editProfilePlaceholder = document.getElementById('editprofileplaceholder');
    const editProfileUploadedImage = document.getElementById('editprofileuploadedImage');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const publicName = document.getElementById('publicName');
    const bio = document.getElementById('bio');
    const editPublicNameBtn = document.getElementById('editPublicName');
    const editBioBtn = document.getElementById('editBio');
    const saveChangesBtn = document.getElementById('saveChanges');
    const imageUpload = document.getElementById('editprofileInput');

    // Function to display user information
    function displayUserInfo(userData) {
        username.textContent = userData.username;
        email.textContent = userData.email;
        publicName.value = userData.username;
        bio.value = userData.bio;
        // Display user image
        if (userData.imageUrl) {
            editProfileImageContainer.style.backgroundImage = `url('${userData.imageUrl}')`;
            editProfilePlaceholder.style.display = 'none';
            editProfileUploadedImage.style.display = 'block';
        } else {
            // If no image URL exists, show the placeholder image
            editProfileImageContainer.style.backgroundImage = ``;
            editProfilePlaceholder.style.display = 'block';
            editProfileUploadedImage.style.display = 'none';
        }
    }

    // Event listener for image upload
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageUrl = e.target.result; // Base64 encoded image

            // Display the uploaded image
            editProfileImageContainer.style.backgroundImage = `url('${imageUrl}')`;
            editProfilePlaceholder.style.display = 'none';
            editProfileUploadedImage.style.display = 'block';

            // Add image URL to the user data
            const userId = auth.currentUser.uid;
            const userRef = ref(db, `users/${userId}`);

            // Fetch entire user data
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    // Update image URL in user data
                    userData.imageUrl = imageUrl;

                    // Set the updated user data
                    set(userRef, userData)
                        .then(() => {
                            console.log("User image updated successfully.");
                        })
                        .catch((error) => {
                            console.error("Error updating user image:", error);
                        });
                }
            });
        };

        // Read the selected file as a data URL
        reader.readAsDataURL(file);
    });

    // Event listener for Edit Public Name button
    editPublicNameBtn.addEventListener('click', () => {
        makeEditable(publicName);
    });

    // Event listener for Edit Bio button
    editBioBtn.addEventListener('click', () => {
        makeEditable(bio);
    });

    // Event listener for "Save Changes" button
    saveChangesBtn.addEventListener('click', () => {
        const updatedPublicName = publicName.value;
        const updatedBio = bio.value;

        // Perform update operations in the Firebase Realtime Database
        const userId = auth.currentUser.uid;
        const userRef = ref(db, `users/${userId}`);

        // Fetch entire user data
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // Update specific fields
                userData.username = updatedPublicName;
                userData.publicName = updatedPublicName;
                userData.bio = updatedBio;

                // Set the updated user data
                set(userRef, userData)
                    .then(() => {
                        console.log("User data updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating user data:", error);
                    });
            }
        });
    });

    // Use user ID to fetch user data from Firebase Realtime Database
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const usersRef = ref(db, 'users/' + userId);

            onValue(usersRef, (snapshot) => {
                const userData = snapshot.val();
                displayUserInfo(userData);
            });
        } else {
            // User is not signed in
            console.log('No user signed in.');
        }
    });

    // Function to make input fields editable
    function makeEditable(element) {
        element.readOnly = false;
        element.focus();
    }
});



// Function to show the selected content and hide other content
function showContent(contentId) {
    // Hide all content sections
    const allContents = document.querySelectorAll('.content');
    allContents.forEach(content => {
        content.style.display = 'none';
    });

    // Show the selected content
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
}

// Event listeners for navbar links
document.getElementById('publicProfileBtn').addEventListener('click', function () {
    showContent('publicProfile');
});

document.getElementById('managepasswordBtn').addEventListener('click', function () {
    showContent('managepassword');
});

document.getElementById('manageBookmarksBtn').addEventListener('click', function () {
    showContent('manageBookmarks');
});

// Function to fetch user data from Firebase Realtime Database
function getUserDataFromDatabase() {
    const userId = auth.currentUser.uid;
    const usersRef = ref(db, 'users/' + userId);

    return get(usersRef).then(snapshot => {
        return snapshot.val();
    });
}

// Function to display user data including current password
function displayUserData(userData) {
    const currentPasswordElement = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    currentPasswordElement.textContent = userData.password; // Assuming password is stored directly in userData

    // Event listener for saving password
    document.getElementById("savePassword").addEventListener("click", function () {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        // Fetch existing user data
        const userId = auth.currentUser.uid;
        const userRef = ref(db, 'users/' + userId);
        onValue(userRef, (snapshot) => {
            const existingUserData = snapshot.val();
            if (existingUserData) {
                // Merge existing user data with new password
                const updatedUserData = {
                    ...existingUserData,
                    password: newPassword
                };

                // Update user data in the database
                set(userRef, updatedUserData)
                    .then(() => {
                        alert("Password and user data updated successfully.");
                    })
                    .catch(error => {
                        alert("Error updating password and user data: " + error.message);
                    });

                // Clear input fields
                newPasswordInput.value = "";
                confirmPasswordInput.value = "";
            } else {
                console.error("User data not found.");
            }
        });
    });
}

// Fetch user data including password from the database
function fetchUserData() {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, 'users/' + userId);
    onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            displayUserData(userData);
        } else {
            console.error("User data not found.");
        }
    });
}

/// Call fetchUserData when the page loads or when the user logs in
onAuthStateChanged(auth, user => {
    if (user) {
        fetchUserData();
    }
});

// Call function to fetch and display user data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    getUserDataFromDatabase().then(userData => {
        displayUserData(userData);
    }).catch(error => {
        console.error("Error fetching user data:", error);
    });
});



document.addEventListener('DOMContentLoaded', async () => {
    const bookmarksContainer = document.getElementById('bookmarks-container');

    try {
        // Get the current user
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in.");
                return;
            }

            const userId = user.uid;

            // Fetch bookmarked books for the logged-in user
            const userBooksRef = ref(db, `users/${userId}/books`);
            const snapshot = await get(userBooksRef);
            const bookmarkedBooks = snapshot.val();

            if (!bookmarkedBooks) {
                console.log("No bookmarked books found.");
                return;
            }

            // Display bookmarked books
            for (let bookId in bookmarkedBooks) {
                const book = bookmarkedBooks[bookId];
                const bookmark = createBookmark(book, bookId, userId);
                bookmarksContainer.appendChild(bookmark);
            }
        });
    } catch (error) {
        console.error("Error fetching bookmarked books:", error);
    }
});

function createBookmark(book, bookId, userId) {
    const bookmark = document.createElement('div');
    bookmark.classList.add('bookmark');

    const anchor = document.createElement('a');
    anchor.href = `/html/previewpage.html?bookId=${encodeURIComponent(bookId)}&userId=${userId}`;

    const img = document.createElement('img');
    img.src = book.imageUrl;
    img.alt = book.title;

    const title = document.createElement('h2');
    title.textContent = book.title;

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
        try {
            // Remove the bookmark from the database
            const userBookRef = ref(db, `users/${userId}/books/${bookId}`);
            await set(userBookRef, null);

            // Remove the bookmark from the UI
            bookmark.remove();
        } catch (error) {
            console.error("Error deleting bookmark:", error);
        }
    });

    anchor.appendChild(img);
    anchor.appendChild(title);
    bookmark.appendChild(anchor);
    bookmark.appendChild(deleteButton); // Append the delete button

    return bookmark;
}
