// Function to fetch borrowing stats from the Flask API and render the chart
async function loadBorrowingStats() {
  try {
      const response = await fetch('/api/borrowing-stats');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // Get months and counts from API response
      const months = data.months;
      const counts = data.counts;

      // Create the chart
      const ctx = document.getElementById('borrowingStatsChart').getContext('2d');
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: months,
              datasets: [{
                  label: 'Books Borrowed',
                  data: counts,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderWidth: 2,
                  fill: true
              }]
          },
          options: {
              responsive: true,
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Month'
                      }
                  },
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'Number of Books Borrowed'
                      }
                  }
              },
              plugins: {
                  legend: {
                      display: true,
                      position: 'top'
                  }
              }
          }
      });
  } catch (error) {
      console.error('Error loading borrowing stats:', error);
  }
}

// Load the chart when the page loads
window.onload = loadBorrowingStats;
