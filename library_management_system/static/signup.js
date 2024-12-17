async function handleSignup(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Get the message display div
    const messageDiv = document.getElementById("signupMessage");

    // Clear any previous message
    messageDiv.innerHTML = '';

    // Basic validation: Check if all fields are filled
    if (!name || !email || !password) {
        messageDiv.innerHTML = `<div class="alert alert-danger">All fields are required.</div>`;
        return; // Stop further execution
    }

    // Email format validation: Simple regex to check if the email follows a standard format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Please enter a valid email address.</div>`;
        return;
    }

    // Password validation: Must be at least 6 characters, and contain one lowercase letter, one uppercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        messageDiv.innerHTML = `<div class="alert alert-danger">Password must be at least 6 characters long, and contain at least one lowercase letter, one uppercase letter, one number, and one special character.</div>`;
        return;
    }

    // Prepare data to send to the server in JSON format
    const data = {
        username: name,
        email: email,
        password: password
    };
    console.log(data);

    try {
        // Sending a POST request with the user data
        const response = await fetch('/registeruser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set content type to JSON
            },
            body: JSON.stringify(data) // Convert data object to JSON
        });

        // Parse the response as JSON
        const result = await response.json();

        // Display feedback message based on server response
        if (response.ok) {
            messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = "/"; // Redirect to the login page
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        // Handle any errors that occur during the fetch request
        console.error("Error during sign up:", error);
        messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again later.</div>`;
    }
}
