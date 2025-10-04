// This script should be included in pages that require authentication

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
  } else {
    // Get current user information if needed
    const user = getCurrentUser();
    
    // You can use user information to personalize the UI
    // For example, display user's name in the header
    const userDisplayElement = document.getElementById('user-display');
    if (userDisplayElement && user) {
      userDisplayElement.textContent = user.name || user.username || user.email;
    }
  }
});

// Add logout functionality to logout buttons
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'logout-button') {
    e.preventDefault();
    logout();
  }
});
