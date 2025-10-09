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

    // DOM Elements
    const departmentsContainer = document.getElementById('departments-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Modal elements
    const createDepartmentBtn = document.getElementById('create-department-btn');
    const createModal = document.getElementById('create-department-modal');
    const successModal = document.getElementById('success-modal');
    const closeCreateModal = document.getElementById('close-create-modal');
    const closeSuccessModal = document.getElementById('close-success-modal');
    const cancelCreate = document.getElementById('cancel-create');
    const createForm = document.getElementById('create-department-form');

    // State
    let allDepartments = [];
    let filteredDepartments = [];
    let currentFilter = 'all';

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Setup performance filters
    setupPerformanceFilters();

    // Load department data
    loadDepartmentData();

    // Create New Department button
    const createDeptBtn = document.querySelector('.btn-create-department');
    if (createDeptBtn) {
        createDeptBtn.addEventListener('click', () => {
            showCreateDepartmentModal();
        });
    }

    function setupPerformanceFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Update performance data based on selected period
                const period = this.dataset.period;
                updatePerformanceData(period);

                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    function updatePerformanceData(period) {
        // Simulate loading
        const performanceStats = document.querySelectorAll('.perf-stat-card');

        performanceStats.forEach(card => {
            card.classList.add('loading-shimmer');
        });

        setTimeout(() => {
            // Sample data based on period
            const data = getPeriodData(period);

            performanceStats.forEach((card, index) => {
                card.classList.remove('loading-shimmer');
                const valueElement = card.querySelector('.perf-stat-value');
                animateValue(valueElement, data.values[index]);
            });
        }, 800);
    }

    function getPeriodData(period) {
        const dataMap = {
            week: {
                values: ['94%', '127', '8.5']
            },
            month: {
                values: ['91%', '485', '7.2']
            },
            quarter: {
                values: ['89%', '1,342', '9.1']
            }
        };

        return dataMap[period] || dataMap.week;
    }

    function animateValue(element, targetValue) {
        const startValue = element.textContent;
        const isPercentage = targetValue.includes('%');
        const isDecimal = targetValue.includes('.');

        let start = 0;
        let end = parseInt(targetValue.replace(/[%,]/g, ''));

        if (isDecimal) {
            end = parseFloat(targetValue.replace(/[%,]/g, ''));
        }

        const duration = 1000;
        const startTime = performance.now();

        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = start + (end - start) * easeOutQuad(progress);

            let displayValue = isDecimal ? currentValue.toFixed(1) : Math.floor(currentValue);

            if (targetValue.includes(',')) {
                displayValue = displayValue.toLocaleString();
            }

            if (isPercentage) {
                displayValue += '%';
            }

            element.textContent = displayValue;

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function loadDepartmentData() {
        // Add loading animations to cards
        const overviewCards = document.querySelectorAll('.overview-card');

        overviewCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Show modal for creating new department
    async function showCreateDepartmentModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="department-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-building"></i> Create New Department</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="create-department-form">
                            <div class="form-group">
                                <label for="department-name">Department Name</label>
                                <input type="text" id="department-name" placeholder="Enter department name" required>
                            </div>
                            <div class="form-group">
                                <label for="department-description">Description</label>
                                <textarea id="department-description" placeholder="Enter department description (optional)"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-submit">Create Department</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Get modal elements
        const modal = document.getElementById('department-modal');
        const closeBtn = modal.querySelector('.close-modal');
        const form = document.getElementById('create-department-form');

        // Add event listeners
        closeBtn.addEventListener('click', () => closeModal(modal));

        // Close modal if clicked outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('department-name');
            const departmentName = nameInput.value.trim();
            const description = document.getElementById('department-description').value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');

            if (!departmentName) {
                showToast("Department name is required.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            try {
                const userResponse = await window.authAPI.getCurrentUser();
                if (!userResponse.success) {
                    throw new Error("Could not identify the current user.");
                }
                const userId = userResponse.data.userId;

                const createResponse = await window.adminAPI.createDepartment({
                    name: departmentName,
                    description: description,
                    userId: userId
                });

                if (createResponse.success) {
                    showToast(`Department "${departmentName}" created successfully!`);
                    closeModal(modal);
                    await loadAndDisplayDepartments();
                } else {
                    throw new Error(createResponse.message || "Failed to create department.");
                }
            } catch (error) {
                console.error("Error creating department:", error);
                showToast(error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Department';
            }
        });

        // Add toast close functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toast-close')) {
                const toast = e.target.parentElement;
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 300);
            }
        });

        // Animation for modal entry
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);
    }

    function closeModal(modal) {
        modal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        modal.querySelector('.modal-content').style.opacity = '0';

        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    loadAndDisplayDepartments();

    // Logout functionality
    function logout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            sessionStorage.clear();

            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            console.log('User logged out successfully - all data cleared');
            window.location.href = '../../../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            sessionStorage.clear();
            console.log('Forced logout due to error - all data cleared');
            window.location.href = '../../../index.html';
        }
    }

    // Initialize logout functionality
    const logoutLinks = document.querySelectorAll('.logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    });

    // Token expiration check
    function checkTokenExpiration() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login');
            window.location.href = '../../../index.html';
            return;
        }

        try {
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
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../../../index.html';
        }
    }

    // Check token expiration immediately and set interval
    checkTokenExpiration();
    setInterval(checkTokenExpiration, 60 * 60 * 1000);
});

function createDepartmentCard(department) {
    const card = document.createElement('div');
    const className = department.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    card.className = `overview-card ${className}`;

    card.innerHTML = `
        <div class="overview-header">
            <div class="overview-icon" style="color: blue;">
                <i class="fa fa-building"></i>
            </div>
            <span class="dept-status active">Active</span>
        </div>
        <h3 class="overview-title">${capitalizeWords(department.name)}</h3>
        <p class="overview-desc">${department.description || 'Manages department-related tasks.'}</p>
    `;
    return card;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function loadAndDisplayDepartments() {
    const container = document.querySelector('.departments-overview');
    if (!container) return;

    container.querySelectorAll('.dynamic-dept').forEach(el => el.remove());

    try {
        const response = await window.adminAPI.getAllDepartments();
        if (response.success && Array.isArray(response.data)) {
            response.data.reverse().forEach(dept => {
                const cardElement = createDepartmentCard(dept);
                cardElement.classList.add('dynamic-dept');
                container.prepend(cardElement);
            });
        }
    } catch (error) {
        console.error("Failed to load departments:", error);
        showToast("Could not load departments.", "error");
    }
}

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