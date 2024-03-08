import { db, auth } from "./firebaseConfig.mjs";
import { query, orderByChild, ref, update, get, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';

// function logout
onAuthStateChanged(auth, async (user) => {
    if (!user) {
  alert("Login first!");
      return (window.location.href = "./loginPagePath.html");
    }
  });

  
// Function to fetch and display books
function displayBooks() {
    const bookContainer = document.getElementById('bookContainer');

    // Assume 'books' is the node where your books are stored in Firebase
    const booksRef = ref(db, 'books/');

    onValue(booksRef, (snapshot) => {
        bookContainer.innerHTML = ''; // Clear previous content

        snapshot.forEach((childSnapshot) => {
            const bookData = childSnapshot.val();
            const bookId = childSnapshot.key;

            // Create book element
            const bookElement = createBookElement(bookData, bookId);
            bookContainer.appendChild(bookElement);
        });
    });
}

// Function to create a book element
function createBookElement(bookData, bookId) {
    const containerCard = document.createElement('div');
    containerCard.classList.add('container-card');

    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    // Left side - Cover image
    const coverImg = document.createElement('img');
    coverImg.src = bookData.imageUrl;
    coverImg.alt = 'Cover';
    coverImg.classList.add('cover-img');
    bookElement.appendChild(coverImg);

    // Center part - Title and Description
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');

    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = bookData.title;
    infoContainer.appendChild(title);

    const description = document.createElement('div');
    description.classList.add('description');
    description.textContent = bookData.description;
    infoContainer.appendChild(description);

    // Border line
    const borderLine = document.createElement('div');
    borderLine.classList.add('border-line');
    infoContainer.appendChild(borderLine);

    bookElement.appendChild(infoContainer);

    // Trash icon for deleting the book
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fas', 'fa-trash', 'delete-icon');
    trashIcon.setAttribute('title', 'Delete');
    trashIcon.addEventListener('click', () => {
        deleteBook(bookId);
    });

    // Right side - Genres and Tags
    const genreTagsContainer = document.createElement('div');
    genreTagsContainer.appendChild(trashIcon);
    genreTagsContainer.classList.add('genre-tags-container');

    const genres = document.createElement('div');
    genres.classList.add('genres');
    genres.textContent = 'Genres: ' + bookData.genres.join(', ');
    genreTagsContainer.appendChild(genres);

    const tags = document.createElement('div');
    tags.classList.add('tags');
    tags.textContent = 'Tags: ' + bookData.tags.join(', ');
    genreTagsContainer.appendChild(tags);
    bookElement.appendChild(genreTagsContainer);

    containerCard.appendChild(bookElement);
    return containerCard;
}

// Function to search books by title
function searchBooks() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const bookContainer = document.getElementById("bookContainer");

    // Clear previous content
    bookContainer.innerHTML = "";

    // Fetch books from the database
    const booksRef = ref(db, "books/");
    get(booksRef)
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const bookData = childSnapshot.val();
                const bookId = childSnapshot.key;

                // Check if the book title contains the search input
                if (bookData.title.toLowerCase().includes(searchInput)) {
                    const bookElement = createBookElement(bookData, bookId);
                    bookContainer.appendChild(bookElement);
                }
            });
        })
        .catch((error) => {
            console.error("Error searching books:", error);
            // Handle error if needed
        });
}

// Call the searchBooks function when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", searchBooks);
});

// Function to filter books based on genre
function filterBooks(genre) {
    const bookContainer = document.getElementById('bookContainer');

    // Clear previous content
    bookContainer.innerHTML = '';

    // Reference to the 'books' node in the database
    const booksRef = ref(db, 'books');

    // Fetch books from the database
    get(booksRef)
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const bookData = childSnapshot.val();
                const bookId = childSnapshot.key;

                // Check if the book has the selected genre
                // Ensure that genres is an array in your database
                if (bookData.genres && bookData.genres.includes(genre.toLowerCase())) {
                    const bookElement = createBookElement(bookData, bookId);
                    bookContainer.appendChild(bookElement);
                }
            });
        })
        .catch((error) => {
            console.error('Error filtering books by genre:', error);
            // Handle error if needed
        });
}

// Function to handle filterBooks
function handleFilterBooks(event) {
    const genre = event.target.innerText;
    filterBooks(genre);
}

// Attach event listeners to dropdown items
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', handleFilterBooks);
    });
});

// Function to delete a book from Firebase Realtime Database
async function deleteBook(bookId) {
    const bookRef = ref(db, `books/${bookId}`);

    try {
        // Fetch the book data to display in the confirmation message
        const bookSnapshot = await get(bookRef);
        const bookData = bookSnapshot.val();
        const bookName = bookData.title;

        // Ask for confirmation before deleting the book
        const confirmation = confirm(`Are you sure you want to delete the book "${bookName}"?`);

        if (confirmation) {
            // Remove the book from the "books" node
            await remove(bookRef);
            console.log(`Book "${bookName}" deleted successfully from "books" node`);

            // Delete the book from the corresponding genre subnodes
            const genres = bookData.genres || [];
            for (const genre of genres) {
                const genreRef = ref(db, `genres/${genre}/books/${bookId}`);
                await remove(genreRef);
                console.log(`Book "${bookName}" deleted successfully from "${genre}" genre node`);
            }

            // Fetch and display updated counts and UI
            fetchCountsAndUpdateUI();

            // Show success message after deletion
            alert(`Book "${bookName}" deleted successfully.`);
        } else {
            // If the user cancels, log a message
            console.log('Deletion cancelled by admin');
        }
    } catch (error) {
        console.error('Error deleting book:', error.message);
        alert('Error deleting book. Please try again later.');
    }
}

// Call the displayBooks function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayBooks();
});


// Function to fetch users from Firebase Realtime Database
var tableBody = document.getElementById('tableBody');
function fetchUsers() {
    // Clear existing content
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Assuming your users are stored in a "users" node
    const usersRef = ref(db, 'users');

    get(usersRef).then((snapshot) => {
        let serialNumber = 1; // Initialize serial number

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();

            const username = userData.username;
            const email = userData.email;

            // Create a table row for each user
            const row = document.createElement('tr');

            // Create the table cells
            const cellSerialNumber = document.createElement('td');
            cellSerialNumber.textContent = serialNumber++;

            const cellUsername = document.createElement('td');
            cellUsername.textContent = username;

            const cellEmail = document.createElement('td');
            cellEmail.textContent = email;

            const cellActions = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function () {
                editUser(userSnapshot.key);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function () {
                deleteUser(userSnapshot.key);
            });

            const enableButton = document.createElement('button');
            enableButton.textContent = 'Enable';
            enableButton.style.display = userData.disabled ? 'inline-block' : 'none';
            enableButton.addEventListener('click', function () {
                enableUser(userSnapshot.key);
            });


            const disableButton = document.createElement('button');
            disableButton.textContent = 'Disable';
            disableButton.style.display = userData.disabled ? 'none' : 'inline-block';
            disableButton.addEventListener('click', function () {
                disableUser(userSnapshot.key);
            });


            cellActions.appendChild(editButton);
            cellActions.appendChild(deleteButton);
            cellActions.appendChild(enableButton);
            cellActions.appendChild(disableButton);

            row.appendChild(cellSerialNumber);
            row.appendChild(cellUsername);
            row.appendChild(cellEmail);
            row.appendChild(cellActions);

            // Append row to table body
            tableBody.appendChild(row);
        });
    });
}

fetchUsers();

// Define the searchUsers function
function searchUsers() {
    // Your searchUsers implementation
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    const usersRef = ref(db, 'users');
    get(usersRef).then((snapshot) => {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear previous table content

        let serialNumber = 1; // Initialize serial number

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            const username = userData.username.toLowerCase();
            const email = userData.email.toLowerCase();

            // Check if search term matches username or email
            if (username.includes(searchTerm) || email.includes(searchTerm)) {
                // Create table row
                const row = document.createElement('tr');

                // Create and append table cells
                const cellSerialNumber = document.createElement('td');
                cellSerialNumber.textContent = serialNumber++;

                const cellUsername = document.createElement('td');
                cellUsername.textContent = userData.username;

                const cellEmail = document.createElement('td');
                cellEmail.textContent = userData.email;

                const cellActions = document.createElement('td');

                // Create edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', function () {
                    editUser(userSnapshot.key);
                });

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function () {
                    deleteUser(userSnapshot.key);
                });

                // Create enable button
                const enableButton = document.createElement('button');
                enableButton.textContent = 'Enable';
                enableButton.style.display = userData.disabled ? 'inline-block' : 'none';
                enableButton.addEventListener('click', function () {
                    enableUser(userSnapshot.key);
                });

                // Create disable button
                const disableButton = document.createElement('button');
                disableButton.textContent = 'Disable';
                disableButton.style.display = userData.disabled ? 'none' : 'inline-block';
                disableButton.addEventListener('click', function () {
                    disableUser(userSnapshot.key);
                });

                // Append buttons to cellActions
                cellActions.appendChild(editButton);
                cellActions.appendChild(deleteButton);
                cellActions.appendChild(enableButton);
                cellActions.appendChild(disableButton);

                // Append cells to row
                row.appendChild(cellSerialNumber);
                row.appendChild(cellUsername);
                row.appendChild(cellEmail);
                row.appendChild(cellActions);

                // Append row to table body
                tableBody.appendChild(row);
            }
        });
    });
}

// Add an event listener after the function definition
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
    } else {
        console.error("Search input element not found");
    }
});

function editUser(userId) {
    // Assuming your users are stored in a "users" node
    const userRef = ref(db, `users/${userId}`);

    // Fetch the existing user data using get
    get(userRef)
        .then((snapshot) => {
            const userData = snapshot.val();

            // Get the updated username from the admin
            const newUsername = prompt('Enter the new username:', userData.username);

            // Create an object to store updated fields
            const updatedFields = {};

            // Update only the username if provided
            if (newUsername !== null && newUsername !== '') {
                updatedFields.username = newUsername;
            } else {
                // Keep the existing username if not provided
                updatedFields.username = userData.username;
            }

            // Update the user details in the Firebase Realtime Database
            update(userRef, updatedFields);

            // Fetch updated users to refresh the table
            fetchUsers();
        })
        .catch((error) => {
            console.error('Error fetching user data:', error.message);
            // Handle the error if needed
        });
}


function deleteUser(userId) {
    // Assuming your users are stored in a "users" node
    const userRef = ref(db, `users/${userId}`);

    // Fetch user data to display in the confirmation message
    get(userRef)
        .then((snapshot) => {
            const userData = snapshot.val();
            const username = userData.username;
            const email = userData.email;

            // Display a confirmation alert before deleting the user
            const confirmation = confirm(`Are you sure you want to delete the following user?\n\nUsername: ${username}\nEmail: ${email}`);

            // If the user confirms, proceed with deletion
            if (confirmation) {
                // Remove the user from the Firebase Realtime Database
                remove(userRef)
                    .then(() => {
                        // Fetch updated users to refresh the table
                        fetchUsers();
                        // User deleted successfully
                        alert(`User deleted successfully!\n\nUsername: ${username}\nEmail: ${email}`);
                    })
                    .catch((error) => {
                        console.error('Error deleting user:', error.message);
                        alert('Error deleting user. Please try again later.');
                    });
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error.message);
            alert('Error fetching user data. Please try again later.');
        });
}

// Function to fetch and display subscribed users
var subscriptionsTableBody = document.getElementById('subscriptionsTableBody');
function fetchSubscribedUsers() {

    while (subscriptionsTableBody.firstChild) {
        subscriptionsTableBody.removeChild(subscriptionsTableBody.firstChild);
    }

    // Reference to the "subscribedusers" node in the database
    const subscribedUsersRef = ref(db, 'subscribedusers');

    get(subscribedUsersRef).then((snapshot) => {
        let serialNumber = 1;

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            const CardHolder = userData.cardholder;
            const email = userData.email;
            const Country = userData.country;

            // Create a table row for each subscribed user
            const row = document.createElement('tr');

            // Create and populate table cells
            const cellSerialNumber = document.createElement('td');
            cellSerialNumber.textContent = serialNumber++;

            const cellCardHolder = document.createElement('td');
            cellCardHolder.textContent = CardHolder;

            const cellEmail = document.createElement('td');
            cellEmail.textContent = email;

            const cellCountry = document.createElement('td');
            cellCountry.textContent = Country;

            // Append cells to the row
            row.appendChild(cellSerialNumber);
            row.appendChild(cellCardHolder);
            row.appendChild(cellEmail);
            row.appendChild(cellCountry);

            // Append the row to the table body
            subscriptionsTableBody.appendChild(row);
        });
    });
}

fetchSubscribedUsers();

// Function to search subscribed users
function searchSubscribedUsers() {
    const searching = document.getElementById('searching');
    const searchTerms = searching.value.trim().toLowerCase();

    // Reference to the "subscribedusers" node in the database
    const subscribedUsersRef = ref(db, 'subscribedusers');

    get(subscribedUsersRef).then((snapshot) => {
        subscriptionsTableBody.innerHTML = ''; // Clear previous table content

        let serialNumber = 1;

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            const cardHolder = userData.cardholder.toLowerCase();
            const email = userData.email.toLowerCase();
            const country = userData.country; // Fetch country data

            // Check if search term matches Card Holder or Email
            if (cardHolder.includes(searchTerms) || email.includes(searchTerms)) {
                // Create table row
                const row = document.createElement('tr');

                // Create and populate table cells
                const cellSerialNumber = document.createElement('td');
                cellSerialNumber.textContent = serialNumber++;

                const cellCardHolder = document.createElement('td');
                cellCardHolder.textContent = userData.cardholder;

                const cellEmail = document.createElement('td');
                cellEmail.textContent = userData.email;

                const cellCountry = document.createElement('td');
                cellCountry.textContent = country; // Set country data

                // Append cells to row
                row.appendChild(cellSerialNumber);
                row.appendChild(cellCardHolder);
                row.appendChild(cellEmail);
                row.appendChild(cellCountry);

                // Append row to table body
                subscriptionsTableBody.appendChild(row);
            }
        });
    });
}

// Add an event listener after the function definition
document.addEventListener("DOMContentLoaded", () => {
    const searching = document.getElementById('searching');
    if (searching) {
        searching.addEventListener("input", searchSubscribedUsers);
    } else {
        console.error("Search input element not found");
    }
});

// Function to enable a user account
function enableUser(userId) {
    const userRef = ref(db, `users/${userId}`);

    // Update the 'disabled' field to false to enable the user
    update(userRef, { disabled: false })
        .then(() => {
            console.log('User account enabled successfully');
            // Fetch and display updated users
            fetchUsers();
        })
        .catch((error) => {
            console.error('Error enabling user account:', error.message);
            // Handle the error if needed
        });
}

// Function to disable a user account
function disableUser(userId) {
    const userRef = ref(db, `users/${userId}`);

    // Update the 'disabled' field to true to disable the user
    update(userRef, { disabled: true })
        .then(() => {
            console.log('User account disabled successfully');
            // Fetch and display updated users
            fetchUsers();
        })
        .catch((error) => {
            console.error('Error disabling user account:', error.message);
            // Handle the error if needed
        });
}

// Function to fetch counts from Firebase and update the UI
async function fetchCountsAndUpdateUI() {
    const usersRef = ref(db, 'users/');
    const subscribedUsersRef = ref(db, 'subscribedusers/');
    const booksRef = ref(db, 'books/');
    const genresRef = ref(db, 'genres/');

    const usersSnapshot = await get(usersRef);
    const subscribedUsersSnapshot = await get(subscribedUsersRef);
    const booksSnapshot = await get(booksRef);
    const genresSnapshot = await get(genresRef);

    let userCount = 0;
    let subscribedUserCount = 0;
    let bookCount = 0;
    let totalGenreCount = 0;

    if (usersSnapshot.exists()) {
        usersSnapshot.forEach(() => {
            userCount++;
        });
    }

    if (subscribedUsersSnapshot.exists()) {
        subscribedUsersSnapshot.forEach(() => {
            subscribedUserCount++;
        });
    }

    if (booksSnapshot.exists()) {
        booksSnapshot.forEach(() => {
            bookCount++;
        });
    }

    if (genresSnapshot.exists()) {
        genresSnapshot.forEach(() => {
            totalGenreCount++;
        });
    }

    let genreCounts = {
        'Action': 0,
        'Adventure': 0,
        'Fantasy': 0,
        'Game': 0,
        'Romance': 0,
        'Urban': 0
    };

    if (genresSnapshot.exists()) {
        // Loop through each genre to get their individual counts
        genresSnapshot.forEach((genreSnapshot) => {
            const genre = genreSnapshot.key;
            const books = genreSnapshot.child('books');
            let count = 0;
            if (books.exists()) {
                books.forEach(() => {
                    count++;
                });
            }
            genreCounts[genre] = count;
        });
    }

    // Update the UI with the counts
    document.getElementById('userCount').innerText = userCount;
    document.getElementById('subscribedUserCount').innerText = subscribedUserCount;
    document.getElementById('bookCount').innerText = bookCount;
    document.getElementById('totalGenreCount').innerText = totalGenreCount;

    // Update UI for individual genre counts
    Object.keys(genreCounts).forEach((genre) => {
        document.getElementById(genre.toLowerCase() + 'Count').innerText = genreCounts[genre];
    });
}

// Call the function initially to fetch and display counts
fetchCountsAndUpdateUI();
