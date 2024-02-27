import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  push,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Function to extract the book ID from the URL parameter
function getBookIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("bookId");
}

// Function to handle form submission
async function submitForm(event, bookId) {
  event.preventDefault();

  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;

        const chapterTitle = document.getElementById("chapterTitle").value;
        const chapterContent = document.getElementById("chapterContent").value;

        // Save chapter details to the database under the /books/{bookId}/chapters node
        const chapterRef = push(ref(db, `books/${bookId}/chapters`), {
          username: email,
          email: email,
          title: chapterTitle,
          content: chapterContent, // Store chapter content as-is without modification
          timestamp: new Date().toLocaleString(),
        });

        console.log(chapterRef);

        await set(ref(db, `books/${bookId}/chapters/${chapterRef.key}`), {
          username: email,
          email: email,
          title: chapterTitle,
          content: chapterContent, // Store chapter content as-is without modification
          timestamp: new Date().toLocaleString(),
        });

        // Clear form fields after successful submission
        document.getElementById("chapterTitle").value = "";
        document.getElementById("chapterContent").value = "";

        // Display success message or redirect if needed
        alert("Chapter added successfully!");
        window.location.href = `/html/addchapter.html?bookId=${encodeURIComponent(
          bookId
        )}`;
      }
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    alert("An unexpected error occurred. Please try again.");
  }
}

document
  .getElementById("addChapterBtn")
  .addEventListener("click", function (event) {
    const bookId = getBookIdFromURL(); // Get the book ID from the URL parameter
    if (bookId) {
      submitForm(event, bookId); // Pass the book ID to the submitForm function
    } else {
      console.error("No book ID found in URL parameter.");
      alert("No book ID found in URL parameter.");
    }
  });

 
// Function to display chapters
async function displayChapters(bookId) {
  try {
    const chaptersRef = ref(db, `books/${bookId}/chapters`); // Corrected this line
    const snapshot = await get(chaptersRef); // Changed to get() to fetch data
    const chapters = snapshot.val();

    if (chapters) {
      const chaptersContainer = document.getElementById("chaptersContainer");

      for (const chapterId in chapters) {
        const chapter = chapters[chapterId];
        const chapterBox = document.createElement("div");
        chapterBox.classList.add("chapter-box");

        const chapterTitle = document.createElement("div");
        chapterTitle.classList.add("chapter-title");
        chapterTitle.textContent = chapter.title;

        const timestamp = document.createElement("div");
        timestamp.classList.add("timestamp");
        timestamp.textContent = chapter.timestamp;

        // Create a link to contentpage.html with the chapter content as a query parameter
        const contentLink = document.createElement("a");
        contentLink.textContent = "Read";
        contentLink.href = `/html/contentpage.html?bookId=${bookId}&chapterId=${chapterId}`;

        chapterBox.appendChild(chapterTitle);
        chapterBox.appendChild(timestamp);
        chapterBox.appendChild(contentLink);

        chaptersContainer.appendChild(chapterBox);
      }
    } else {
      console.log("No chapters found for this book.");
    }
  } catch (error) {
    console.error("Error fetching chapters:", error);
    alert("An error occurred while fetching chapters. Please try again.");
  }
}
// Call displayChapters function when the page loads
window.onload = function () {
  const bookId = getBookIdFromURL();
  if (bookId) {
    displayChapters(bookId);
  } else {
    console.error("No book ID found in URL parameter.");
    alert("No book ID found in URL parameter.");
  }
};
