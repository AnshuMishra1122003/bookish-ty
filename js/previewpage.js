import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  ref,
  get,
  onValue,
  set,
  push,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

function displayBookDetails(bookId) {
  const bookDetailsContainer = document.getElementById("bookDetailsContainer");

  // Assume 'books' is the node where your books are stored in Firebase
  const bookRef = ref(db, `books/${bookId}`);

  onValue(bookRef, (snapshot) => {
    const bookData = snapshot.val();

    const mainbookContainer = document.createElement("div");
    mainbookContainer.classList.add("mainbook-container");

    const coverImg = document.createElement("img");
    coverImg.alt = "Cover";
    coverImg.classList.add("cover-img");
    coverImg.src = bookData.imageUrl;

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("title-container");

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = bookData.title;

    const genresContainer = document.createElement("div");
    genresContainer.classList.add("genres-container");
    const genretitle = document.createElement("h2")
    genretitle.textContent = "Genres:"
    genresContainer.appendChild(genretitle);
    for (const genre of bookData.genres) {
      const genreLink = document.createElement("a");
      genreLink.href = `genres.html?genre=${genre}`;
      genreLink.textContent = genre;
      genreLink.addEventListener("click", () => {
        filterBooks(genre);
      });
      genresContainer.appendChild(genreLink);
    }

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags-container");
    const tagtitle = document.createElement("h2")
    tagtitle.textContent = "Tags:"
    tagsContainer.appendChild(tagtitle);
    for (const tag of bookData.tags) {
      const tagLink = document.createElement("a");
      tagLink.href = `displaytagbook.html?tag=${tag}`;
      tagLink.textContent = tag;
      tagLink.addEventListener("click", () => {
        // Function to handle tag click event
      });
      tagsContainer.appendChild(tagLink);
    }

    titleContainer.appendChild(title);
    titleContainer.appendChild(genresContainer);
    titleContainer.appendChild(tagsContainer);

    mainbookContainer.appendChild(coverImg);
    mainbookContainer.appendChild(titleContainer);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Create "Read Now" button
    const readNowButton = document.createElement("button");
    readNowButton.textContent = "Read Now";
    readNowButton.addEventListener("click", () => {
      // Navigate to displaychapters.html with bookId parameter
      window.location.href = `displaychapters.html?bookId=${bookId}`;
    });

    // Create "Bookmark" button
    const bookmarkButton = document.createElement("button");
    bookmarkButton.innerHTML = '<i class="bx bxs-bookmark"></i>';
    bookmarkButton.addEventListener("click", () => {
      // Call the bookmarkBook function when the button is clicked
      bookmarkBook(bookId);
    });

    buttonContainer.appendChild(readNowButton);
    buttonContainer.appendChild(bookmarkButton);

    const descriptTextContainer = document.createElement("button");
    descriptTextContainer.classList.add("descript-text-container");
    descriptTextContainer.textContent = "Synopsis";

    const chapterTextContainer = document.createElement("button");
    chapterTextContainer.classList.add("chapters-text-container");
    chapterTextContainer.textContent = "Chapters";

    const descriptContainer = document.createElement("div");
    descriptContainer.classList.add("descript-container");

    // Description
    const description = document.createElement("div");
    description.classList.add("description");
    description.textContent = bookData.description;

    descriptContainer.appendChild(description);

    // Append elements to the container
    bookDetailsContainer.innerHTML = ""; // Clear previous content
    bookDetailsContainer.appendChild(mainbookContainer);
    bookDetailsContainer.appendChild(buttonContainer);
    bookDetailsContainer.appendChild(descriptTextContainer);
    bookDetailsContainer.appendChild(chapterTextContainer);
    bookDetailsContainer.appendChild(descriptContainer);

    // Display chapters container initially as default
    const chaptersContainer = document.createElement("div");
    chaptersContainer.id = "chaptersContainer";
    chaptersContainer.style.display = "none"; // Hide chapters initially

    bookDetailsContainer.appendChild(chaptersContainer);

    // Function to toggle between showing description and chapters
    function toggleDescriptionAndChapters() {
      if (this === descriptTextContainer) {
        descriptContainer.style.display = "block";
        chaptersContainer.style.display = "none";
        descriptTextContainer.textContent = "Synopsis";
        chapterTextContainer.textContent = "Chapters";
      } else {
        descriptContainer.style.display = "none";
        chaptersContainer.style.display = "block";
        displayChapters();
        descriptTextContainer.textContent = "Synopsis";
      }
    }

    // Function to display chapters
    async function displayChapters() {
      try {
        const chaptersRef = ref(db, `books/${bookId}/chapters`);
        const snapshot = await get(chaptersRef);
        const chapters = snapshot.val();

        chaptersContainer.innerHTML = ""; // Clear previous chapter details

        if (chapters) {
          let serialNumber = 1;
          for (const chapterId in chapters) {
            const chapter = chapters[chapterId];
            const chapterListItem = document.createElement("div");
            chapterListItem.classList.add("chapter-list-item");

            // Create a link to display the chapter details
            const chapterLink = document.createElement("a");
            chapterLink.href = `displaychapters.html?bookId=${bookId}&chapterId=${chapterId}`; // Link to displaychapters.html with bookId and chapterId as URL parameters
            chapterLink.textContent = `${serialNumber}. ${chapter.title}`;
            chapterListItem.appendChild(chapterLink);

            // Trash icon for deleting the chapter
            // const trashIcon = document.createElement('i');
            // trashIcon.classList.add('fas', 'fa-trash', 'delete-icon');
            // trashIcon.setAttribute('title', 'Delete');
            // trashIcon.addEventListener('click', () => {
            //   deleteChapter(bookId, chapterId, chapter.title, displayChapters);
            // });
            // chapterListItem.appendChild(trashIcon);

            chaptersContainer.appendChild(chapterListItem);
            serialNumber++;
          }
        } else {
          const noChapterMsg = document.createElement("div");
          noChapterMsg.classList.add("no-data");
          noChapterMsg.textContent = "No chapters available.";
          chaptersContainer.appendChild(noChapterMsg);
          console.log("No chapters.");
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
        alert("An error occurred while fetching chapters. Please try again.");
      }
    }
    // Add event listeners to toggle buttons
    descriptTextContainer.addEventListener(
      "click",
      toggleDescriptionAndChapters
    );
    chapterTextContainer.addEventListener(
      "click",
      toggleDescriptionAndChapters
    );
  });
}

// Call the displayBookDetails function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Extract the book ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("bookId");

  if (bookId) {
    displayBookDetails(bookId);
  } else {
    // Handle case where book ID is not provided
    console.error("Book ID not found in URL parameters");
  }
});

////////////////////////////////////////////////////
////////////Review page
/////////////////////////////////////////////////////
// Function to handle writing a review
async function writeReview(event) {
  event.preventDefault(); // Prevent default form submission behavior

  // Get current user
  const user = auth.currentUser;
  if (!user) {
    console.log("User not logged in.");
    return;
  }
  const userId = user.uid;

  // Get review data from the form
  const reviewTitle = document.getElementById("reviewTitle").value;
  const reviewContent = document.getElementById("reviewContent").value;

  // Check if review fields are empty
  if (!reviewTitle || !reviewContent) {
    alert("Please fill out all review fields.");
    return;
  }

  // Get the book ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("bookId");

  try {
    // Fetch user data from the 'users' node
    const userSnapshot = await get(ref(db, `users/${userId}`));
    const userData = userSnapshot.val();
    const username = userData.username; // Assuming the username is stored under 'username' in the user data

    // Add review to the database
    const reviewRef = ref(db, `books/${bookId}/reviews`);
    await set(push(reviewRef), {
      title: reviewTitle,
      content: reviewContent,
      userId: userId,
      username: username,
    });

    alert("Review submitted successfully!");
    // Clear form fields after submission
    document.getElementById("reviewTitle").value = "";
    document.getElementById("reviewContent").value = "";

    // Display updated reviews
    displayReviews(bookId);
  } catch (error) {
    console.error("Error writing review:", error);
    alert("An error occurred while submitting the review. Please try again.");
  }
}


// Function to display reviews for a book
async function displayReviews(bookId) {
  const reviewsContainer = document.getElementById("reviewsContainer");
  reviewsContainer.innerHTML = ""; // Clear previous reviews

  try {
    const reviewsRef = ref(db, `books/${bookId}/reviews`);
    const snapshot = await get(reviewsRef);
    const reviews = snapshot.val();

    if (reviews) {
      for (const reviewId in reviews) {
        const review = reviews[reviewId];
        const reviewItem = document.createElement("div");
        reviewItem.classList.add("review-item");

        const reviewTitle = document.createElement("h3");
        reviewTitle.textContent = review.title;

        const reviewContent = document.createElement("p");
        reviewContent.textContent = review.content;

        const reviewerInfo = document.createElement("p");
        reviewerInfo.textContent = `Reviewed by: ${review.username}`;

        reviewItem.appendChild(reviewTitle);
        reviewItem.appendChild(reviewContent);
        reviewItem.appendChild(reviewerInfo);

        reviewsContainer.appendChild(reviewItem);
      }
    } else {
      const noReviewMsg = document.createElement("p");
      noReviewMsg.textContent = "No reviews yet.";
      reviewsContainer.appendChild(noReviewMsg);
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    alert("An error occurred while fetching reviews. Please try again.");
  }
}

// Ensure user is logged in before allowing review submission
onAuthStateChanged(auth, (user) => {
  const writeReviewForm = document.getElementById("writeReviewForm");
  if (user && writeReviewForm) {
    writeReviewForm.addEventListener("submit", writeReview);
  } else {
    // Hide review form if user is not logged in
    if (writeReviewForm) {
      writeReviewForm.style.display = "none";
    }
    console.log("User not logged in.");
  }
});

// Call displayReviews function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Extract the book ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("bookId");

  if (bookId) {
    displayReviews(bookId);
  } else {
    console.error("Book ID not found in URL parameters");
  }
});

// Function to delete a chapter
async function deleteChapter(bookId, chapterId, chapterTitle, displayChapters) {
  if (confirm(`Are you sure you want to delete the chapter "${chapterTitle}"?`)) {
    try {
      await remove(ref(db, `books/${bookId}/chapters/${chapterId}`));
      alert(`Chapter "${chapterTitle}" deleted successfully.`);
      // Refresh chapter display
      displayChapters();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("An error occurred while deleting the chapter. Please try again.");
    }
  }
}

// Function to display random books
async function displayRandomBooks() {
  try {
    const booksRef = ref(db, "books");
    const snapshot = await get(booksRef);
    const allBooks = snapshot.val();

    // Get 16 random book IDs
    const randomBookIds = Object.keys(allBooks)
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    const randomBooksContainer = document.getElementById("randomBooksContainer");
    randomBooksContainer.innerHTML = ""; // Clear previous content

    // Display "You might also like" above the books
    const title = document.createElement("h2");
    title.textContent = "You might also like";
    randomBooksContainer.appendChild(title);

    const booksGrid = document.createElement("div");
    booksGrid.classList.add("books-grid");
    randomBooksContainer.appendChild(booksGrid);

    randomBookIds.forEach((bookId) => {
      const bookData = allBooks[bookId];

      // Create book container
      const bookContainer = document.createElement("div");
      bookContainer.classList.add("book-container");

      // Create image element
      const image = document.createElement("img");
      image.src = bookData.imageUrl;
      image.alt = "Book Cover";
      image.classList.add("book-image");

      // Create title element
      const title = document.createElement("h3");
      title.textContent = bookData.title;
      title.classList.add("book-title");

      // Add event listener to navigate to preview page
      bookContainer.addEventListener("click", () => {
        window.location.href = `previewpage.html?bookId=${bookId}`;
      });

      // Append image and title to the book container
      bookContainer.appendChild(image);
      bookContainer.appendChild(title);

      // Append book container to the grid
      booksGrid.appendChild(bookContainer);
    });
  } catch (error) {
    console.error("Error fetching random books:", error);
    alert("An error occurred while fetching random books. Please try again.");
  }
}

// Call displayRandomBooks function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  displayRandomBooks();
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

