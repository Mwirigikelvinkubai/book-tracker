// Base URL for JSON Server
const BASE_URL = "http://localhost:3000/books";

// Select elements
const bookList = document.getElementById("book-list");
const bookForm = document.getElementById("book-form");

// Fetch and display books
function fetchBooks() {
    fetch(BASE_URL)
        .then(res => res.json())
        .then(books => {
            bookList.innerHTML = ""; // Clear previous books
            books.forEach(displayBook);
        })
        .catch(err => console.error("Error fetching books:", err));
}

// Display a single book
function displayBook(book) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    bookCard.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Last Page Read: ${book.lastPageRead || "Not specified"}</p>
        <span class="status ${book.status}">${book.status}</span>
        <button class="update-btn" onclick="updateStatus(${book.id}, '${book.status}')">Update Status</button>
        <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
        
        <div class="review-section">
            <h4>Reviews</h4>
            <ul id="review-list-${book.id}">
                ${book.reviews?.map(review => `<li>${review}</li>`).join('') || "No reviews yet."}
            </ul>
            <input type="text" id="review-input-${book.id}" placeholder="Add a review">
            <button onclick="addReview(${book.id})">Submit</button>
        </div>
    `;

    bookList.appendChild(bookCard);
}

// Add a new book
bookForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newBook = {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        image: document.getElementById("image").value,
        status: document.getElementById("status").value,
        lastPageRead: "", // Default empty
        reviews: []
    };

    fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
    })
    .then(res => res.json())
    .then(book => {
        displayBook(book); // Add book to UI
        bookForm.reset();
    })
    .catch(err => console.error("Error adding book:", err));
});

// Update book status
function updateStatus(id, currentStatus) {
    const statusOrder = ["Unread", "Reading", "Read"];
    const newStatus = statusOrder[(statusOrder.indexOf(currentStatus) + 1) % 3];

    fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    })
    .then(() => fetchBooks()) // Refresh book list
    .catch(err => console.error("Error updating book status:", err));
}

// Delete a book
function deleteBook(id) {
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
        .then(() => fetchBooks()) // Refresh book list
        .catch(err => console.error("Error deleting book:", err));
}

// Add a review
function addReview(id) {
    const reviewInput = document.getElementById(`review-input-${id}`);
    const newReview = reviewInput.value.trim();

    if (!newReview) return;

    fetch(`${BASE_URL}/${id}`)
        .then(res => res.json())
        .then(book => {
            const updatedReviews = [...(book.reviews || []), newReview];

            return fetch(`${BASE_URL}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviews: updatedReviews })
            });
        })
        .then(() => fetchBooks()) // Refresh book list
        .catch(err => console.error("Error adding review:", err));
}

// Initialize
fetchBooks();
