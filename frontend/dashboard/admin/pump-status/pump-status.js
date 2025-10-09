document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Initialize the charts
    initializeCharts();
    
    // Add event listeners to pump control buttons
    setupPumpControls();
    
    // Setup modal functionality for pump details
    setupPumpDetailsModal();
    
    // Setup filter functionality
    setupFilters();

    // Initialize logout functionality
    initializeLogoutButtons();

    // Check token expiration
    checkTokenExpiration();

    // Set interval for token expiration check
    setInterval(checkTokenExpiration, 60 * 60 * 1000);

    /**
     * Initialize all charts for the pump status page
     */
    function initializeCharts() {
        // Flow Rate Chart
        const flowRateCtx = document.getElementById('flowRateChart');
        if (flowRateCtx) {
            new Chart(flowRateCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Flow Rate (L/min)',
                        data: [82.3, 80.5, 85.2, 79.8, 83.6, 87.2, 84.9],
                        borderColor: 'rgba(3, 169, 244, 1)',
                        backgroundColor: 'rgba(3, 169, 244, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 90,
                            title: {
                                display: true,
                                text: 'Liters per minute'
                            },
                            grid: {
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Energy Consumption Chart
        const energyConsumptionCtx = document.getElementById('energyConsumptionChart');
        if (energyConsumptionCtx) {
            new Chart(energyConsumptionCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Energy Consumption (kWh)',
                        data: [42, 38, 45, 40, 43, 30, 28],
                        backgroundColor: 'rgba(255, 152, 0, 0.7)',
                        borderColor: 'rgba(255, 152, 0, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'kWh'
                            },
                            grid: {
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Pump Efficiency Chart
        const pumpEfficiencyCtx = document.getElementById('pumpEfficiencyChart');
        if (pumpEfficiencyCtx) {
            new Chart(pumpEfficiencyCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Efficiency (%)',
                        data: [86, 84, 85, 87, 85, 83, 88],
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 75,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Efficiency (%)'
                            },
                            grid: {
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Maintenance Chart (horizontal bar chart showing upcoming maintenance)
        const maintenanceCtx = document.getElementById('maintenanceChart');
        if (maintenanceCtx) {
            new Chart(maintenanceCtx, {
                type: 'bar',
                data: {
                    labels: ['P004', 'P001', 'P003', 'P006', 'P002'],
                    datasets: [{
                        axis: 'y',
                        label: 'Days Until Next Maintenance',
                        data: [5, 15, 30, 45, 60],
                        backgroundColor: [
                            'rgba(244, 67, 54, 0.7)',  // Red for urgent
                            'rgba(255, 152, 0, 0.7)',  // Orange for soon
                            'rgba(255, 152, 0, 0.7)',  // Orange for soon
                            'rgba(76, 175, 80, 0.7)',  // Green for later
                            'rgba(76, 175, 80, 0.7)'   // Green for later
                        ],
                        borderColor: [
                            'rgba(244, 67, 54, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(76, 175, 80, 1)',
                            'rgba(76, 175, 80, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Days'
                            },
                            grid: {
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Setup pump control buttons with event listeners
     */
    function setupPumpControls() {
        // Control buttons (Start, Stop, Reset)
        const startBtn = document.querySelector('.start-btn');
        const stopBtn = document.querySelector('.stop-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const scheduleBtn = document.querySelector('.btn-schedule-maintenance');

        if (startBtn) {
            startBtn.addEventListener('click', function() {
                updatePumpStatus('active');
                showToast('Pump started successfully', 'success');
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                updatePumpStatus('inactive');
                showToast('Pump stopped successfully', 'warning');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                showToast('Pump system reset initiated', 'info');
                
                // Simulate reset sequence with multiple notifications
                setTimeout(() => {
                    showToast('Running system diagnostics...', 'info');
                }, 1000);
                
                setTimeout(() => {
                    showToast('System diagnostics completed', 'success');
                    updatePumpStatus('active');
                }, 3000);
            });
        }

        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', function() {
                showToast('Maintenance scheduling feature will be available soon', 'info');
            });
        }

        // Action buttons in the alerts section
        document.querySelectorAll('.btn-alert-action').forEach(button => {
            button.addEventListener('click', function() {
                const alertItem = this.closest('.alert-item');
                const alertTitle = alertItem.querySelector('h3').textContent;
                
                showToast(`Action taken for: ${alertTitle}`, 'info');
                
                // Visual feedback
                alertItem.style.opacity = '0.7';
                setTimeout(() => {
                    alertItem.style.display = 'none';
                }, 500);
            });
        });
    }

    /**
     * Set up the pump details modal functionality
     */
    function setupPumpDetailsModal() {
        // Get all view detail buttons
        const viewButtons = document.querySelectorAll('.view-btn');
        const pumpDetailModal = document.getElementById('pump-detail-modal');
        const closeModalBtns = document.querySelectorAll('.close-modal, .btn-close-modal');
        
        // Add click event to view buttons
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const pumpRow = this.closest('tr');
                const pumpId = pumpRow.querySelector('.pump-id').textContent;
                const pumpName = pumpRow.cells[1].textContent;
                const pumpStatus = pumpRow.cells[3].querySelector('.status-badge').textContent;
                const pumpFlowRate = pumpRow.cells[4].textContent;
                const pumpPower = pumpRow.cells[5].textContent;
                const pumpMaintenance = pumpRow.cells[6].textContent;
                
                // Update modal with pump details
                if (pumpDetailModal) {
                    document.getElementById('modal-pump-name').textContent = pumpName;
                    document.getElementById('modal-pump-id').textContent = pumpId;
                    document.getElementById('modal-pump-flow-rate').textContent = pumpFlowRate;
                    document.getElementById('modal-pump-power-usage').textContent = pumpPower;
                    document.getElementById('modal-pump-last-maintenance').textContent = pumpMaintenance;
                    
                    // Set status class
                    const statusBadge = document.getElementById('modal-pump-status');
                    statusBadge.textContent = pumpStatus;
                    statusBadge.className = 'info-value status-badge';
                    if (pumpStatus.toLowerCase() === 'active') {
                        statusBadge.classList.add('active');
                    } else if (pumpStatus.toLowerCase() === 'warning') {
                        statusBadge.classList.add('warning');
                    } else if (pumpStatus.toLowerCase() === 'inactive') {
                        statusBadge.classList.add('inactive');
                    } else if (pumpStatus.toLowerCase() === 'maintenance') {
                        statusBadge.classList.add('maintenance');
                    }
                    
                    // Show modal
                    pumpDetailModal.classList.add('active');
                }
            });
        });
        
        // Close modal functionality
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (pumpDetailModal) {
                    pumpDetailModal.classList.remove('active');
                }
            });
        });
        
        // Close modal when clicking outside content
        if (pumpDetailModal) {
            pumpDetailModal.addEventListener('click', function(e) {
                if (e.target === pumpDetailModal) {
                    pumpDetailModal.classList.remove('active');
                }
            });
        }

        // Modal control buttons
        const modalStartBtn = document.querySelector('.modal .start-btn');
        const modalStopBtn = document.querySelector('.modal .stop-btn');
        const modalResetBtn = document.querySelector('.modal .reset-btn');
        const modalScheduleBtn = document.querySelector('.modal .schedule-btn');

        if (modalStartBtn) {
            modalStartBtn.addEventListener('click', function() {
                showToast('Pump started successfully', 'success');
                document.getElementById('modal-pump-status').textContent = 'Active';
                document.getElementById('modal-pump-status').className = 'info-value status-badge active';
            });
        }

        if (modalStopBtn) {
            modalStopBtn.addEventListener('click', function() {
                showToast('Pump stopped successfully', 'warning');
                document.getElementById('modal-pump-status').textContent = 'Inactive';
                document.getElementById('modal-pump-status').className = 'info-value status-badge inactive';
            });
        }

        if (modalResetBtn) {
            modalResetBtn.addEventListener('click', function() {
                showToast('Pump system reset initiated', 'info');
                setTimeout(() => {
                    showToast('System diagnostics completed', 'success');
                    document.getElementById('modal-pump-status').textContent = 'Active';
                    document.getElementById('modal-pump-status').className = 'info-value status-badge active';
                }, 2000);
            });
        }

        if (modalScheduleBtn) {
            modalScheduleBtn.addEventListener('click', function() {
                showToast('Schedule feature will be available soon', 'info');
            });
        }
    }

    /**
     * Setup filter functionality for tables and charts
     */
    function setupFilters() {
        // Status filter
        const statusFilterEl = document.querySelector('.filter-select');
        if (statusFilterEl) {
            statusFilterEl.addEventListener('change', function() {
                filterTable(this.value, 'status');
            });
        }

        // Location filter
        const locationFilterEl = document.querySelectorAll('.filter-select')[1];
        if (locationFilterEl) {
            locationFilterEl.addEventListener('change', function() {
                filterTable(this.value, 'location');
            });
        }

        // Chart period selector for pumps
        const chartPeriodSelector = document.getElementById('chart-period-selector');
        if (chartPeriodSelector) {
            chartPeriodSelector.addEventListener('change', function() {
                updateChartPeriod(this.value);
            });
        }

        // Export button
        const exportBtn = document.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                showToast('Exporting data...', 'info');
                setTimeout(() => {
                    showToast('Data exported successfully', 'success');
                }, 1500);
            });
        }
    }

    /**
     * Filter table rows based on filter type and value
     * @param {string} value - The filter value
     * @param {string} type - The type of filter (status, location)
     */
    function filterTable(value, type) {
        const tableRows = document.querySelectorAll('.data-table tbody tr');
        let filteredCount = 0;
        
        if (!tableRows || tableRows.length === 0) return;
        
        tableRows.forEach(row => {
            let show = true;
            
            if (value !== 'all') {
                if (type === 'status') {
                    const statusCell = row.cells[3].querySelector('.status-badge');
                    if (statusCell && !statusCell.textContent.toLowerCase().includes(value.toLowerCase())) {
                        show = false;
                    }
                } else if (type === 'location') {
                    const locationCell = row.cells[2];
                    if (locationCell && !locationCell.textContent.toLowerCase().includes(value.toLowerCase())) {
                        show = false;
                    }
                }
            }
            
            if (show) {
                row.style.display = '';
                filteredCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show message if no results
        const tableContainer = document.querySelector('.table-responsive');
        let noResultsMsg = tableContainer.querySelector('.no-results-message');
        
        if (filteredCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.textContent = 'No pumps match the selected filters';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.style.color = 'var(--text-light)';
                tableContainer.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    /**
     * Update the chart period based on selector value
     * @param {string} period - The period to display (daily, weekly, monthly, quarterly)
     */
    function updateChartPeriod(period) {
        // Implementation would depend on specific chart requirements
        showToast(`Chart period updated to: ${period}`, 'info');
    }

    /**
     * Update pump status and related UI elements
     * @param {string} status - The status to set (active, warning, inactive, maintenance)
     */
    function updatePumpStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        // Remove all status classes
        statusIndicator.classList.remove('active', 'warning', 'inactive', 'maintenance');
        
        // Add appropriate status class
        statusIndicator.classList.add(status);
        
        // Update text
        const statusText = statusIndicator.querySelector('span');
        if (statusText) {
            statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        // Update last updated time
        const lastUpdated = document.querySelector('.last-updated span');
        if (lastUpdated) {
            lastUpdated.textContent = 'Updated: Just now';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, warning, info)
     */
    function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('toast-container');
        
        // Create toast container if it doesn't exist
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '1000';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.minWidth = '250px';
        toast.style.backgroundColor = getToastColor(type);
        toast.style.color = 'white';
        toast.style.borderRadius = '4px';
        toast.style.padding = '12px 20px';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'space-between';
        toast.style.animation = 'slideInRight 0.3s, fadeOut 0.5s 2.5s forwards';
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = `fas ${getToastIcon(type)}`;
        icon.style.marginRight = '10px';
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.appendChild(icon);
        content.appendChild(messageSpan);
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = '10px';
        closeBtn.onclick = function() {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        };
        
        toast.appendChild(content);
        toast.appendChild(closeBtn);
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get the background color for a toast type
     * @param {string} type - The type of toast
     * @returns {string} The color code
     */
    function getToastColor(type) {
        switch (type) {
            case 'success': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'error': return '#f44336';
            case 'info':
            default: return '#2196f3';
        }
    }

    /**
     * Get the icon for a toast type
     * @param {string} type - The type of toast
     * @returns {string} The icon class
     */
    function getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }

    /**
     * Logout function
     */
    function logout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            sessionStorage.clear();
            
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            console.log('User logged out successfully - all data cleared');
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

    /**
     * Initialize logout buttons
     */
    function initializeLogoutButtons() {
        // Find all possible logout elements
        const logoutButtons = document.querySelectorAll('.logout, .logout-btn, [data-action="logout"]');
        const logoutLinks = document.querySelectorAll('a[href*="logout"], a.logout');
        
        // Attach logout to all logout buttons
        logoutButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        });
        
        // Attach logout to all logout links
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        });
    }

    /**
     * Check token expiration and logout if needed
     */
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
                alert('Your session has expired. Please log in again.');
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
});
