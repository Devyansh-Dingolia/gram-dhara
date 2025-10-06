document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Notification button
    const notificationButton = document.getElementById('notification-link');

    if (notificationButton) {
        notificationButton.addEventListener('click', () => {
            window.location.href = '../notifications/notifications.html';
        });
    }

    // Initialize charts
    initializeCharts();

    async function updateHeaderUI(user) {
        try {
            // Check if authAPI is available
            if (!window.authAPI) {
                console.error("Authentication API is not available.");
                return;
            }

            const response = await window.authAPI.getCurrentUser();
            if (response && response.success && response.data) {
                const user = response.data;
                if (userNameEl) {
                    userNameEl.textContent = user.name || 'User';
                }
                if (userRoleEl) {
                    // Capitalize the first letter of the role
                    const role = user.role || 'User';
                    userRoleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
                }
            } else {
                console.error("Failed to fetch user data:", response.message);
                // Fallback to default values if API call fails
                if (userNameEl) userNameEl.textContent = 'User';
                if (userRoleEl) userRoleEl.textContent = 'Village Member';
            }
        } catch (error) {
            console.error("Error fetching user information:", error);
        }
    }

    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');
    updateHeaderUI(JSON.parse(localStorage.getItem('user')) || {});

    // Trend filter buttons
    const trendFilters = document.querySelectorAll('.trend-filter');
    if (trendFilters) {
        trendFilters.forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all filters
                trendFilters.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Update chart based on selected period
                updateTrendChart(this.dataset.period);
            });
        });
    }

    // Record New Test button
    const recordTestBtn = document.querySelector('.btn-record-test');
    if (recordTestBtn) {
        recordTestBtn.addEventListener('click', function () {
            showRecordTestModal();
        });
    }

    // Function to create and initialize charts
    function initializeCharts() {
        // Adjust charts for side-by-side layout with responsive sizing
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        };

        // pH Chart
        createLineChart('pHChart',
            ['Aug', 'Sep', 'Oct'],
            [7.1, 7.3, 7.2],
            'pH Level',
            'rgba(25, 118, 210, 0.2)',
            'rgba(25, 118, 210, 1)',
            [6.5, 8.5],
            [7.0, 7.5],
            chartOptions
        );

        // Turbidity Chart
        createLineChart('turbidityChart',
            ['Aug', 'Sep', 'Oct'],
            [4.2, 4.8, 5.8],
            'Turbidity (NTU)',
            'rgba(255, 160, 0, 0.2)',
            'rgba(255, 160, 0, 1)',
            [0, 10],
            [0, 5],
            chartOptions
        );

        // Chlorine Chart
        createLineChart('chlorineChart',
            ['Aug', 'Sep', 'Oct'],
            [0.7, 0.9, 0.8],
            'Residual Chlorine (mg/L)',
            'rgba(67, 160, 71, 0.2)',
            'rgba(67, 160, 71, 1)',
            [0, 2.0],
            [0.5, 1.0],
            chartOptions
        );

        // TDS Chart
        createLineChart('tdsChart',
            ['Aug', 'Sep', 'Oct'],
            [320, 330, 345],
            'TDS (ppm)',
            'rgba(123, 31, 162, 0.2)',
            'rgba(123, 31, 162, 1)',
            [0, 1000],
            [0, 500],
            chartOptions
        );

        // Quality Trend Chart
        createQualityTrendChart();
    }

    // Function to create line charts for parameters
    function createLineChart(canvasId, labels, data, label, backgroundColor, borderColor, range, idealRange, options) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create gradient for fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // Use provided options with some customizations
        const chartOptions = {
            ...options,
            scales: {
                ...options.scales,
                y: {
                    ...options.scales.y,
                    min: range[0],
                    max: range[1]
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: gradient,
                    borderColor: borderColor,
                    borderWidth: 2,
                    pointBackgroundColor: borderColor,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        return chart;
    }

    // Function to create the main quality trend chart
    function createQualityTrendChart() {
        const ctx = document.getElementById('qualityTrendChart').getContext('2d');

        // Create dataset for multiple parameters
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [
                    {
                        label: 'pH',
                        data: [7.2, 7.1, 7.3, 7.1, 7.3, 7.2],
                        borderColor: 'rgba(25, 118, 210, 1)',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Turbidity',
                        data: [3.8, 4.1, 3.9, 4.2, 4.8, 5.8],
                        borderColor: 'rgba(255, 160, 0, 1)',
                        backgroundColor: 'rgba(255, 160, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Residual Chlorine',
                        data: [0.6, 0.7, 0.8, 0.7, 0.9, 0.8],
                        borderColor: 'rgba(67, 160, 71, 1)',
                        backgroundColor: 'rgba(67, 160, 71, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'pH'
                        },
                        min: 6.5,
                        max: 8.5
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Turbidity (NTU)'
                        },
                        min: 0,
                        max: 10,
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Chlorine (mg/L)'
                        },
                        min: 0,
                        max: 2,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });

        window.qualityTrendChart = chart;
    }

    // Function to update trend chart based on selected period
    function updateTrendChart(period) {
        // This would typically fetch data from an API based on the period
        // For this hardcoded version, we'll just simulate different data

        let labels, pH, turbidity, chlorine;

        switch (period) {
            case '30':
                labels = ['Sep 15', 'Sep 22', 'Sep 29', 'Oct 06', 'Oct 13', 'Oct 15'];
                pH = [7.3, 7.2, 7.1, 7.2, 7.3, 7.2];
                turbidity = [4.5, 4.7, 5.0, 5.3, 5.5, 5.8];
                chlorine = [0.9, 0.85, 0.8, 0.75, 0.8, 0.8];
                break;
            case '90':
                labels = ['Jul', 'Aug', 'Sep', 'Oct'];
                pH = [7.3, 7.1, 7.3, 7.2];
                turbidity = [3.9, 4.2, 4.8, 5.8];
                chlorine = [0.8, 0.7, 0.9, 0.8];
                break;
            case '180':
                labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
                pH = [7.2, 7.1, 7.3, 7.1, 7.3, 7.2];
                turbidity = [3.8, 4.1, 3.9, 4.2, 4.8, 5.8];
                chlorine = [0.6, 0.7, 0.8, 0.7, 0.9, 0.8];
                break;
            case '365':
                labels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
                pH = [7.0, 7.1, 7.0, 6.9, 7.1, 7.2, 7.2, 7.1, 7.3, 7.1, 7.3, 7.2];
                turbidity = [3.5, 3.3, 3.4, 3.6, 3.7, 3.9, 3.8, 4.1, 3.9, 4.2, 4.8, 5.8];
                chlorine = [0.6, 0.5, 0.6, 0.7, 0.7, 0.6, 0.6, 0.7, 0.8, 0.7, 0.9, 0.8];
                break;
        }

        // Update chart data
        if (window.qualityTrendChart) {
            window.qualityTrendChart.data.labels = labels;
            window.qualityTrendChart.data.datasets[0].data = pH;
            window.qualityTrendChart.data.datasets[1].data = turbidity;
            window.qualityTrendChart.data.datasets[2].data = chlorine;
            window.qualityTrendChart.update();
        }
    }

    // Function to show record test modal (would be implemented in a real application)
    function showRecordTestModal() {
        alert("This would open a form to record a new water quality test. In a real implementation, this would be a modal with form fields for each water quality parameter.");
    }

    // Add logout function
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
    }

    // Logout function
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

    // Handle window resize to redraw charts properly in the grid layout
    window.addEventListener('resize', function () {
        if (window.qualityTrendChart) {
            window.qualityTrendChart.resize();
        }

        // Redraw all parameter charts
        const chartIds = ['pHChart', 'turbidityChart', 'chlorineChart', 'tdsChart'];
        chartIds.forEach(id => {
            const chart = Chart.getChart(id);
            if (chart) {
                chart.resize();
            }
        });
    });
});
