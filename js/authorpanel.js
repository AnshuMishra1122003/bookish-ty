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

  // Create cover image container
  const coverImgContainer = document.createElement("div");
  coverImgContainer.classList.add("cover-img-container");

  const coverImg = document.createElement("img");
  coverImg.src = book.imageUrl;
  coverImg.alt = "Book Cover";
  coverImgContainer.appendChild(coverImg);

  // Add event listener to coverImgContainer
  coverImgContainer.onclick = function () {
    // Redirect to preview page with book ID as URL parameter
    window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  };

  // Create title and description container
  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content-container");

  const titleContainer = document.createElement("div");
  titleContainer.classList.add("title");
  titleContainer.textContent = `${book.title}`;

  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("description");
  descriptionContainer.innerHTML = `<p>${book.description}</p>`;

  contentContainer.append(titleContainer, descriptionContainer);

  // Add event listener to contentContainer
  contentContainer.onclick = function () {
    // Redirect to preview page with book ID as URL parameter
    window.location.href = `/html/previewpage.html?bookId=${encodeURIComponent(
      bookId
    )}`;
  };
  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");

  const button1 = document.createElement("button");
  button1.id = "editBookBtn";
  button1.textContent = "Edit Book";
  button1.addEventListener("click", function () {
    // Call the editBookDetails function with bookId parameter
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

  const button3 = document.createElement("button");
  button3.id = "editChaptersBtn";
  button3.textContent = "Edit Chapters";
  button3.addEventListener("click", function () {
    toggleButton(button3);
    // Call the function to display the edit chapters form or perform other actions
  });

  const button4 = document.createElement("button");
  button4.id = "deleteChaptersBtn";
  button4.textContent = "Delete Chapters";
  button4.addEventListener("click", function () {
    toggleButton(button4);
    // Call the function to display the delete chapters form or perform other actions
  });

  const button5 = document.createElement("button");
  button5.id = "deleteBookBtn";
  button5.textContent = "Delete Book";
  button5.addEventListener("click", function () {
    toggleButton(button5);
    // Call the function to display the delete book confirmation or perform other actions
  });

  // Function to toggle button display
  function toggleButton(clickedButton) {
    const buttons = [button1, button2, button3, button4, button5];
    buttons.forEach((button) => {
      if (button === clickedButton) {
        button.classList.toggle("show");
      } else {
        button.classList.remove("show");
      }
    });
  }

  // Append buttons to the container
  buttonsContainer.append(button1);
  buttonsContainer.append(button2);
  buttonsContainer.append(button3);
  buttonsContainer.append(button4);
  buttonsContainer.append(button5);

  // Append everything to the book container
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
    // Create book container
    const bookElement = createBookContainer(book, bookId);

    // Append the book container to the content
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
    // No books found
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
    // Handle the case where userEmail is not defined
    // For example, show a login prompt or redirect to the login page
  }
}

// Assume this is called when the page loads or whenever appropriate
function initialize() {
  // Attach an observer to watch for changes in authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If a user is signed in, set userEmail
      userEmail = user.email;
      // Display the user's books
      displayUserBooks();
    } else {
      // If no user is signed in, you can handle it accordingly
      console.log("No user is signed in.");
      // You might want to clear the book display or show a login prompt
    }
  });
}

// Call the initialize function to set up the observer
initialize();

/// Add event listener to displayUserBooks element
document
  .getElementById("displayUserBooks")
  .addEventListener("click", function () {
    displayUserBooks(); // Call the function without passing userEmail
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
    uploadedImage.src = "#"; // Reset the image source
  }
}

// Event listener for file input change (image upload)
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    previewImage(event);
  });

// Function to handle addbooks form submission
async function submitForm(event) {
  event.preventDefault();

  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;

        try {
          // Fetch user details to get username
          const userSnapshot = await get(ref(db, `users/${user.uid}`));
          const username = userSnapshot.val().username;

          // Get form values
          const bookTitle = document.getElementById("bookTitle").value;
          const selectedGenres = document.querySelectorAll(
            'input[name="genre"]:checked'
          );

          if (selectedGenres.length > 3) {
            alert("Please select up to three genres.");
            return;
          }

          // Create an array to store selected genres
          const genres = Array.from(selectedGenres).map(
            (checkbox) => checkbox.value
          );
          const tagsInput = document.getElementById("tags");
          const tags = tagsInput.value.split(",").map((tag) => tag.trim());
          const description = document.getElementById("description").value;
          const imageUrl =
            document.getElementById("uploadedImage").src || "";

          // Create a new book object
          const newBook = {
            email: email,
            username: username,
            title: bookTitle,
            genres: genres,
            tags: tags,
            description: description,
            imageUrl: imageUrl.toString(),
          };

          // Get a reference to the 'books' node
          const booksRef = ref(db, "books");

          // Generate a unique key for the new book
          const newBookRef = push(booksRef);

          // Store the book details under the 'books' node
          await set(newBookRef, newBook);

          // Store tags under 'tags' node
          tags.forEach(async (tag) => {
            const tagBookRef = ref(db, `tags/${tag}/books/${newBookRef.key}`);
            await set(tagBookRef, newBook);
          });

          // Iterate over selected genres and store book ID under each genre node
          selectedGenres.forEach(async (checkbox) => {
            const genre = checkbox.value;

            // Get a reference to the genre node
            const genreBookRef = ref(
              db,
              `genres/${genre}/books/${newBookRef.key}`
            );

            // Store the book ID under the genre node
            await set(genreBookRef, newBook);
          });

          // Clear form fields after successful submission
          document.getElementById("bookTitle").value = "";
          tagsInput.value = "";
          document.getElementById("description").value = "";
          document.getElementById("uploadedImage").src = "";

          // Uncheck checkboxes after submission
          selectedGenres.forEach((checkbox) => {
            checkbox.checked = false;
          });

          // Display success message or redirect if needed
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


// Event listener for addbooks
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
  
  // // Function to add book details to genres and tags nodes
  // async function addBookDetailsToGenresAndTags(bookId, book) {
  //   // Store book details under 'tags' node
  //   await Promise.all(
  //     book.tags.map(async (tag) => {
  //       const tagBookRef = ref(db, `tags/${tag}/books/${bookId}`);
  //       await set(tagBookRef, book);
  //     })
  //   );
  
  //   // Store book details under 'genres' node
  //   await Promise.all(
  //     book.genres.map(async (genre) => {
  //       const genreBookRef = ref(db, `genres/${genre}/books/${bookId}`);
  //       await set(genreBookRef, book);
  //     })
  //   );
  // }
