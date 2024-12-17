let books = [];
let currentPage = 1;
const itemsPerPage = 10;

// Function to add a new book with validation
async function addBook(event) {
    event.preventDefault(); // Prevent default form submission
    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;
    const availableCopies = document.getElementById("availableCopies").value;

    // Validate form inputs
    if (title.trim() === "" || author.trim() === "" || availableCopies.trim() === "") {
        alert("All fields are required.");
        return;
    }

    if (isNaN(availableCopies) || availableCopies <= 0) {
        alert("Available copies must be a positive number.");
        return;
    }

  
    try {
        let response = await fetch('/addbook', {
            method: 'POST',
            body: new FormData(document.getElementById('addBookForm'))
        });
        if (!response.ok) {
            const result = await response.json(); // Parse the JSON error message from the response
            throw new Error(result.error || 'An unknown error occurred');
        }
        const result = await response.json();
        alert('Book added successfully!');
        fetchBooks(); // Refresh the book list after adding
    } catch (error) {
        console.error('Error adding book:', error);
        alert(error.message);
    }
}


// Fetch and display books
function fetchBooks() {
    fetch('/books')
        .then(response => response.json())
        .then(data => {
            books = data; // Store books for search filtering
            displayBooks(data); // Display all books when fetched
        })
        .catch(error => console.error('Error fetching books:', error));
}

// Call the fetchBooks function when the page loads
window.onload = fetchBooks;

// Function to remove a book
async function removeBook(id) {
    if (confirm("Are you sure you want to remove this book?")) {
        try {
            let response = await fetch(`/removebook/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            alert('Book removed successfully!');
            fetchBooks(); // Refresh the book list after removal
        } catch (error) {
            console.error('Error removing book:', error);
            alert('Error removing book: ' + error.message);
        }
    }
}

// Function to search books by title or author
function searchBooks() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    fetch('/books')
        .then(response => response.json())
        .then(data => {
            const filteredBooks = data.filter(book => 
                book.title.toLowerCase().includes(searchInput) || 
                book.author.toLowerCase().includes(searchInput)
            );
            displayBooks(filteredBooks); // Display filtered books
        })
        .catch(error => console.error('Error searching books:', error));
}

// Function to display books in the table
function displayBooks(books) {
    const tableBody = document.getElementById("booksTableBody");
    tableBody.innerHTML = ""; // Clear existing rows

    books.forEach(book => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.availableCopies}</td>
            <td><button class="btn btn-danger" onclick="removeBook(${book.id})">Remove</button></td>
        `;
    });
}
