import { db, auth } from "./firebaseConfig.mjs";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// function logout
onAuthStateChanged(auth, async (user) => {
    if (!user) {
  alert("Login first!");
      return (window.location.href = "./loginPagePath.html");
    }
  });

  
// Reference to the "tags" node in the Firebase Realtime Database
const tagsRef = ref(db, 'tags');

// Function to fetch tag names and display them
async function displayTagNames() {
    const tagList = document.getElementById('tagList');

    try {
        // Fetch tag names from the "tags" node
        const snapshot = await get(tagsRef);
        const tags = snapshot.val();

        if (tags) {
            // Create a list to hold the tag names
            const list = document.createElement('ul');
            list.style.columns = '5'; // Display in 2 columns

            // Iterate over each tag
            Object.keys(tags).forEach((tag) => {
                // Create list item for each tag
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `displaytagbook.html?tag=${tag}`; // Link to displaytagbook.html with tag parameter
                link.textContent = tag;
                listItem.appendChild(link);
                list.appendChild(listItem);
            });

            // Append the list to the tagList div
            tagList.appendChild(list);
        } else {
            tagList.innerHTML = '<p>No tags found.</p>';
        }
    } catch (error) {
        console.error("Error fetching tag names:", error);
        tagList.innerHTML = '<p>Error fetching tag names. Please try again.</p>';
    }
}

// Call the displayTagNames function when the page loads
window.addEventListener('load', displayTagNames);
