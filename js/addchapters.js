import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  push,
  ref,
  set,
  get,
  remove,
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
    const chaptersRef = ref(db, `books/${bookId}/chapters`);
    const snapshot = await get(chaptersRef);
    const chapters = snapshot.val();

    if (chapters) {
      const chaptersContainer = document.getElementById("chaptersContainer");
      chaptersContainer.innerHTML = ""; // Clear existing content

      let index = 1; // Initialize index counter

      for (const chapterId in chapters) {
        const chapter = chapters[chapterId];
        const chapterBox = document.createElement("div");
        chapterBox.classList.add("chapter-box");

        // Create a link to displaychapters.html with the chapter ID as a query parameter
        const chapterTitle = document.createElement("a");
        chapterTitle.classList.add("chapter-title");
        chapterTitle.textContent = `${index}. ${chapter.title}`; // Display index with chapter title
        chapterTitle.href = `/html/displaychapters.html?bookId=${bookId}&chapterId=${chapterId}`;

        // Trash icon for deleting the chapter
        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon'); // Use the correct Font Awesome class
        trashIcon.setAttribute('title', 'Delete');
        trashIcon.addEventListener('click', () => {
          deleteChapter(bookId, chapterId, chapter.title, displayChapters); // Corrected function call
        });

        chapterBox.appendChild(trashIcon);
        chapterBox.appendChild(chapterTitle);

        chaptersContainer.appendChild(chapterBox);

        index++; // Increment index counter
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
