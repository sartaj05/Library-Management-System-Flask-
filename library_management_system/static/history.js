async function loadBorrowingHistory() {
  try {
      const response = await fetch('/borrowing-history');
      const data = await response.json();

      const tableBody = document.getElementById("borrowingHistoryTableBody");
      tableBody.innerHTML = ''; // Clear current table rows

      data.forEach(borrow => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${borrow.borrow_id}</td>
              <td>${borrow.member_id}</td>
              <td>${borrow.book_id}</td>
              <td>${borrow.borrow_date}</td>
              <td>${borrow.return_date || 'Not Returned'}</td>
          `;
          tableBody.appendChild(row);
      });
  } catch (error) {
      console.error("Error loading borrowing history:", error);
  }
}

// Load borrowing history when the page loads
window.onload = loadBorrowingHistory;
