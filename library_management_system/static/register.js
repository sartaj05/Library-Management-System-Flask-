// Function to add a new member
async function addMember(event) {
    event.preventDefault(); // Prevent default form submission

    const memberName = document.getElementById("memberName").value;
    const memberEmail = document.getElementById("memberEmail").value;
    const errorMessage = document.getElementById('error-message');

    // Clear previous error message
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Check if form fields are empty
    if (!memberName || !memberEmail) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Please fill in both name and email.';
        return;
    }

    const formData = new FormData();
    formData.append('memberName', memberName);
    formData.append('memberEmail', memberEmail);

    try {
        // Send the form data via POST request
        let response = await fetch('/addmember', {
            method: 'POST',
            body: formData
        });

        // Parse the response as JSON
        const result = await response.json();

        // Check if the response is not OK
        if (!response.ok) {
            throw new Error(result.error || 'An unknown error occurred');
        }

        // Success: Show success message and refresh the member list
        alert(result.message || 'Member added successfully!');
        fetchMembers(); // Refresh the members list after adding
        document.getElementById("registerMemberForm").reset(); // Clear the form fields
    } catch (error) {
        console.error('Error adding member:', error);

        // Display error on the frontend
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message || 'Failed to add member';
    }
}

// Function to fetch and display all members
async function fetchMembers() {
    try {
        let response = await fetch('/members');
        if (!response.ok) throw new Error('Network response was not ok');
        const members = await response.json();
        displayMembers(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        alert('Error fetching members: ' + error.message);
    }
}

// Function to display members in the table
function displayMembers(members) {
    const tableBody = document.getElementById("memberTableBody");
    tableBody.innerHTML = ""; // Clear existing rows

    members.forEach(member => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${member.member_id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeMember(${member.member_id})">Remove</button>
            </td>
        `;
    });
}

// Function to remove a member
async function removeMember(memberId) {
    if (confirm("Are you sure you want to remove this member?")) {
        try {
            let response = await fetch(`/removemember/${memberId}`, {
                method: 'DELETE',
            });

            // Check if the response was successful
            if (!response.ok) throw new Error('Network response was not ok');
            
            alert('Member removed successfully!');
            fetchMembers(); // Refresh the members list after removal
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Error removing member: ' + error.message);
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
window.onload = fetchMembers;
