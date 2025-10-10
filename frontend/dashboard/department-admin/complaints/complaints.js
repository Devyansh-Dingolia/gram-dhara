// File: complaints.js

document.addEventListener('DOMContentLoaded', function () {
    // Update current date display
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        currentDateEl.textContent = new Date().toLocaleDateString('en-IN', options);
    }

    // --- DOM ELEMENT SELECTION ---
    const complaintsContainer = document.getElementById('complaints-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.search-input');
    const logoutLink = document.querySelector('.sidebar-nav a.logout');

    // Stat card elements
    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statInProgress = document.getElementById('stat-in_progress');
    const statResolved = document.getElementById('stat-resolved');

    let allComplaints = []; // Cache for all fetched complaints

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- INITIALIZATION ---
    async function initializeAdminPage() {
        try {
            const userResponse = await window.authAPI.getCurrentUser();
            if (!userResponse.success || !['admin', 'super_admin', 'department_admin'].includes(userResponse.data.role)) {
                // If user is not an admin, redirect them away
                window.location.href = '/login.html';
                return;
            }
            await loadAllComplaints();
        } catch (error) {
            console.error("Initialization failed:", error);
            // api-client handles redirection for auth errors
        }
    }

    // --- DATA FETCHING ---
    async function loadAllComplaints() {
        try {
            showLoading(true);
            showError('');
            const response = await window.reportsAPI.getAllReports();
            if (response.success && response.data) {
                allComplaints = response.data;
                renderComplaints(allComplaints);
                updateStats(allComplaints);
            }
        } catch (error) {
            console.error("Failed to load complaints:", error);
            showError(error.message || "Could not fetch complaints.");
        } finally {
            showLoading(false);
        }
    }

    // --- UI RENDERING ---
    function renderComplaints(complaints) {
        complaintsContainer.innerHTML = '';
        if (complaints.length === 0) {
            complaintsContainer.innerHTML = `<p>No complaints found matching the criteria.</p>`;
            return;
        }
        complaints.forEach(complaint => {
            const tile = createComplaintTile(complaint);
            complaintsContainer.appendChild(tile);
        });
    }

    function createComplaintTile(complaint) {
        const tile = document.createElement('div');
        tile.className = 'complaint-tile';
        const createdDate = new Date(complaint.createdAt).toLocaleDateString('en-IN');

        // Water-specific category mapping
        const categoryDisplay = complaint.categoryId?.name || 'Water Issue';
        const priorityIcon = getPriorityIcon(complaint.priority);

        tile.innerHTML = `
            <div class="complaint-tile-header">
                <h4>${complaint.reportId}</h4>
                <span class="status-badge status-${complaint.status.replace('_', '-')}">${capitalizeFirstLetter(complaint.status.replace('_', ' '))}</span>
            </div>
            <div class="complaint-tile-body">
                <p><strong>Issue</strong> ${complaint.title}</p>
                <p><strong>Category:</strong> <i class="fas fa-droplet"></i> ${capitalizeFirstLetter(categoryDisplay)}</p>
                <p><strong>Reported By:</strong> <i class="fas fa-user"></i> ${complaint.userId?.name || 'Anonymous'}</p>
                <p><strong>Location:</strong> <i class="fas fa-map-marker-alt"></i> ${formatLocation(complaint.location_lat, complaint.location_lng)}</p>
                <p><strong>Priority:</strong> ${priorityIcon} ${capitalizeFirstLetter(complaint.priority || 'Medium')}</p>
                <p><strong>Date:</strong> <i class="fas fa-calendar"></i> ${createdDate}</p>
            </div>
            <div class="complaint-tile-footer">
                <button onclick="openDetailsModal('${complaint.reportId}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="openUpdateModal('${complaint.reportId}')">
                    <i class="fas fa-edit"></i> Update Status
                </button>
            </div>
        `;
        return tile;
    }

    function getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return '<i class="fas fa-exclamation-triangle" style="color: var(--danger-color);"></i>';
            case 'medium': return '<i class="fas fa-minus-circle" style="color: var(--warning-color);"></i>';
            case 'low': return '<i class="fas fa-info-circle" style="color: var(--success-color);"></i>';
            default: return '<i class="fas fa-minus-circle" style="color: var(--gray-color);"></i>';
        }
    }

    function formatLocation(lat, lng) {
        if (!lat || !lng) return 'Location not available';
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }

    function updateStats(complaints) {
        statTotal.textContent = complaints.length;
        statPending.textContent = complaints.filter(c => c.status === 'pending').length;
        statInProgress.textContent = complaints.filter(c => c.status === 'in_progress').length;
        statResolved.textContent = complaints.filter(c => c.status === 'resolved').length;
    }

    function logout() {
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

            // Redirect to index page
            window.location.href = '../../../index.html';

        } catch (error) {
            console.error('Logout error:', error);

            // Even if there's an error, clear local data and redirect
            localStorage.clear();
            sessionStorage.clear();
            console.log('Forced logout due to error - all data cleared');
            window.location.href = '../../../index.html';
        }
    }

    // --- EVENT LISTENERS ---

    // Set up logout button
    if (logoutLink) {
        logoutLink.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                await window.authAPI.logout();
                window.location.href = '../../../index.html';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }

    // Logout button - Fixed and improved
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
            window.location.href = '../../../index.html';
            return;
        }

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < currentTime) {
                console.log('Token expired, auto-logging out');
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../../../index.html';
            }
        } catch (error) {
            console.error('Error checking token expiration:', error);
            // If token is malformed, clear it and redirect
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../../../index.html';
        }
    }

    // Initialize logout functionality
    initializeLogoutButtons();

    // Check token expiration immediately
    checkTokenExpiration();

    // Check token expiration every 5 minutes
    setInterval(checkTokenExpiration, 60 * 60 * 1000);

    function capitalizeWords(text) {
        // Return an empty string if the input is invalid
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.split(' ') // 1. Split the string into an array of words
            .map(word => {      // 2. Create a new array with modified words
                if (word.length === 0) return '';
                // 3. Capitalize the first letter and add the rest of the word
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');     // 4. Join the words back into a string
    }

    // --- MODAL / OVERLAY LOGIC ---

    // Function to close any open modal
    window.closeModal = function () {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // VIEW DETAILS MODAL
    window.openDetailsModal = function (reportId) {
        const complaint = allComplaints.find(c => c.reportId === reportId);
        if (!complaint) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Water Report Details <br>${complaint.reportId}</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong><i class="fas fa-align-left"></i> Description:</strong> ${complaint.description}</p>
                    <hr>
                    <p><strong><i class="fas fa-flag"></i> Status:</strong> ${capitalizeFirstLetter(complaint.status.replace('_', ' '))}</p>
                    <p><strong><i class="fas fa-exclamation"></i> Priority:</strong> ${capitalizeFirstLetter(complaint.priority || 'Medium')}</p>
                    <hr>
                    <p><strong><i class="fas fa-user"></i> Reported By:</strong> ${complaint.userId?.name || 'N/A'}</p>
                    <p><strong><i class="fas fa-tags"></i> Category:</strong> ${capitalizeFirstLetter(complaint.categoryId?.name) || 'Water Issue'}</p>
                    <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${formatLocation(complaint.location_lat, complaint.location_lng)}</p>
                    <p><strong><i class="fas fa-calendar"></i> Reported Date:</strong> ${new Date(complaint.createdAt).toLocaleString('en-IN')}</p>
                    ${complaint.photo_url ? `
                        <p><strong><i class="fas fa-image"></i> Photo Evidence:</strong></p>
                        <img src="${complaint.photo_url}" alt="Issue Photo" style="max-width: 100%; height: auto; border-radius: 6px; margin-top: 10px;">
                    ` : ''}
                    ${complaint.voice_recording_url ? `
                        <p><strong><i class="fas fa-microphone"></i> Voice Description:</strong></p>
                        <audio controls style="width: 100%; margin-top: 10px;">
                            <source src="${complaint.voice_recording_url}" type="audio/webm">
                            Your browser does not support the audio element.
                        </audio>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    };

    // UPDATE STATUS MODAL
    window.openUpdateModal = function (reportId) {
        const complaint = allComplaints.find(c => c.reportId === reportId);
        if (!complaint) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Water Report <br> ${complaint.reportId}</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="background-color: var(--water-light); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <strong><i class="fas fa-info-circle"></i> Current Issue</strong> ${complaint.title}
                    </p>
                    <form id="update-status-form">
                        <div class="form-group">
                            <label for="newStatus"><i class="fas fa-flag"></i> Update Status:</label>
                            <select id="newStatus" name="newStatus" required>
                                <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${complaint.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                <option value="rejected" ${complaint.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="remarks"><i class="fas fa-comment"></i> Admin Comments:</label>
                            <textarea id="remarks" name="remarks" rows="4" placeholder="Add notes about the resolution or next steps..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Update Water Report
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Add event listener to the new form
        document.getElementById('update-status-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = e.target.newStatus.value;
            const remarks = e.target.remarks.value;

            try {
                await window.reportsAPI.updateReportStatus(reportId, { newStatus, remarks });
                closeModal();
                loadAllComplaints(); // Refresh the list
            } catch (error) {
                alert(`Error updating status: ${error.message} `);
            }
        });
    };

    // --- EVENT LISTENERS ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            const filtered = (filter === 'all') ? allComplaints : allComplaints.filter(c => c.status === filter);
            renderComplaints(filtered);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allComplaints.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.reportId.toLowerCase().includes(searchTerm) ||
            c.userId?.name.toLowerCase().includes(searchTerm) ||
            c.userId?.email.toLowerCase().includes(searchTerm)
        );
        renderComplaints(filtered);
    });

    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await window.authAPI.logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.log('Logout failed');
        }
    });

    // --- UTILITY FUNCTIONS ---
    function showLoading(isLoading) { loadingSpinner.style.display = isLoading ? 'block' : 'none'; }
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = message ? 'block' : 'none';
    }

    // --- INITIALIZE ---
    initializeAdminPage();
});
