// Register Form Handler
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const messageDiv = document.getElementById('message');
    const registerBtn = document.getElementById('registerBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    messageDiv.className = 'message';
    
    // Validate passwords match
    if (password !== password2) {
        messageDiv.innerHTML = '✗ Passwords do not match!';
        messageDiv.className = 'message error';
        return;
    }
    
    // Show loading spinner and disable button
    loadingSpinner.style.display = 'block';
    registerBtn.disabled = true;
    
    try {
        const response = await register(
            username,
            email,
            password,
            password2,
            firstName,
            lastName
        );
        
        if (response.success) {
            // Save token
            setToken(response.data.token);
            
            // Show success message
            messageDiv.innerHTML = '✓ Registration successful! Redirecting...';
            messageDiv.className = 'message success';
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 1000);
        } else {
            // Show error message
            let errorMsg = 'Registration failed';
            if (response.data.password) {
                errorMsg = response.data.password[0];
            } else if (response.data.username) {
                errorMsg = response.data.username[0];
            } else if (response.data.email) {
                errorMsg = response.data.email[0];
            }
            messageDiv.innerHTML = '✗ ' + errorMsg;
            messageDiv.className = 'message error';
            loadingSpinner.style.display = 'none';
            registerBtn.disabled = false;
        }
    } catch (error) {
        messageDiv.innerHTML = '✗ Error: ' + error.message;
        messageDiv.className = 'message error';
        loadingSpinner.style.display = 'none';
        registerBtn.disabled = false;
    }
}

// Autofill email based on username
function setupEmailAutofill() {
    const usernameField = document.getElementById('username');
    const emailField = document.getElementById('email');
    
    if (usernameField && emailField) {
        usernameField.addEventListener('input', function() {
            const username = this.value.trim();
            if (username) {
                emailField.value = username + '@bamazon.com';
            } else {
                emailField.value = '';
            }
        });
    }
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = '/dashboard/';
    }
    
    // Setup email autofill
    setupEmailAutofill();
    
    // Setup form submission
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});
