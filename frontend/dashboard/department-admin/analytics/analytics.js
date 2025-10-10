document.addEventListener('DOMContentLoaded', function () {
    // --- CHART INSTANCES ---
    let complaintsChart, resolutionChart, districtChart;

    // --- DOM ELEMENTS ---
    const statTotalEl = document.getElementById('stat-total');
    const statResolvedEl = document.getElementById('stat-resolved');
    const statPendingEl = document.getElementById('stat-pending');
    const statAvgTimeEl = document.getElementById('stat-avg-time');
    const dateRangeSelect = document.getElementById('date-range');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportModal = document.getElementById('export-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.btn-cancel');
    const exportConfirmBtn = document.querySelector('.btn-export-confirm');

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // ----Event Listeners ----
    // Report generation modal
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function () {
            showExportModal();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            hideExportModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            hideExportModal();
        });
    }

    if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener('click', function () {
            generateReport();
        });
    }

    // Click outside modal to close
    window.addEventListener('click', function (e) {
        if (e.target === exportModal) {
            hideExportModal();
        }
    });

    // --- DATA FETCHING ---
    async function loadAnalyticsData(period = '30') {
        try {
            showLoadingState();

            const response = await window.analyticsAPI.getDashboardData();

            if (response && response.success) {
                updateUI(response.data);
            } else {
                throw new Error(response?.message || 'Invalid API response');
            }
        } catch (error) {
            console.error("Failed to load analytics data from API:", error);
            showToast('Could not load analytics data.', 'error');
        } finally {
            hideLoadingState();
        }
    }

    // --- UI UPDATES ---
    function updateUI(data) {
        // Calculate pending count
        const pendingCount = data.reportCount - data.resolvedCount;

        // Update stat cards with animation
        animateCounter(statTotalEl, parseInt(statTotalEl.textContent) || 0, data.reportCount);
        animateCounter(statResolvedEl, parseInt(statResolvedEl.textContent) || 0, data.resolvedCount);
        animateCounter(statPendingEl, parseInt(statPendingEl.textContent) || 0, pendingCount);

        // Update avg resolution time
        const currentAvgTime = parseFloat(statAvgTimeEl.textContent) || 0;
        animateCounter(statAvgTimeEl, currentAvgTime, data.avgResolutionTime, 1, 'h');

        // Update charts
        updateResolutionChart(data.resolvedCount, pendingCount);

        // Also update other charts if data is available
        if (data.reportsByCategory) {
            updateDistrictChart(data.reportsByZone || []);
        }

        if (data.reportTrend) {
            updateComplaintsTrendChart(data.reportTrend);
        }
    }

    function showLoadingState() {
        // Add loading class to stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.add('loading');
        });

        // Add loading class to charts
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.add('loading');
        });
    }

    function hideLoadingState() {
        // Remove loading class from stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.remove('loading');
        });

        // Remove loading class from charts
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.remove('loading');
        });
    }

    function animateCounter(element, startValue, endValue, decimals = 0, suffix = '') {
        if (!element) return;

        // Parse values
        startValue = startValue || 0;
        const duration = 1000;
        const frameRate = 20;
        const step = (endValue - startValue) / (duration / frameRate);

        let currentValue = startValue;
        const timer = setInterval(() => {
            currentValue += step;

            if ((step > 0 && currentValue >= endValue) || (step < 0 && currentValue <= endValue)) {
                clearInterval(timer);
                element.textContent = endValue.toFixed(decimals) + suffix;
            } else {
                element.textContent = currentValue.toFixed(decimals) + suffix;
            }
        }, frameRate);
    }

    // --- CHART INITIALIZATION ---
    function initializeCharts() {
        // 1. Resolution Rate (Doughnut Chart)
        const resolutionCtx = document.getElementById('resolutionChart');
        if (resolutionCtx) {
            resolutionChart = new Chart(resolutionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Resolved', 'Pending'],
                    datasets: [{
                        data: [248, 67],
                        backgroundColor: ['#1cc88a', '#f0f2f5'],
                        borderWidth: 0,
                        cutout: '80%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: 10,
                            bodyFont: { size: 14 }
                        },
                        centerText: { text: '79%' }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: (chart) => {
                        const { ctx, width, height } = chart;
                        const text = chart.options.plugins.centerText.text;
                        ctx.restore();
                        ctx.font = `bold ${(height / 5).toFixed(0)}px sans-serif`;
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#5a5c69';
                        const textX = Math.round((width - ctx.measureText(text).width) / 2);
                        const textY = height / 2;
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                    }
                }]
            });
        }

        // 2. Reports Trend (Line Chart)
        const complaintsCtx = document.getElementById('complaintsChart');
        if (complaintsCtx) {
            // Create gradient for fill
            const ctx = complaintsCtx.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(78, 115, 223, 0.2)');
            gradient.addColorStop(1, 'rgba(78, 115, 223, 0)');

            complaintsChart = new Chart(complaintsCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'New Complaints',
                        data: [65, 78, 90, 81, 95, 110, 123, 142, 155, 160, 148, 138],
                        borderColor: '#4e73df',
                        backgroundColor: gradient,
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: '#4e73df',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: { usePointStyle: true, padding: 15 }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: 10,
                            bodyFont: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
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

        // 3. Reports by Village Zone (Bar Chart)
        const districtCtx = document.getElementById('districtChart');
        if (districtCtx) {
            districtChart = new Chart(districtCtx, {
                type: 'bar',
                data: {
                    labels: ['North Village', 'South Village', 'East Village', 'West Village', 'Central Zone'],
                    datasets: [{
                        label: 'Total Reports',
                        data: [352, 271, 184, 163, 120],
                        backgroundColor: [
                            'rgba(78, 115, 223, 0.8)',
                            'rgba(28, 200, 138, 0.8)',
                            'rgba(246, 194, 62, 0.8)',
                            'rgba(231, 74, 59, 0.8)',
                            'rgba(54, 185, 204, 0.8)'
                        ],
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: 10,
                            bodyFont: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
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
    }

    // --- CHART UPDATES ---
    function updateResolutionChart(resolved, pending) {
        if (!resolutionChart) return;

        const total = resolved + pending;
        const resolutionRate = (total > 0) ? ((resolved / total) * 100).toFixed(0) : 0;

        resolutionChart.data.datasets[0].data = [resolved, pending];
        resolutionChart.options.plugins.centerText.text = `${resolutionRate}%`;
        resolutionChart.update();
    }

    function updateComplaintsTrendChart(trendData) {
        if (!complaintsChart) return;

        const labels = trendData.map(item => item.period);
        const data = trendData.map(item => item.count);

        complaintsChart.data.labels = labels;
        complaintsChart.data.datasets[0].data = data;
        complaintsChart.update();
    }

    function updateDistrictChart(zoneData) {
        if (!districtChart) return;

        const labels = zoneData.map(item => item.name);
        const data = zoneData.map(item => item.count);

        districtChart.data.labels = labels;
        districtChart.data.datasets[0].data = data;
        districtChart.update();
    }

    // --- MODAL FUNCTIONS ---
    function showExportModal() {
        if (exportModal) {
            exportModal.style.display = 'flex';
            setTimeout(() => {
                exportModal.classList.add('active');
            }, 10);
        }
    }

    function hideExportModal() {
        if (exportModal) {
            exportModal.classList.remove('active');
            setTimeout(() => {
                exportModal.style.display = 'none';
            }, 300);
        }
    }

    function generateReport() {
        const format = document.querySelector('input[name="export-format"]:checked').value;

        // Get selected content options
        const includeReports = document.getElementById('include-reports').checked;
        const includeZones = document.getElementById('include-zones').checked;

        // Display processing toast
        showToast('Preparing your report...', 'info');

        // Simulate processing delay
        setTimeout(() => {
            hideExportModal();

            // Show success toast with report details
            const sections = [];
            if (includeReports) sections.push('Reports Analytics');
            if (includeZones) sections.push('Zone Distribution');

            const message = `${format.toUpperCase()} report generated with: ${sections.join(', ')}`;
            showToast(message, 'success');
        }, 1500);
    }

    // --- TOAST NOTIFICATIONS ---
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = getToastIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="toast-content">${message}</div>
            <button class="toast-close">&times;</button>
        `;

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        });

        toastContainer.appendChild(toast);

        // Trigger the animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    function getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // --- AUTHENTICATION ---
    function logout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            sessionStorage.clear();

            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            window.location.href = '../../../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../../../index.html';
        }
    }

    // Initialize logout functionality
    function initializeLogoutButtons() {
        const logoutButtons = document.querySelectorAll('.logout, .logout-btn, [data-action="logout"]');
        const logoutLinks = document.querySelectorAll('a[href*="logout"], a.logout');

        logoutButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        });

        logoutLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        });
    }

    // Check token expiration
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
                alert('Your session has expired. Please log in again.');
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

    // --- INITIALIZE ---
    initializeCharts();
    loadAnalyticsData();
    initializeLogoutButtons();
    checkTokenExpiration();
    setInterval(checkTokenExpiration, 60 * 60 * 1000);
});
