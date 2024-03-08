import { db, auth } from "./firebaseConfig.mjs";
import {
  ref,
  get,
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


// Function to fetch and display book details
async function displayBookDetails(bookId) {
  const bookDetailsContainer = document.getElementById("bookDetailsContainer");

  try {
    // Fetch book details
    const bookSnapshot = await get(ref(db, `books/${bookId}`));
    const bookData = bookSnapshot.val();

    // Create element to display book title
    const bookTitle = document.createElement("h2");
    bookTitle.textContent = bookData.title;
    bookDetailsContainer.appendChild(bookTitle);

    // Fetch chapters
    const chaptersRef = ref(db, `books/${bookId}/chapters`);
    const chaptersSnapshot = await get(chaptersRef);
    const chapters = chaptersSnapshot.val();

    if (chapters) {
      const chapterIds = Object.keys(chapters);
      let currentChapterIndex = 0;

      // Function to display current chapter content
      function displayCurrentChapter() {
        const currentChapterId = chapterIds[currentChapterIndex];
        const currentChapter = chapters[currentChapterId];

        // Clear previous chapter content
        bookDetailsContainer.innerHTML = "";

        // Display book title
        bookDetailsContainer.appendChild(bookTitle);

        // Add navigation buttons above the content
        const backButtonTop = document.createElement("button");
        backButtonTop.classList.add("float-left");
        backButtonTop.textContent = "Previous Chapter";
        backButtonTop.addEventListener("click", () => {
          if (currentChapterIndex > 0) {
            currentChapterIndex--;
            displayCurrentChapter();
          }
        });
        bookDetailsContainer.appendChild(backButtonTop);

        const indexButtonTop = document.createElement("button");
        indexButtonTop.classList.add("float-center");
        indexButtonTop.textContent = "Index";
        indexButtonTop.addEventListener("click", () => {
          location.href = `/html/previewpage.html?bookId=${bookId}`;
        });
        bookDetailsContainer.appendChild(indexButtonTop);

        const nextButtonTop = document.createElement("button");
        nextButtonTop.classList.add("float-right");
        nextButtonTop.textContent = "Next Chapter";
        nextButtonTop.addEventListener("click", () => {
          if (currentChapterIndex < chapterIds.length - 1) {
            currentChapterIndex++;
            displayCurrentChapter();
          }
        });
        bookDetailsContainer.appendChild(nextButtonTop);

        // Display chapter title
        const chapterTitle = document.createElement("h3");
        chapterTitle.textContent = currentChapter.title;
        bookDetailsContainer.appendChild(chapterTitle);

        // Display chapter content with each sentence on a new line
        const chapterContent = document.createElement("p");
        chapterContent.textContent = currentChapter.content.replace(
          /(\.|\?|\!)(\s|$)/g,
          "$1\n"
        );
        bookDetailsContainer.appendChild(chapterContent);

        // Add navigation buttons below the content
        const backButtonBottom = document.createElement("button");
        backButtonBottom.classList.add("float-left");
        backButtonBottom.textContent = "Previous Chapter";
        backButtonBottom.addEventListener("click", () => {
          if (currentChapterIndex > 0) {
            currentChapterIndex--;
            displayCurrentChapter();
          }
        });
        bookDetailsContainer.appendChild(backButtonBottom);

        const indexButtonBottom = document.createElement("button");
        indexButtonBottom.classList.add("float-center");
        indexButtonBottom.textContent = "Index";
        indexButtonBottom.addEventListener("click", () => {
          location.href = `/html/previewpage.html?bookId=${bookId}`;
        });
        bookDetailsContainer.appendChild(indexButtonBottom);

        const nextButtonBottom = document.createElement("button");
        nextButtonBottom.classList.add("float-right");
        nextButtonBottom.textContent = "Next Chapter";
        nextButtonBottom.addEventListener("click", () => {
          if (currentChapterIndex < chapterIds.length - 1) {
            currentChapterIndex++;
            displayCurrentChapter();
          }
        });
        bookDetailsContainer.appendChild(nextButtonBottom);
      }

      // Initial display of the first chapter
      displayCurrentChapter();
    } else {
      console.log("No chapters found for this book.");
    }
  } catch (error) {
    console.error("Error fetching book details:", error);
    alert("An error occurred while fetching book details. Please try again.");
  }
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

document.getElementById("bookmarkchpbtn").addEventListener("click", function (event) {
  event.preventDefault(); // Prevent default action of the link
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("bookId"); // Extract the bookId from URL parameters
  if (bookId) {
    bookmarkBook(bookId); // Call the bookmarkBook function with the extracted bookId
  } else {
    console.error("Book ID not found in URL parameters");
  }
});


async function displayChapters(bookId) {
  try {
    const chaptersDropdown = document.getElementById('chaptersDropdown');
    chaptersDropdown.innerHTML = ''; // Clear previous chapter links

    // Reference to the chapters node for the specified bookId
    const chaptersRef = ref(db, `books/${bookId}/chapters`);
    const snapshot = await get(chaptersRef);
    const chapters = snapshot.val();

    if (chapters) {
      // Iterate over each chapter and create a link for it
      for (const chapterId in chapters) {
        const chapter = chapters[chapterId];
        const chapterLink = document.createElement('a');
        chapterLink.href = `displaychapters.html?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`;
        chapterLink.textContent = chapter.title;
        chapterLink.addEventListener('click', (event) => {
          // Prevent default behavior to avoid navigating to the link
          event.preventDefault();
          // Call function to display chapter content
          displayChapterContent(bookId, chapterId);
        });
        const chapterListItem = document.createElement('div');
        chapterListItem.appendChild(chapterLink);
        chaptersDropdown.appendChild(chapterListItem);
      }
    } else {
      const noChaptersMsg = document.createElement('p');
      noChaptersMsg.textContent = 'No chapters available.';
      chaptersDropdown.appendChild(noChaptersMsg);
    }
  } catch (error) {
    console.error('Error fetching chapters:', error);
    alert('An error occurred while fetching chapters. Please try again.');
  }
}

// Function to display chapter content
async function displayChapterContent(bookId, chapterId) {
  try {
    // Fetch chapter content from Firebase Realtime Database
    const chapterContentRef = ref(db, `books/${bookId}/chapters/${chapterId}/content`);
    const snapshot = await get(chapterContentRef);
    const chapterContent = snapshot.val();

    // Display the chapter content (replace this with your desired implementation)
    console.log('Chapter Content:', chapterContent);
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    alert('An error occurred while fetching chapter content. Please try again.');
  }
}

// Function to toggle dropdown visibility
function toggleDropdown(elementId, displayMode) {
  const dropdown = document.getElementById(elementId);
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Call the displayChapters function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Extract the book ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('bookId');

  if (bookId) {
    displayChapters(bookId);
  } else {
    console.error('Book ID not found in URL parameters');
  }
});