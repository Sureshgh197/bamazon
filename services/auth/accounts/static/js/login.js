// Login Form Handler
async function handleLogin(event) {
    event.preventDefault();
    
    const startTime = performance.now();
    console.log('Login started at:', new Date().toISOString());
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    messageDiv.className = 'message';
    
    // Show loading spinner and disable button
    loadingSpinner.style.display = 'block';
    loginBtn.disabled = true;
    
    try {
        const apiStartTime = performance.now();
        const response = await login(username, password);
        const apiEndTime = performance.now();
        console.log(`API call took: ${(apiEndTime - apiStartTime).toFixed(2)}ms`);
        
        if (response.success) {
            // Save token
            console.log('Login response:', response);
            console.log('Token to save:', response.data.token);
            setToken(response.data.token);
            console.log('Token saved. Retrieved token:', getToken());
            
            // Show success message
            messageDiv.innerHTML = '✓ Login successful! Redirecting...';
            messageDiv.className = 'message success';
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                const endTime = performance.now();
                console.log(`Total login time: ${(endTime - startTime).toFixed(2)}ms`);
                window.location.href = '/dashboard/';
            }, 1000);
        } else {
            // Show error message
            const errorMsg = response.data.password ? response.data.password[0] : 'Login failed';
            messageDiv.innerHTML = '✗ ' + errorMsg;
            messageDiv.className = 'message error';
            loadingSpinner.style.display = 'none';
            loginBtn.disabled = false;
        }
    } catch (error) {
        messageDiv.innerHTML = '✗ Error: ' + error.message;
        messageDiv.className = 'message error';
        loadingSpinner.style.display = 'none';
        loginBtn.disabled = false;
    }
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = '/dashboard/';
    }
    
    // Setup form submission
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
});
