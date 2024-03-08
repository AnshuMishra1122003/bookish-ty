import { db, auth } from "./firebaseConfig.mjs";
import {
  query,
  ref,
  get,
  limitToLast,
  orderByKey,
  set,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// function logout
onAuthStateChanged(auth, async (user) => {
  if (!user) {
alert("Login first!");
    return (window.location.href = "./loginPagePath.html");
  }
});


let slideIndex = 0;
let timer; // Variable to store the timer for automatic pagination

// Fetch book details from Firebase Realtime Database
async function fetchBooks(userId) {
  const slideshowContainer = document.getElementById("slideshow-container");
  try {
    // Get snapshot of books node
    const snapshot = await get(ref(db, "books"));
    const books = snapshot.val();

    // Check if books exist
    if (books) {
      // Get an array of book objects
      const bookDetails = Object.entries(books).map(([bookId, book]) => ({
        id: bookId,
        ...book,
      }));

      // Shuffle the array of book details
      const shuffledBooks = getRandomItems(bookDetails, 6);

      // Display book details
      shuffledBooks.forEach((book) => {
        const slide = createSlide(book, book.id, userId); // Pass userId to createSlide function
        slideshowContainer.appendChild(slide);
      });
    } else {
      console.log("No books found.");
    }

    // Show slides
    showSlides();

    // Fetch another set of book details after 10 minutes
    setTimeout(fetchBooks, 600000, userId); // 10 minutes in milliseconds
  } catch (error) {
    console.error("Error fetching books: ", error);
  }
}

// Function to get random items from an array
function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to create a slide element
function createSlide(book, bookId, userId) {
  const slide = document.createElement("div");
  slide.classList.add("mySlides");

  // Create content div
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");

  const genresHeading = document.createElement("h3");
  genresHeading.textContent = "Genres: ";
  const genresSpan = document.createElement("span");
  genresSpan.textContent = book.genres;
  genresHeading.appendChild(genresSpan);

  const titleHeading = document.createElement("h2");
  titleHeading.textContent = book.title;
  titleHeading.onclick = function () {
    window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(bookId)}&userId=${userId}`; // Include userId in the URL
  };


  const descriptionPara = document.createElement("p");
  descriptionPara.textContent = book.description;

  contentDiv.appendChild(genresHeading);
  contentDiv.appendChild(titleHeading);
  contentDiv.appendChild(descriptionPara);

  // Create image container div
  const imgContainerDiv = document.createElement("div");
  imgContainerDiv.classList.add("img-container");

  const img = document.createElement("img");
  img.classList.add("img");
  img.src = book.imageUrl;
  img.alt = book.title;

  imgContainerDiv.appendChild(img);

  // Create buttons container div
  const btnSlidesDiv = document.createElement("div");
  btnSlidesDiv.classList.add("btn-slides");

  const readNowLink = document.createElement("a");
  readNowLink.classList.add("read-now");
  readNowLink.textContent = "Read now";
  readNowLink.addEventListener("click", () => {
    // Navigate to displaychapters.html with bookId parameter
    window.location.href = `/html/displaychapters.html?bookId=${bookId}`;
  });
  const bookmarkLink = document.createElement("a");
  bookmarkLink.classList.add("carousel-bkmrk");

  const bookmarkIcon = document.createElement("i");
  bookmarkIcon.classList.add("bx", "bxs-bookmark");
  bookmarkIcon.addEventListener("click", () => {
    // Call the bookmarkBook function when the button is clicked
    bookmarkBook(bookId);
  });

  bookmarkLink.appendChild(bookmarkIcon);
  btnSlidesDiv.appendChild(readNowLink);
  btnSlidesDiv.appendChild(bookmarkLink);

  // Append all elements to the slide
  slide.appendChild(contentDiv);
  slide.appendChild(imgContainerDiv);
  slide.appendChild(btnSlidesDiv);

  return slide;
}

// Show slides function
function showSlides() {
  const slides = document.getElementsByClassName("mySlides");
  const dotsContainer = document.querySelector(".slider-dots");

  // Generate dots for the slides
  dotsContainer.innerHTML = "";
  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.setAttribute("onclick", `currentSlide(${i + 1})`);
    dotsContainer.appendChild(dot);
  }

  const dots = document.getElementsByClassName("dot");

  // Hide all slides and remove active class from all dots
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    dots[i].classList.remove("active");
  }

  // Increment slide index
  slideIndex++;

  // Reset slide index if it exceeds the number of slides
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }

  // Display the current slide and activate its corresponding dot
  slides[slideIndex - 1].style.display = "flex";
  dots[slideIndex - 1].classList.add("active");

  // Schedule the next slide change after 3 seconds
  clearTimeout(timer);
  timer = setTimeout(() => {
    showSlides();
  }, 3000);
}

// Function to set current slide when dot is clicked
function currentSlide(index) {
  slideIndex = index;
  showSlides();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch user ID from session storage
  const userData = sessionStorage.getItem('user');
  let userId = null;
  if (userData) {
    const user = JSON.parse(userData);
    userId = user.uid;
  }

  // Call fetchBooks function to start fetching book details and displaying slides
  await fetchBooks(userId); // Pass userId instead of bookId
});

// second carousel

async function showGenre(genre) {
  try {
    let genrePath = 'books'; // Default to all books
    if (genre !== 'all') {
      genrePath = `genres/${genre}/books`;
    }

    // Construct the query to fetch the books and limit to last 10
    const booksRef = ref(db, genrePath);
    const q = query(booksRef, limitToLast(20), orderByKey());

    // Execute the query
    const snapshot = await get(q);
    const books = snapshot.val();

    // Log the fetched books
    console.log(`Fetched recently added ${genre} books:`, books);

    // Render the books in the HTML container
    renderBooks(books);
  } catch (error) {
    console.error(`Error fetching recently added ${genre} books:`, error);
    // Handle error if necessary
  }
}

function renderBooks(books, userId) {
  const container = document.getElementById('books-container');
  container.innerHTML = ''; // Clear previous content

  // Render each book
  for (let bookId in books) {
    const book = books[bookId];
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    // Add link to preview page with bookId as URL parameter
    const previewLink = document.createElement('a');
    previewLink.href = `/html/previewpage.html?bookId=${encodeURIComponent(bookId)}&userId=${userId}`;
    previewLink.classList.add('book-link');
    bookElement.appendChild(previewLink);

    // Add book image
    const imageElement = document.createElement('img');
    imageElement.src = book.imageUrl;
    imageElement.alt = book.title;
    imageElement.classList.add('book-image');
    previewLink.appendChild(imageElement);

    // Add book title
    const titleElement = document.createElement('h3');
    titleElement.textContent = book.title;
    titleElement.classList.add('book-title');
    previewLink.appendChild(titleElement);

    // Append book element to the container
    container.appendChild(bookElement);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch recently added books by default
  await showGenre('all');

  // Add event listener to the genre buttons
  const genreButtons = document.querySelectorAll('.pagination a');
  genreButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const genre = button.id.split('-')[1]; // Extract genre from button id
      await showGenre(genre);
    });
  });
});


async function bookmarkBook(bookId) {
  const user = auth.currentUser;
  if (!user) {
    console.log("User not logged in.");
    return;
  }
  const userId = user.uid;

  try {
    // Fetch book details
    const bookRef = ref(db, `books/${bookId}`);
    const bookSnapshot = await get(bookRef);
    const bookData = bookSnapshot.val();

    if (!bookData) {
      console.log("Book details not found.");
      return;
    }

    // Fetch user details
    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (!userData) {
      console.log("User details not found.");
      return;
    }

    // Merge book details with existing user data and set it under the books sub-node
    const userBooksRef = ref(db, `users/${userId}/books/${bookId}`);
    await set(userBooksRef, { ...bookData, userDetails: userData });

    // Check if the user is subscribed
    const isSubscribed = userData.subscribed === true;

    // If user is subscribed, also add the book details to the subscribed users' node
    if (isSubscribed) {
      const subscribedBooksRef = ref(db, `subscribedusers/${userId}/books/${bookId}`);
      await set(subscribedBooksRef, { ...bookData, userDetails: userData });
    }

    alert("Book bookmarked successfully!");
  } catch (error) {
    console.error("Error bookmarking book:", error);
    alert("An error occurred while bookmarking the book. Please try again.");
  }
}
