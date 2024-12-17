async function borrowBook(event) {
  event.preventDefault(); // Prevent default form submission
  const memberId = document.getElementById("memberId").value;
  const bookId = document.getElementById("bookId").value;

  try {
      const response = await fetch('/borrow', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ member_id: memberId, book_id: bookId })
      });

      if (response.ok) {
          alert('Book borrowed successfully');
          loadBorrowHistory(); // Refresh the borrow history table
          document.getElementById("borrowBookForm").reset(); // Clear the form
      } else {
          alert("Member Id or Book Id not found!");
      }
  } catch (error) {
      console.error("Error:", error);
  }
}

async function loadBorrowHistory() {
  try {
      const response = await fetch('/borrow-history');
      const data = await response.json();

      const tableBody = document.getElementById("borrowTableBody");
      tableBody.innerHTML = ''; // Clear current table rows

      data.forEach(borrow => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${borrow.borrow_id}</td>
              <td>${borrow.member_id}</td>
              <td>${borrow.book_id}</td>
              <td>${borrow.borrow_date}</td>
          `;
          tableBody.appendChild(row);
      });
  } catch (error) {
      console.error("Error loading borrow history:", error);
  }
}

// Load borrow history when the page loads
window.onload = loadBorrowHistory;
