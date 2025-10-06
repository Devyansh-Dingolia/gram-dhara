// --- NEW: User Profile Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    // Select elements to populate
    const nameHeader = document.getElementById('profile-name-header');
    const roleBadge = document.getElementById('profile-role');
    const nameInput = document.getElementById('profile-name');
    const usernameInput = document.getElementById('profile-username');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const userIdInput = document.getElementById('profile-userid');

    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    function capitalize(roleString) {
        if (typeof roleString !== 'string' || roleString.length === 0) {
            return '';
        }
        return roleString.charAt(0).toUpperCase() + roleString.slice(1);
    }

    // Function to fetch and display the user profile
    async function loadUserProfile() {
        try {
            // 1. Use the pre-built getCurrentUser method from the authAPI
            const result = await authAPI.getCurrentUser();

            if (!result.success) {
                // Handle auth errors (e.g., expired token)
                if (result.statusCode === 401) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('token'); // Clear bad token
                    window.location.href = '../../../index.html'; // Adjust this path if needed
                    return;
                }
                throw new Error(result.message || 'Failed to get user data.');
            }

            // 2. Populate the HTML with the fetched data
            const user = result.data;
            nameHeader.textContent = user.name;
            roleBadge.textContent = capitalize(user.role);
            nameInput.value = user.name;
            usernameInput.value = capitalize(user.username || 'N/A');
            emailInput.value = user.email;
            phoneInput.value = user.phoneNumber || 'N/A';
            userIdInput.value = user.userId;

        } catch (error) {
            console.error("Error loading user profile:", error);
            // Display an error message on the page
            document.querySelector('.user-profile-card').innerHTML =
                `<p style="color: red; text-align: center;">Could not load profile data. Please try again later.</p>`;
        }
    }

    // Call the function to load the profile when the page loads
    loadUserProfile();
});

// Logout function
const logoutButton = document.querySelector('.logout');
function initializeLogoutButtons() {
    // Find all possible logout elements
    const logoutButtons = document.querySelectorAll('.logout, .logout-btn, [data-action="logout"]');
    const logoutLinks = document.querySelectorAll('a[href*="logout"], a.logout');

    // Attach logout to all logout buttons
    logoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    });

    // Attach logout to all logout links
    logoutLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    });

    // Add keyboard shortcut for logout (Ctrl+Alt+L)
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.altKey && e.key === 'l') {
            e.preventDefault();
            logout();
        }
    });

    console.log(`Logout functionality attached to ${logoutButtons.length + logoutLinks.length} elements`);
}


// Auto-logout on token expiration
function checkTokenExpiration() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '../../../login/login.html';
        return;
    }

    try {
        // Decode JWT token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
            console.log('Token expired, auto-logging out');
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../../../login/login.html';
        }
    } catch (error) {
        console.error('Error checking token expiration:', error);
        // If token is malformed, clear it and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../../../login/login.html';
    }
}

// Initialize logout functionality
initializeLogoutButtons();

// Check token expiration immediately
checkTokenExpiration();

// Check token expiration every hour
setInterval(checkTokenExpiration, 60 * 60 * 1000);

console.log('Token expiration check initialized');

// Logout button
if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            // Clear all authentication data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');

            // Clear all session storage
            sessionStorage.clear();

            // Clear any cached data
            allComplaints = [];

            // Clear any cookies (if using httpOnly cookies)
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            console.log('User logged out successfully - all data cleared');

            // Redirect to login page
            window.location.href = '../../../index.html';

        } catch (error) {
            console.error('Logout error:', error);

            // Even if there's an error, clear local data and redirect
            localStorage.clear();
            sessionStorage.clear();
            console.log('Forced logout due to error - all data cleared');
            alert('Logged out successfully');
            window.location.href = '../../../login/login.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Notification button
    const notificationButton = document.getElementById('notification-link');

    if (notificationButton) {
        notificationButton.addEventListener('click', () => {
            window.location.href = '../notifications/notifications.html';
        });
    }

    // Function to capitalize the first letter of the role
    function capitalize(roleString) {
        if (typeof roleString !== 'string' || roleString.length === 0) {
            return '';
        }
        return roleString.charAt(0).toUpperCase() + roleString.slice(1);
    }

    async function updateProfileHeader() {
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');

        // Initial check for element existence
        if (!userNameElement || !userRoleElement) {
            console.error('User profile elements not found in the DOM.');
            return;
        }

        try {
            // Call the getCurrentUser API method
            const response = await window.authAPI.getCurrentUser();

            // Check if the API call was successful
            if (response.success && response.data) {
                const userData = response.data;

                // Update the text content of the HTML elements
                userNameElement.textContent = userData.name || userData.username || 'User';
                userRoleElement.textContent = capitalize(userData.role) || 'Unknown Role';

            } else {
                // Handle unsuccessful response
                console.error('Failed to fetch user data:', response.message);
                userNameElement.textContent = 'Guest';
                userRoleElement.textContent = '';
            }
        } catch (error) {
            // Handle network or other errors
            console.error('Error fetching user profile:', error);
            userNameElement.textContent = 'Guest';
            userRoleElement.textContent = '';
        }
    }

    // Call the function on page load
    updateProfileHeader();

    // Add the missing logout function
    function logout() {
        try {
            // Clear all authentication data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');

            // Clear all session storage
            sessionStorage.clear();

            // Clear any cookies (if using httpOnly cookies)
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            console.log('User logged out successfully - all data cleared');

            // Redirect to login page
            window.location.href = '../../../../index.html';
        } catch (error) {
            console.error('Logout error:', error);

            // Even if there's an error, clear local data and redirect
            localStorage.clear();
            sessionStorage.clear();
            console.log('Forced logout due to error - all data cleared');
            alert('Logged out successfully');
            window.location.href = '../../../login/login.html';
        }
    }
});