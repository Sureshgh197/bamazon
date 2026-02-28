// Dashboard Page Script

// Load user profile
async function loadUserProfile() {
    const result = await getUserProfile();

    if (result.success) {
        const user = result.data.user;
        displayProfile(user);
    } else {
        // If token is invalid, redirect to login
        if (result.status === 401) {
            removeToken();
            window.location.href = '/login/';
        } else {
            showError('Failed to load profile');
        }
    }
}

// Display user profile
function displayProfile(user) {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>First Name:</strong> ${user.first_name || 'N/A'}</p>
        <p><strong>Last Name:</strong> ${user.last_name || 'N/A'}</p>
    `;

    // Pre-fill edit form
    document.getElementById('editFirstName').value = user.first_name || '';
    document.getElementById('editLastName').value = user.last_name || '';
    document.getElementById('editEmail').value = user.email || '';
}

// Handle logout
async function handleLogout(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Logout button clicked');
    const token = getToken();
    console.log('Token exists:', !!token);
    
    const result = await logout();
    console.log('Logout result:', result);
    
    if (result.success) {
        // Remove token
        removeToken();
        console.log('Token removed, redirecting to login');
        
        // Redirect to login
        window.location.href = '/login/';
    } else {
        console.error('Logout failed:', result);
        alert('Logout failed: ' + (result.data?.error || result.data?.message || 'Unknown error'));
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const updateData = {
        first_name: document.getElementById('editFirstName').value,
        last_name: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value
    };
    
    try {
        const result = await updateProfile(updateData);
        
        if (result.success) {
            showSuccess('successMessage', 'Profile updated successfully!');
            
            // Hide edit form
            document.getElementById('editProfileForm').style.display = 'none';
            
            // Reload profile
            setTimeout(() => {
                loadUserProfile();
            }, 1000);
        } else {
            showError('errorMessage', 'Failed to update profile');
        }
    } catch (error) {
        showError('errorMessage', 'Error: ' + error.message);
    }
}

// Show/hide edit form
function toggleEditForm() {
    const editForm = document.getElementById('editProfileForm');
    editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = '/login/';
        return;
    }

    loadUserProfile();
    
    // Setup event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', toggleEditForm);
    }
    
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', toggleEditForm);
    }
    
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', handleProfileUpdate);
    }
});


// Check if user is admin and show manage link
async function checkAdminStatus() {
    const result = await getUserProfile();
    if (result.success) {
        const user = result.data.user;
        const manageLink = document.getElementById('manageLink');
        if (manageLink && (user.is_staff || user.is_superuser)) {
            manageLink.style.display = 'inline-block';
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();
});
