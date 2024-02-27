import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Function to handle form submission
async function submitForm(event) {
  event.preventDefault();
  console.log(db);

  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(user?.email);
        const authUid = user?.uid;
        const email = user?.email;

        // Get form values
        const bookTitle = document.getElementById("bookTitle").value;
        const genresInput = document.getElementById("genres");
        const genres = genresInput.value
          .split(",")
          .map((genre) => genre.trim());
        const tagsInput = document.getElementById("tags");
        const tags = tagsInput.value.split(",").map((tag) => tag.trim());
        const description = document.getElementById("description").value;
        const imageUrl =
          document.getElementById("uploadedImage").src || "";

        // var file = document.getElementById("fileInput").files[0];

        // if (!file) {
        //   return alert("Please select a file.");
        // }

        // var xhr = new XMLHttpRequest();
        // var formData = new FormData();
        // formData.append("file", file);
        // xhr.open("POST", `/assets/users/books/${email}_${file.name}`);

        // xhr.onload = function () {
        //   if (xhr.status === 200) {
        //     alert("File uploaded successfully!");
        //   } else {
        //     alert("An error occurred while uploading the file.");
        //   }
        // };

        // xhr.send(formData);

        // const imageUrl = `/assets/users/books/${email}_${file.name}`;

        const newBook = {
          email: email,
          title: bookTitle,
          genres: genres,
          tags: tags,
          description: description,
          imageUrl: imageUrl.toString(),
        };

        console.log(newBook);

        await set(ref(db, `books/${bookTitle.trim()}`), newBook);
        // Clear form fields after successful submission
        document.getElementById("bookTitle").value = "";
        genresInput.value = "";
        tagsInput.value = "";
        document.getElementById("description").value = "";
        document.getElementById("uploadedImage").src = "";

        // Display success message or redirect if needed
        alert("Book added successfully!");
        window.location.replace("/html/addchapter.html")

        // Clear form fields after submission
        document.getElementById("bookTitle").value = "";
        document.getElementById("genres").value = "";
        document.getElementById("tags").value = "";
        document.getElementById("description").value = "";
        document.getElementById("uploadedImage").src = "#";

        // Reset the image container
        const imageContainer = document.getElementById("imageContainer");
        imageContainer.style.background = "#fff";
        imageContainer.querySelector("#placeholder").style.display = "block";
        imageContainer.querySelector("#uploadedImage").style.display = "none";
      }
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    alert("An unexpected error occurred. Please try again.");
  }
}

document
  .getElementById("addbooks_btn")
  .addEventListener("click", function (event) {
    submitForm(event);
  });

function previewImage(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];

  const uploadedImage = document.getElementById("uploadedImage");

  const imageContainer = document.getElementById("imageContainer");
  const placeholder = document.getElementById("placeholder");

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imageContainer.style.background = "none";
      placeholder.style.display = "none";
      uploadedImage.style.display = "block";
      uploadedImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
  } else {
    imageContainer.style.background = "#fff";
    placeholder.style.display = "block";
    uploadedImage.style.display = "none";
    uploadedImage.src = "#";
  }
}
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    previewImage(event);
  });


























  import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

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
        if (bookId) {
          const bookRef = ref(db, `books/${bookId}`);
          const snapshot = await get(bookRef);

          if (snapshot.exists()) {
            const book = snapshot.val();
            // Populate the form fields with book details
            document.getElementById("editbookTitle").value = book.title;
            document.getElementById("editgenres").value = book.genres.join(", ");
            document.getElementById("edittags").value = book.tags.join(", ");
            document.getElementById("editdescription").value = book.description;
            document.getElementById("edituploadedImage").src = book.imageUrl;

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

// Event listener for submitting edited book details
document.getElementById("saveChangesBookBtn").addEventListener("click", async function (event) {
  event.preventDefault();
  // Retrieve the book ID from the URL parameter
  const bookId = getBookIdFromURL();
  if (bookId) {
    await submitEditedBookDetails(bookId);
  } else {
    console.error("No book ID found in URL parameter.");
    alert("No book ID found in URL parameter.");
  }
});

// Function to submit edited book details
async function submitEditedBookDetails(bookId) {
  try {
    const title = document.getElementById("editbookTitle").value;
    const genres = document.getElementById("editgenres").value.split(",").map((genre) => genre.trim());
    const tags = document.getElementById("edittags").value.split(",").map((tag) => tag.trim());
    const description = document.getElementById("editdescription").value;
    const imageUrl = document.getElementById("edituploadedImage").src;

    // Get the current user's email
    const currentUser = auth.currentUser;
    const email = currentUser ? currentUser.email : null;

    // Update the book details in the database
    await set(ref(db, `books/${bookId}`), {
      title: title,
      genres: genres,
      tags: tags,
      description: description,
      imageUrl: imageUrl,
      userEmail: email, // Add user's email to the database
    });

    // Hide the form after submission
    document.getElementById("editBookForm").style.display = "none";

    // Optionally, you can display a success message
    alert("Book details updated successfully!");
    window.location.href = "/html/authordashboard.html";
  } catch (error) {
    console.error("Error updating book details:", error);
    alert("An error occurred while updating book details. Please try again.");
  }
}

// Event listener for addbooks
document
  .getElementById("saveChangesBookBtn")
  .addEventListener("click", function () {
    submitEditedBookDetails();
  });
















  import { auth, db } from "./firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

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
        if (bookId) {
          const bookRef = ref(db, `books/${bookId}`);
          const snapshot = await get(bookRef);

          if (snapshot.exists()) {
            const book = snapshot.val();
            // Populate the form fields with book details
            document.getElementById("editbookTitle").value = book.title;
            document.getElementById("editgenres").value = book.genres.join(", ");
            document.getElementById("edittags").value = book.tags.join(", ");
            document.getElementById("editdescription").value = book.description;
            document.getElementById("edituploadedImage").src = book.imageUrl;

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

// Event listener for submitting edited book details
document.getElementById("saveChangesBookBtn").addEventListener("click", async function (event) {
  event.preventDefault();
  // Retrieve the book ID from the URL parameter
  const bookId = getBookIdFromURL();
  if (bookId) {
    await submitEditedBookDetails(bookId);
  } else {
    console.error("No book ID found in URL parameter.");
    alert("No book ID found in URL parameter.");
  }
});

// Function to submit edited book details
async function submitEditedBookDetails(bookId) {
  try {
    const title = document.getElementById("editbookTitle").value;
    const genres = document.getElementById("editgenres").value.split(",").map((genre) => genre.trim());
    const tags = document.getElementById("edittags").value.split(",").map((tag) => tag.trim());
    const description = document.getElementById("editdescription").value;
    const imageUrl = document.getElementById("edituploadedImage").src;
    const user = auth.currentUser;
    const email = user ? user.email : null; // Get the user's email

    // Update the book details in the database
    await set(ref(db, `books/${bookId}`), {
      title: title,
      genres: genres,
      tags: tags,
      description: description,
      imageUrl: imageUrl,
      email: email // Add the user's email to the data
    });

    // Hide the form after submission
    document.getElementById("editBookForm").style.display = "none";

    // Optionally, you can display a success message
    alert("Book details updated successfully!");
    window.location.href = "/html/authordashboard.html"; // Corrected this line
  } catch (error) {
    console.error("Error updating book details:", error);
    alert("An error occurred while updating book details. Please try again.");
  }
}

// Event listener for addbooks
document
  .getElementById("saveChangesBookBtn")
  .addEventListener("click", function () {
    submitEditedBookDetails();
  });
























  
// // Function to extract the book ID from the URL parameter
// function getBookIdFromURL() {
//   const urlParams = new URLSearchParams(window.location.search);
//   return urlParams.get("bookId");
// }

// // Function to display chapters
// async function displayChapters(bookId) {
//   try {
//     const chaptersRef = ref(db, `books/${bookId}/chapters`);
//     const snapshot = await get(chaptersRef);
//     const chapters = snapshot.val();

//     if (chapters) {
//       const chaptersContainer = document.getElementById("chaptersContainer");

//       for (const chapterId in chapters) {
//         const chapter = chapters[chapterId];
//         const chapterBox = document.createElement("div");
//         chapterBox.classList.add("chapter-box");

//         const chapterTitle = document.createElement("div");
//         chapterTitle.classList.add("chapter-title");
//         chapterTitle.textContent = chapter.title;

//         const timestamp = document.createElement("div");
//         timestamp.classList.add("timestamp");
//         timestamp.textContent = chapter.timestamp;

//         // Create a link to contentpage.html with the chapter content as a query parameter
//         const contentLink = document.createElement("a");
//         contentLink.textContent = "Read";
//         contentLink.href = `/html/contentpage.html?bookId=${bookId}&chapterId=${chapterId}`;

//         chapterBox.appendChild(chapterTitle);
//         chapterBox.appendChild(timestamp);
//         chapterBox.appendChild(contentLink);

//         chaptersContainer.appendChild(chapterBox);
//       }
//     } else {
//       console.log("No chapters found for this book.");
//     }
//   } catch (error) {
//     console.error("Error fetching chapters:", error);
//     alert("An error occurred while fetching chapters. Please try again.");
//   }
// }

// // Call displayChapters function when the page loads
// window.onload = function () {
//   const bookId = getBookIdFromURL();
//   if (bookId) {
//     displayChapters(bookId);
//   } else {
//     console.error("No book ID found in URL parameter.");
//     alert("No book ID found in URL parameter.");
//   }
// };