import { db, auth } from "./firebaseConfig.mjs";
import { ref, update, get, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js';
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

// Call the displayBooks function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayBooks();
});


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

    // Trash icon for deleting the book
    // const trashIcon = document.createElement('i');
    // trashIcon.classList.add('fas', 'fa-trash', 'delete-icon');
    // trashIcon.setAttribute('title', 'Delete');
    // trashIcon.addEventListener('click', () => {
    //     deleteBook(bookId);
    // });
    // genreTagsContainer.appendChild(trashIcon);

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

