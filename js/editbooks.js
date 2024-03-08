import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  set,
  ref,
  get,
  push,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// function logout
onAuthStateChanged(auth, async (user) => {
  if (!user) {
alert("Login first!");
    return (window.location.href = "./loginPagePath.html");
  }
});


// Function to extract the book ID from the URL parameter
function getBookIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("bookId");
}

// Function to edit book details
async function editBookDetails() {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const bookId = getBookIdFromURL();
        console.log("Book ID from URL parameter:", bookId);
        if (bookId) {
          const bookRef = ref(db, `books/${bookId}`);
          const snapshot = await get(bookRef);

          if (snapshot.exists()) {
            const book = snapshot.val();
            console.log("Retrieved book details:", book);

            // Display book details as readonly initially
            document.getElementById("editbookTitle").value = book.title;
            document.getElementById("edittags").value = book.tags.join(", ");
            document.getElementById("editdescription").value = book.description;
            document.getElementById("edituploadedImage").src = book.imageUrl;

            // Add event listener to make fields editable when edit icon is clicked
            const editIcons = document.querySelectorAll('.bx.bxs-edit');
            editIcons.forEach(icon => {
              icon.addEventListener('click', () => {
                const field = icon.parentElement.querySelector('input, textarea');
                makeEditable(field);
              });
            });

            // Check checkboxes for selected genres
            const selectedGenres = book.genres;
            const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
            genreCheckboxes.forEach((checkbox) => {
              checkbox.checked = selectedGenres.includes(checkbox.value);
            });

            // Add event listener to make image editable when browse button is clicked
            document.getElementById('editbrowseButton').addEventListener('click', () => {
              document.getElementById('editfileInput').click();
            });

            // Show the form for editing
            document.getElementById("editBookForm").style.display = "block";
          } else {
            console.error("Book not found.");
            alert("Book not found. Please try again.");
          }
        } else {
          console.error("No book ID found in URL parameter.");
          alert("No book ID found in URL parameter.");
        }
      } else {
        console.log("User not authenticated.");
        // Handle the case where the user is not authenticated
        // For example, show a login prompt or redirect to the login page
      }
    });
  } catch (error) {
    console.error("Error editing book details:", error);
    alert("An error occurred while editing book details. Please try again.");
  }
}

// Function to make field editable
function makeEditable(field) {
  field.removeAttribute('readonly');
  field.focus();
}

// Call the editBookDetails function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", editBookDetails);






// Event listener for submitting edited book details
document
  .getElementById("saveChangesBookBtn")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    // Retrieve the book ID from the URL parameter
    const bookId = getBookIdFromURL();
    console.log("Saving changes for book ID:", bookId);
    if (bookId) {
      await submitEditedBookDetails(bookId);
    } else {
      console.error("No book ID found in URL parameter.");
      alert("No book ID found in URL parameter.");
    }
  });

async function submitEditedBookDetails(bookId) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User not authenticated.");
      return;
    }

    console.log("Submitting edited book details for book ID:", bookId);

    const userSnapshot = await get(ref(db, `users/${currentUser.uid}`));
    const username = userSnapshot.val().username;

    const title = document.getElementById("editbookTitle").value;
    const selectedGenres = Array.from(
      document.querySelectorAll('input[name="genre"]:checked')
    ).map((checkbox) => checkbox.value);

    console.log("Selected genres:", selectedGenres);

    if (selectedGenres.length > 3) {
      alert("Please select up to three genres.");
      return;
    }

    const tags = document
      .getElementById("edittags")
      .value.split(",")
      .map((tag) => tag.trim());
    const description = document.getElementById("editdescription").value;
    const imageUrl = document.getElementById("edituploadedImage").src;

    console.log("Form values:", title, selectedGenres, tags, description, imageUrl);

    const bookRef = ref(db, `books/${bookId}`);
    const snapshot = await get(bookRef);

    if (!snapshot.exists()) {
      console.error("Book not found.");
      alert("Book not found. Please try again.");
      return;
    }

    const oldBook = snapshot.val();

    // Remove the book from previous genres
    await Promise.all(
      oldBook.genres.map(async (genre) => {
        const genreBookRef = ref(db, `genres/${genre}/books/${bookId}`);
        await set(genreBookRef, null);
      })
    );

    // Remove the book from previous tags
    await Promise.all(
      oldBook.tags.map(async (tag) => {
        const tagBookRef = ref(db, `tags/${tag}/books/${bookId}`);
        await set(tagBookRef, null);
      })
    );

    // Update the book details in the database
    const updatedBook = {
      title: title,
      genres: selectedGenres,
      tags: tags,
      description: description,
      imageUrl: imageUrl,
      email: currentUser.email,
      username: username,
    };

    await set(bookRef, updatedBook);

    console.log("Updated book details:", updatedBook);

    // Update tags under 'tags' node
    await Promise.all(
      tags.map(async (tag) => {
        const tagBookRef = ref(db, `tags/${tag}/books/${bookId}`);
        await set(tagBookRef, updatedBook);
      })
    );

    // Update genres under 'genres' node
    await Promise.all(
      selectedGenres.map(async (genre) => {
        const genreBookRef = ref(db, `genres/${genre}/books/${bookId}`);
        await set(genreBookRef, updatedBook);
      })
    );

    document.getElementById("editBookForm").style.display = "none";

    alert("Book details updated successfully!");
    window.location.href = "/html/authordashboard.html";
  } catch (error) {
    console.error("Error updating book details:", error);
    alert("An error occurred while updating book details. Please try again.");
  }
}

