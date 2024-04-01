import { db, auth } from "./firebaseConfig.mjs";
import {
    ref,
    onValue,
    set,
    get
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";


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
        if (userData.imageUrl) {
            editProfileImageContainer.style.backgroundImage = `url('${userData.imageUrl}')`;
            editProfilePlaceholder.style.display = 'none';
            editProfileUploadedImage.style.display = 'block';
        } else {
            editProfileImageContainer.style.backgroundImage = ``;
            editProfilePlaceholder.style.display = 'block';
            editProfileUploadedImage.style.display = 'none';
        }
    }

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result; 
            editProfileImageContainer.style.backgroundImage = `url('${imageUrl}')`;
            editProfilePlaceholder.style.display = 'none';
            editProfileUploadedImage.style.display = 'block';
            const userId = auth.currentUser.uid;
            const userRef = ref(db, `users/${userId}`);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    userData.imageUrl = imageUrl;
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
        reader.readAsDataURL(file);
    });

    editPublicNameBtn.addEventListener('click', () => {
        makeEditable(publicName);
    });

    editBioBtn.addEventListener('click', () => {
        makeEditable(bio);
    });

    saveChangesBtn.addEventListener('click', () => {
        const updatedPublicName = publicName.value;
        const updatedBio = bio.value;

        const userId = auth.currentUser.uid;
        const userRef = ref(db, `users/${userId}`);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                userData.username = updatedPublicName;
                userData.publicName = updatedPublicName;
                userData.bio = updatedBio;

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

    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const usersRef = ref(db, 'users/' + userId);

            onValue(usersRef, (snapshot) => {
                const userData = snapshot.val();
                displayUserInfo(userData);
            });
        } else {
            console.log('No user signed in.');
        }
    });

    function makeEditable(element) {
        element.readOnly = false;
        element.focus();
    }
});



function showContent(contentId) {
    const allContents = document.querySelectorAll('.content');
    allContents.forEach(content => {
        content.style.display = 'none';
    });

    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
}

document.getElementById('publicProfileBtn').addEventListener('click', function () {
    showContent('publicProfile');
});

document.getElementById('managepasswordBtn').addEventListener('click', function () {
    showContent('managepassword');
});

document.getElementById('manageBookmarksBtn').addEventListener('click', function () {
    showContent('manageBookmarks');
});

function getUserDataFromDatabase() {
    const userId = auth.currentUser.uid;
    const usersRef = ref(db, 'users/' + userId);

    return get(usersRef).then(snapshot => {
        return snapshot.val();
    });
}

function displayUserData(userData) {
    const currentPasswordElement = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    currentPasswordElement.textContent = userData.password; 

    document.getElementById("savePassword").addEventListener("click", function () {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        const userId = auth.currentUser.uid;
        const userRef = ref(db, 'users/' + userId);
        onValue(userRef, (snapshot) => {
            const existingUserData = snapshot.val();
            if (existingUserData) {
                const updatedUserData = {
                    ...existingUserData,
                    password: newPassword
                };

                set(userRef, updatedUserData)
                    .then(() => {
                        alert("Password and user data updated successfully.");
                    })
                    .catch(error => {
                        alert("Error updating password and user data: " + error.message);
                    });

                newPasswordInput.value = "";
                confirmPasswordInput.value = "";
            } else {
                console.error("User data not found.");
            }
        });
    });
}

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

onAuthStateChanged(auth, user => {
    if (user) {
        fetchUserData();
    }
});

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
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log("User not logged in.");
                return;
            }

            const userId = user.uid;

            const userBooksRef = ref(db, `users/${userId}/books`);
            const snapshot = await get(userBooksRef);
            const bookmarkedBooks = snapshot.val();

            if (!bookmarkedBooks) {
                console.log("No bookmarked books found.");
                return;
            }

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

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
        try {
            const userBookRef = ref(db, `users/${userId}/books/${bookId}`);
            await set(userBookRef, null);

            bookmark.remove();
        } catch (error) {
            console.error("Error deleting bookmark:", error);
        }
    });

    anchor.appendChild(img);
    anchor.appendChild(title);
    bookmark.appendChild(anchor);
    bookmark.appendChild(deleteButton); 

    return bookmark;
}
