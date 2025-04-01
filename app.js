const BASE_URL = "http://localhost:3000/books";

const bookList = document.getElementById("book-list");
const bookForm = document.getElementById("book-form");

function fetchBooks() {
    fetch(BASE_URL)
        .then(res => res.json())
        .then(books => {
            bookList.innerHTML = "";
            books.forEach(displayBook);
        })
        .catch(err => console.error("Error fetching books:", err));
}

function displayBook(book) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    bookCard.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <span class="status ${book.status}">${book.status}</span>
        <button class="update-btn" onclick="updateStatus(${book.id}, '${book.status}')">Update Status</button>
        <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>

        <!-- Show More Button -->
        <button class="show-more-btn" onclick="toggleDetails(${book.id})">Show More</button>

        <!-- Hidden Details -->
        <div id="details-${book.id}" class="book-details" style="display: none;">
            <div class="last-page-section">
                <label>Last Page Read:</label>
                <input type="number" id="page-${book.id}" value="${book.lastPageRead || 1}" min="1">
                <button onclick="updateLastPage(${book.id})">Save</button>
            </div>

            <div class="review-section">
                <label>Add a Review:</label>
                <textarea id="review-${book.id}" placeholder="Write a review...">${book.review || ""}</textarea>
                <button onclick="saveReview(${book.id})">Submit</button>
            </div>
        </div>
    `;

    bookList.appendChild(bookCard);
}

function updateStatus(id, currentStatus) {
    const statusOrder = ["Unread", "Reading", "Read"];
    const newStatus = statusOrder[(statusOrder.indexOf(currentStatus) + 1) % 3];

    fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    })
    .then(() => fetchBooks())
    .catch(err => console.error("Error updating book status:", err));
}

function deleteBook(id) {
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
        .then(() => fetchBooks())
        .catch(err => console.error("Error deleting book:", err));
}

function updateLastPage(id) {
    const lastPageRead = document.getElementById(`page-${id}`).value;
    fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastPageRead: lastPageRead })
    })
    .then(() => fetchBooks())
    .catch(err => console.error("Error updating last page read:", err));
}

function saveReview(id) {
    const review = document.getElementById(`review-${id}`).value;
    fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: review })
    })
    .then(() => fetchBooks())
    .catch(err => console.error("Error saving review:", err));
}

// Toggle details visibility (Show More / Show Less)
function toggleDetails(bookId) {
    const details = document.getElementById(`details-${bookId}`);
    const showMoreButton = document.querySelector(`.show-more-btn[onclick="toggleDetails(${bookId})"]`);

    if (details.style.display === "none") {
        details.style.display = "block";
        showMoreButton.textContent = "Show Less";
    } else {
        details.style.display = "none";
        showMoreButton.textContent = "Show More";
    }
}

// Add a new book
bookForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newBook = {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        image: document.getElementById("image").value,
        status: document.getElementById("status").value
    };

    fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
    })
    .then(res => res.json())
    .then(book => {
        displayBook(book);
        bookForm.reset();
    })
    .catch(err => console.error("Error adding book:", err));
});

// Initialize
fetchBooks();
