import { db, auth } from "./firebaseConfig.mjs";
import {
    ref,
    onValue,
    set,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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
    const userId = auth().currentUser.uid;
    const usersRef = ref('users/' + userId);

    return usersRef.once('value').then(snapshot => {
        return snapshot.val();
    });
}

// Function to display user data including current password
function displayUserData(userData) {
    const currentPasswordElement = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    currentPasswordElement.textContent = userData.password; // Assuming password is stored in userData

    // Event listener for saving password
    document.getElementById("savePassword").addEventListener("click", function () {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        // Update the password in the database
        const userId = auth().currentUser.uid;
        const userRef = ref('users/' + userId);
        set(userRef, { password: newPassword })
            .then(() => {
                alert("Password updated successfully.");
            })
            .catch(error => {
                alert("Error updating password: " + error.message);
            });

        // Clear input fields
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    });
}

// Call function to fetch and display user data when the page loads
auth.onAuthStateChanged(function (user) {
    if (user) {
        getUserDataFromDatabase().then(userData => {
            displayUserData(userData);
        }).catch(error => {
            console.error("Error fetching user data:", error);
        });
    } else {
        console.log('No user signed in.');
    }
});
