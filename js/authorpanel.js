// Import necessary functions from Firebase SDK
import { auth, db } from "./firebaseConfig.mjs";
import {
  query,
  orderByChild,
  equalTo,
  ref,
  onValue,
  set,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

let userEmail;
// Function to create a book container for displaying on UI
function createBookContainer(book, bookId) {
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book-container");

  const authorbookContainer = document.createElement("div");
  authorbookContainer.classList.add("book");

  const coverImgContainer = document.createElement("div");
  coverImgContainer.classList.add("cover-img-container");

  const coverImg = document.createElement("img");
  coverImg.src = book.imageUrl;
  coverImg.alt = "Book Cover";
  coverImgContainer.appendChild(coverImg);

  coverImgContainer.onclick = function () {
    window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  };

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content-container");

  const titleContainer = document.createElement("div");
  titleContainer.classList.add("title");
  titleContainer.textContent = `${book.title}`;

  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("description");
  descriptionContainer.innerHTML = `<p>${book.description}</p>`;

  contentContainer.append(titleContainer, descriptionContainer);

  contentContainer.onclick = function () {
    window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  };
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");

  const button1 = document.createElement("button");
  button1.id = "editBookBtn";
  button1.textContent = "Edit Book";
  button1.addEventListener("click", function () {
    window.location.href = `/html/editbook.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  });

  const button2 = document.createElement("button");
  button2.id = "addChaptersBtn";
  button2.textContent = "Add Chapters";
  button2.addEventListener("click", function () {
    window.location.href = `/html/addchapter.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  });

  const button5 = document.createElement("button");
  button5.id = "deleteBookBtn";
  button5.textContent = "Delete Book";
  button5.addEventListener("click", function () {
    const bookId = bookId; 
    deleteBook(bookId);
  });

  function toggleButton(clickedButton) {
    const buttons = [button1, button2, button5];
    buttons.forEach((button) => {
      if (button === clickedButton) {
        button.classList.toggle("show");
      } else {
        button.classList.remove("show");
      }
    });
  }

  buttonsContainer.append(button1);
  buttonsContainer.append(button2);
  buttonsContainer.append(button5);

  bookContainer.appendChild(coverImgContainer);
  bookContainer.appendChild(contentContainer);
  bookContainer.appendChild(buttonsContainer);
  authorbookContainer.appendChild(bookContainer);

  return bookContainer;
}

// Function to display books in the UI
function displayBooksUI(books) {
  const content = document.getElementById("displayUserBooks");
  content.innerHTML = "";

  Object.entries(books).forEach(([bookId, book]) => {
    const bookElement = createBookContainer(book, bookId);

    content.appendChild(bookElement);

    console.log("Books displayed for the user");
  });
}

// Function to handle changes in book data
function handleBookDataChange(snapshot) {
  if (snapshot.exists()) {
    const books = snapshot.val();
    displayBooksUI(books);
  } else {
    const content = document.getElementById("displayUserBooks");
    content.innerHTML += "<p>No books found.</p>";
  }
}

// Function to set up the onValue listener
function setBooksListener(userEmail) {
  const booksRef = ref(db, "books");
  const userBooksQuery = query(
    booksRef,
    orderByChild("email"),
    equalTo(userEmail)
  );

  onValue(userBooksQuery, handleBookDataChange);
}

/// Function to display user books
function displayUserBooks() {
  if (userEmail) {
    setBooksListener(userEmail);
  } else {
    console.error("User email is not defined.");
  }
}

// Assume this is called when the page loads or whenever appropriate
function initialize() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail = user.email;
      displayUserBooks();
    } else {
      console.log("No user is signed in.");
    }
  });
}

initialize();

document
  .getElementById("displayUserBooks")
  .addEventListener("click", function () {
    displayUserBooks(); 
  });

// Function to preview the selected image
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


// Function to delete a book from Firebase Realtime Database
async function deleteBook(bookId) {
  const bookRef = ref(db, `books/${bookId}`);

  try {
    const bookSnapshot = await get(bookRef);
    const bookData = bookSnapshot.val();
    const bookName = bookData.title;

    const confirmation = confirm(`Are you sure you want to delete the book "${bookName}"?`);

    if (confirmation) {
      await remove(bookRef);
      console.log(`Book "${bookName}" deleted successfully from "books" node`);

      const genres = bookData.genres || [];
      for (const genre of genres) {
        const genreRef = ref(db, `genres/${genre}/books/${bookId}`);
        await remove(genreRef);
        console.log(`Book "${bookName}" deleted successfully from "${genre}" genre node`);
      }

      fetchCountsAndUpdateUI();

      alert(`Book "${bookName}" deleted successfully.`);
    } else {
      console.log('Deletion cancelled by admin');
    }
  } catch (error) {
    console.error('Error deleting book:', error.message);
    alert('Error deleting book. Please try again later.');
  }
}


// Function to handle addbooks form submission
async function submitForm(event) {
  event.preventDefault();

  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;

        try {
          const userSnapshot = await get(ref(db, `users/${user.uid}`));
          const username = userSnapshot.val().username;

          const bookTitle = document.getElementById("bookTitle").value;
          const selectedGenres = document.querySelectorAll(
            'input[name="genre"]:checked'
          );

          if (selectedGenres.length > 3) {
            alert("Please select up to three genres.");
            return;
          }

          const genres = Array.from(selectedGenres).map(
            (checkbox) => checkbox.value
          );
          const tagsInput = document.getElementById("tags");
          const tags = tagsInput.value.split(",").map((tag) => tag.trim());
          const description = document.getElementById("description").value;
          const imageUrl =
            document.getElementById("uploadedImage").src || "";

          const newBook = {
            email: email,
            username: username,
            title: bookTitle,
            genres: genres,
            tags: tags,
            description: description,
            imageUrl: imageUrl.toString(),
          };

          const booksRef = ref(db, "books");

          const newBookRef = push(booksRef);

          await set(newBookRef, newBook);

          tags.forEach(async (tag) => {
            const tagBookRef = ref(db, `tags/${tag}/books/${newBookRef.key}`);
            await set(tagBookRef, newBook);
          });

          selectedGenres.forEach(async (checkbox) => {
            const genre = checkbox.value;

            const genreBookRef = ref(
              db,
              `genres/${genre}/books/${newBookRef.key}`
            );

            await set(genreBookRef, newBook);
          });

          document.getElementById("bookTitle").value = "";
          tagsInput.value = "";
          document.getElementById("description").value = "";
          document.getElementById("uploadedImage").src = "";

          selectedGenres.forEach((checkbox) => {
            checkbox.checked = false;
          });

          alert("Book added successfully!");
          window.location.replace("/html/authordashboard.html");
        } catch (error) {
          console.error("An unexpected error occurred:", error);
          alert("An unexpected error occurred. Please try again.");
        }
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

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("addChaptersBtn")
    .addEventListener("click", function (event) {
      const urlParams = new URLSearchParams(window.location.search);
      const bookId = urlParams.get("bookId");
      if (bookId) {
        addChapterForm(event, bookId);
      } else {
        console.error("No book ID found in URL parameter.");
        alert("No book ID found in URL parameter.");
      }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userId = user.uid; 

        const userDataSnapshot = await get(ref(db, `users/${userId}`));
        const userData = userDataSnapshot.val();

        document.getElementById('username').textContent = `${userData.username}`;
        document.getElementById('email').textContent = `${userData.email}`;
        document.getElementById('bio').textContent = `${userData.bio}`;
        document.querySelector('.user-image-container img').src = userData.imageUrl;

        const userBooksSnapshot = await get(ref(db, `users/${userId}/books`));
        let numBookmarks = 0;
        if (userBooksSnapshot.exists()) {
          userBooksSnapshot.forEach(() => {
            numBookmarks++;
          });
        }
        document.getElementById('bookmarks').textContent = `${numBookmarks}`;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      console.log("User Not Logged in")
    }
  });
});