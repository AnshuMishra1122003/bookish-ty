import { db, auth } from "./firebaseConfig.mjs";
import { query, orderByChild, ref, update, get, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';


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


let genreMenuContainer = document.getElementById("genreMenuContainer");

function toggleDropdown() {
    genreMenuContainer.classList.toggle("show");
}

// Function to handle book search by selected genres
function searchBooksByGenre() {
    const selectedGenres = [];
    const genreCheckboxes = document.querySelectorAll('.genre-item input[type="checkbox"]');
    genreCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedGenres.push(checkbox.id.replace('Genre', ''));
        }
    });
    filterBooks(selectedGenres);
}

document.querySelectorAll('.genre-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', searchBooksByGenre);
});


document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', handleDropdownSelection);
});

// Function to filter books based on selected genres
function filterBooks(genres) {
    let bookContainer = document.getElementById('bookContainer');
    bookContainer.innerHTML = ''; // Clear previous content

    let booksRefPromises = genres.map(genre => {
        if (genre === 'all') {
            return get(ref(db, 'books/'));
        } else {
            return get(ref(db, `genres/${genre}/books`));
        }
    });

    Promise.all(booksRefPromises)
        .then(snapshots => {
            let books = {};
            snapshots.forEach(snapshot => {
                snapshot.forEach(childSnapshot => {
                    let bookData = childSnapshot.val();
                    let bookId = childSnapshot.key;
                    books[bookId] = bookData;
                });
            });
            Object.keys(books).forEach(bookId => {
                let bookData = books[bookId];
                let bookElement = createBookElement(bookData, bookId);
                bookContainer.appendChild(bookElement);
            });
        })
        .catch(error => {
            console.error('Error filtering books by genre:', error);
            // Handle error if needed
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
    coverImg.onclick = function () {
        window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
            bookId
        )}`;
    };
    bookElement.appendChild(coverImg);

    // Center part - Title and Description
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');

    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = bookData.title;
    title.onclick = function () {
        window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
            bookId
        )}`;
    };
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

    // Right side - Genres and Tags
    const genreTagsContainer = document.createElement('div');
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


// Call the filterBooks function when the page loads to display all books initially
document.addEventListener('DOMContentLoaded', () => {
    filterBooks(['all']); // Display all books initially
});


// Function to delete a book from Firebase Realtime db
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
            console.log('Deletion cancelled by user');
        }
    } catch (error) {
        console.error('Error deleting book:', error.message);
        alert('Error deleting book. Please try again later.');
    }
}


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

            // Insert a non-breaking space between the buttons for spacing
            const space = document.createElement('span');
            space.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';

            // Append buttons to cellActions
            cellActions.appendChild(editButton);
            cellActions.appendChild(space); // Add space between buttons
            cellActions.appendChild(deleteButton);

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

                // Insert a non-breaking space between the buttons for spacing
                const space = document.createElement('span');
                space.innerHTML = '&nbsp;&nbsp;';

                // Append buttons to cellActions
                cellActions.appendChild(editButton);
                cellActions.appendChild(space); // Add space between buttons
                cellActions.appendChild(deleteButton);

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
async function fetchSubscribedUsers() {
    while (subscriptionsTableBody.firstChild) {
        subscriptionsTableBody.removeChild(subscriptionsTableBody.firstChild);
    }

    const usersRef = ref(db, 'users');

    const snapshot = await get(usersRef);

    let serialNumber = 1;

    snapshot.forEach(userSnapshot => {
        const userData = userSnapshot.val();

        if (userData.subscribeduser) {
            const subscribedUsersRef = ref(db, `users/${userSnapshot.key}/subscribedusers`);

            get(subscribedUsersRef).then(async subscribedUserSnapshot => {
                const subscribedUserDetails = subscribedUserSnapshot.val();

                const cardHolder = subscribedUserDetails.cardholder.toLowerCase();
                const email = subscribedUserDetails.email.toLowerCase();
                const country = subscribedUserDetails.country.toLowerCase();

                const row = document.createElement('tr');

                const cellSerialNumber = document.createElement('td');
                cellSerialNumber.textContent = serialNumber++;

                const cellCardHolder = document.createElement('td');
                cellCardHolder.textContent = subscribedUserDetails.cardholder;

                const cellEmail = document.createElement('td');
                cellEmail.textContent = subscribedUserDetails.email;

                const cellCountry = document.createElement('td');
                cellCountry.textContent = subscribedUserDetails.country;

                row.appendChild(cellSerialNumber);
                row.appendChild(cellCardHolder);
                row.appendChild(cellEmail);
                row.appendChild(cellCountry);

                subscriptionsTableBody.appendChild(row);
            }).catch(error => {
                console.error('Error fetching subscribed user details:', error.message);
            });
        }
    });
}

fetchSubscribedUsers();

// Function to fetch counts from Firebase and update the UI
async function fetchCountsAndUpdateUI() {
    const usersRef = ref(db, 'users/');
    const booksRef = ref(db, 'books/');
    const genresRef = ref(db, 'genres/');

    const usersSnapshot = await get(usersRef);
    const booksSnapshot = await get(booksRef);
    const genresSnapshot = await get(genresRef);

    let userCount = 0;
    let subscribedUserCount = 0; // Updated to count subscribed users
    let bookCount = 0;
    let totalGenreCount = 0;

    if (usersSnapshot.exists()) {
        usersSnapshot.forEach(() => {
            userCount++;
        });
    }

    // Count subscribed users properly
    usersSnapshot.forEach(userSnapshot => {
        const userData = userSnapshot.val();
        if (userData.subscribeduser) {
            subscribedUserCount++;
        }
    });

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
    document.getElementById('subscribedUserCount').innerText = subscribedUserCount; // Update subscribed user count
    document.getElementById('bookCount').innerText = bookCount;
    document.getElementById('totalGenreCount').innerText = totalGenreCount;

    // Update UI for individual genre counts
    Object.keys(genreCounts).forEach((genre) => {
        document.getElementById(genre.toLowerCase() + 'Count').innerText = genreCounts[genre];
    });
}

// Call the function initially to fetch and display counts
fetchCountsAndUpdateUI();

function searchSubscribedUsers() {
    const searchTerm = document.getElementById('searching').value.trim().toLowerCase();
    const rows = subscriptionsTableBody.getElementsByTagName('tr');

    let serialNumber = 1;
    let visibleRowCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cardHolder = row.cells[1].textContent.trim().toLowerCase();
        const email = row.cells[2].textContent.trim().toLowerCase();

        if (cardHolder.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = ''; // Show the row
            row.cells[0].textContent = serialNumber++; // Update the serial number
            visibleRowCount++;
        } else {
            row.style.display = 'none'; // Hide the row
        }
    }

    // Update total count display
    document.getElementById('subscribedUserCount').innerText = visibleRowCount;
}

document.getElementById('searching').addEventListener('input', searchSubscribedUsers);

