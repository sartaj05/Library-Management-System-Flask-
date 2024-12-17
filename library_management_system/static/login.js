async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Create a JSON payload
  const payload = { email, password };

  try {
    // Send the form data as JSON via POST request
    let response = await fetch('/loginuser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    // Parse the response as JSON
    const result = await response.json();

    // Check if the response is not OK
    if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred');
    }

    // Success: Show success message and redirect if needed
    alert(result.message || 'Login successfully!');
    document.getElementById("loginForm").reset(); // Clear the form fields
    // Redirect to the main page or dashboard after successful login
    window.location.href = "/index";
  } catch (error) {
    console.error(error);
    alert(error.message || 'Failed to log in');
  }
}
