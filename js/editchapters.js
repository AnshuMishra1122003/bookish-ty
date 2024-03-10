import { db } from "./firebaseConfig.mjs";
import {
    ref,
    get,
    set,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Function to extract the book ID from the URL parameter
function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("bookId");
}

// Function to extract the chapter ID from the URL parameter
function getChapterIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("chapterId");
}

// Function to fetch chapter details and populate the form fields
async function displayChapterDetails(bookId, chapterId) {
    try {
        const chapterRef = ref(db, `books/${bookId}/chapters/${chapterId}`);
        const snapshot = await get(chapterRef);
        const chapterData = snapshot.val();

        if (chapterData) {
            // Populate form fields with chapter title and content
            const chapterTitleInput = document.getElementById("chapterTitle");
            const chapterContentInput = document.getElementById("chapterContent");

            chapterTitleInput.value = chapterData.title;
            chapterContentInput.value = chapterData.content;

            // Make form fields read-only initially
            chapterTitleInput.readOnly = true;
            chapterContentInput.readOnly = true;

            // Create an edit icon for chapter title
            const editIconTitle = document.createElement('i');
            editIconTitle.classList.add('bx', 'bxs-edit', 'edit-icon');
            editIconTitle.setAttribute('title', 'Edit Title');
            editIconTitle.addEventListener('click', () => {
                toggleReadOnly(chapterTitleInput);
            });
            chapterTitleInput.parentNode.appendChild(editIconTitle);

            // Create an edit icon for chapter content
            const editIconContent = document.createElement('i');
            editIconContent.classList.add('bx', 'bxs-edit', 'edit-icon');
            editIconContent.setAttribute('title', 'Edit Content');
            editIconContent.addEventListener('click', () => {
                toggleReadOnly(chapterContentInput);
            });
            chapterContentInput.parentNode.appendChild(editIconContent);
        } else {
            console.log("Chapter not found in the database.");
            alert("Chapter not found in the database.");
        }
    } catch (error) {
        console.error("Error fetching chapter details:", error);
        alert("An error occurred while fetching chapter details. Please try again.");
    }
}

// Function to toggle readonly attribute of form fields
function toggleReadOnly(inputField) {
    inputField.readOnly = !inputField.readOnly;
}

// Call function to display chapter details when the page loads
window.onload = function () {
    const bookId = getBookIdFromURL();
    const chapterId = getChapterIdFromURL();

    if (bookId && chapterId) {
        displayChapterDetails(bookId, chapterId);
    } else {
        console.error("No book ID or chapter ID found in URL parameters.");
        alert("No book ID or chapter ID found in URL parameters.");
    }
};

// Handle form submission
document.getElementById("addChapterBtn").addEventListener("click", async function (event) {
    event.preventDefault();

    const bookId = getBookIdFromURL();
    const chapterId = getChapterIdFromURL();

    if (!bookId || !chapterId) {
        console.error("No book ID or chapter ID found in URL parameters.");
        alert("No book ID or chapter ID found in URL parameters.");
        return;
    }

    const chapterTitleInput = document.getElementById("chapterTitle");
    const chapterContentInput = document.getElementById("chapterContent");

    const updatedTitle = chapterTitleInput.value.trim();
    const updatedContent = chapterContentInput.value.trim();

    if (!updatedTitle || !updatedContent) {
        alert("Please provide both a title and content for the chapter.");
        return;
    }

    try {
        const chapterRef = ref(db, `books/${bookId}/chapters/${chapterId}`);
        await set(chapterRef, {
            title: updatedTitle,
            content: updatedContent
        });

        // Inform the user that the chapter has been updated
        alert("Chapter updated successfully!");
    } catch (error) {
        console.error("Error updating chapter details:", error);
        alert("An error occurred while updating chapter details. Please try again.");
    }
});

