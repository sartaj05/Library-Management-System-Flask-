async function loadStats() {
  try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const stats = await response.json();

      // Populate each card with data from backend
      document.getElementById("totalBooks").textContent = stats.total_books || 0;
      document.getElementById("totalMembers").textContent = stats.total_members || 0;
      document.getElementById("borrowedBooks").textContent = stats.borrowed_books || 0;
      document.getElementById("returnedBooks").textContent = stats.returned_books || 0;
  } catch (error) {
      console.error("Error loading stats:", error);
      document.getElementById("totalBooks").textContent = "Error";
      document.getElementById("totalMembers").textContent = "Error";
      document.getElementById("borrowedBooks").textContent = "Error";
      document.getElementById("returnedBooks").textContent = "Error";
  }
}

// Load stats when the page is ready
document.addEventListener("DOMContentLoaded", loadStats);
