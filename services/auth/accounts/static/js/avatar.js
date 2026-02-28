// Avatar dropdown functionality
function initializeAvatar() {
    const token = getToken();
    if (!token) return;

    getUserProfile().then(result => {
        if (result.success) {
            const username = result.data.user.username;
            const avatarContainer = document.getElementById('user-avatar');
            const avatarCircle = document.getElementById('avatar-circle');
            const usernameDisplay = document.getElementById('username-display');
            
            if (avatarContainer && avatarCircle && usernameDisplay) {
                avatarCircle.textContent = username.charAt(0).toUpperCase();
                usernameDisplay.textContent = username;
                avatarContainer.style.display = 'inline-block';
            }
        }
    });
}

// Toggle dropdown
document.addEventListener('click', (e) => {
    const avatarCircle = document.getElementById('avatar-circle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (avatarCircle && dropdownMenu) {
        if (e.target === avatarCircle || avatarCircle.contains(e.target)) {
            dropdownMenu.classList.toggle('show');
        } else {
            dropdownMenu.classList.remove('show');
        }
    }
});

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            removeToken();
            window.location.href = '/';
        });
    }
});
