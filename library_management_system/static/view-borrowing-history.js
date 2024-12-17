async function fetchBorrowingHistory() {
  try {
      const response = await fetch('/api/history');
      if (!response.ok) {
          throw new Error('Failed to fetch borrowing history');
      }

      const historyData = await response.json();
      const tableBody = document.getElementById("borrowingHistoryTableBody");
      tableBody.innerHTML = ''; // Clear existing rows

      historyData.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${record.borrow_id}</td>
              <td>${record.member_id}</td>
              <td>${record.book_id}</td>
              <td>${record.borrow_date}</td>
              <td>${record.return_date || 'Not Returned'}</td>
          `;
          tableBody.appendChild(row);
      });
  } catch (error) {
      console.error("Error loading borrowing history:", error);
  }
}

// Fetch borrowing history on page load
document.addEventListener("DOMContentLoaded", fetchBorrowingHistory);
