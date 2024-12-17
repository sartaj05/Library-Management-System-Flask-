async function returnBook(event) {
  event.preventDefault(); // Prevent default form submission
  const borrowId = document.getElementById("borrowId").value;

  try {
      const response = await fetch('/return', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ borrow_id: borrowId })
      });

      const result = await response.json();
      
      if (response.ok) {
          // Add new row in the table with returned book details
          fetchfeehistory()
          alert(result.message);
      } else {
          alert(result.message);
      }

      // Clear the form fields
      document.getElementById("returnBookForm").reset();
  } catch (error) {
      console.error("Error returning book:", error);
      alert("Error returning book. Please try again.");
  }
}
async function calculateLateFee() {
    const returnDate = document.getElementById("return-date").value;
    
    if (!returnDate) {
        alert("Please select a return date.");
        return;
    }

    // Assuming you have the due date stored in a variable called `dueDate`
    const response = await fetch(`/calculate_late_fee?return_date=${returnDate}&due_date=${dueDate}`);
    const data = await response.json();

    if (data.success) {
        document.getElementById("late-fee-display").textContent = `Late Fee: $${data.late_fee}`;
    } else {
        document.getElementById("late-fee-display").textContent = "Error calculating late fee.";
    }
}
async function fetchfeehistory() {
    try {
        let response = await fetch('/feehistory');
        if (!response.ok) throw new Error('Network response was not ok');
        const fees = await response.json();
        displayfeehistory(fees);
    } catch (error) {
        console.error('Error fetching Fee History:', error);
        alert(error.message);
    }
}

// Function to display members in the table
function displayfeehistory(fees) {
    const tableBody = document.getElementById("returnTableBody");
    tableBody.innerHTML = ""; // Clear existing rows
    console.log(fees)
    if (fees.length==0){
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `<td colspan="4">
        <div class="form-group mt-3">
            <label for="returnDate">Late Fee (if applicable):</label>
            <p id="lateFeeDisplay" class="text-danger">No late fee calculated yet.</p>
        </div>
    </td>`
    }
    fees.forEach(fee => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${fee.borrow_id}</td>
            <td>${fee.date}</td>
            <td>${fee.fees}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeFeeHistry(${fee.borrow_id})">Remove</button>
            </td>
        `;
    });
}

// Function to remove a member
async function removeFeeHistry(borrow_id) {
    if (confirm("Are you sure you want to remove this History?")) {
        try {
            let response = await fetch(`/removehistory/${borrow_id}`, {
                method: 'DELETE',
            });

            // Check if the response was successful
            if (!response.ok) throw new Error('Network response was not ok');
            
            alert('History removed successfully!');
            fetchfeehistory(); // Refresh the members list after removal
        } catch (error) {
            console.error('Error removing History:', error);
            alert(error.message);
        }
    }
}
function searchMembers() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    fetch('/members')
        .then(response => response.json())
        .then(data => {
            const filteredMembers = data.filter(member => 
                member.name.toLowerCase().includes(searchInput) || 
                member.email.toLowerCase().includes(searchInput)
            );
            displayMembers(filteredMembers ); // Display filtered books
        })
        .catch(error => console.error('Error searching members:', error));
}
// Fetch members when the page loads
window.onload = fetchfeehistory;