document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing Gram Dhara water management dashboard...');

    // --- CHART INSTANCES ---
    let categoryChart, waterQualityChart;

    // --- GLOBAL STATE ---
    let allReports = []; // Will hold all reports fetched from the API
    let filteredReports = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    let map;
    let marker;

    // --- DOM ELEMENT SELECTION ---
    const statCardsContainer = document.querySelector('.stats-cards');
    const issuesTbody = document.getElementById('issues-tbody');
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priorityFilterBtn = document.querySelector('.priority-filter');
    const paginationContainer = document.querySelector('.pagination');
    const recentActivityList = document.querySelector('.recent-activity .activity-list');

    // Display current date
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-IN', options);
    }

    // --- INITIALIZATION ---
    async function initializeDashboard() {
        checkTokenExpiration(); // Your custom auth check
        initializeCharts(); // Create empty charts first
        setupModalFunctionality();
        setupFilters();

        try {
            // Fetch analytics and all reports data in parallel
            const [analyticsResponse, reportsResponse] = await Promise.all([
                window.analyticsAPI?.getDashboardData() || { success: false, message: "No analytics API" },
                window.reportsAPI?.getAllReports() || { success: false, message: "No reports API" }
            ]);

            // Populate page with fetched data
            if (analyticsResponse.success && analyticsResponse.data) {
                updateStatCards(analyticsResponse.data);
                updateCharts(analyticsResponse.data);
            } else {
                // Use demo data if API not available
                updateChartsWithDemoData();
            }

            if (reportsResponse.success && reportsResponse.data) {
                allReports = reportsResponse.data;
                filteredReports = [...allReports];
                populateIssuesTable();
                setupPagination();
                renderRecentActivity(allReports);
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            // Use demo data if API fails
            updateChartsWithDemoData();
        }

        initializeLogout(); // Your custom logout setup
        setupDepartmentCardEvents();
    }

    // --- UI & CHART UPDATES ---
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

    async function updateStatsWithCalculations() {
        const totalReportsThisMonthElement = document.getElementById('total-complaints-this-month');
        const resolvedThisWeekElement = document.getElementById('resolved-this-week');

        try {
            const response = await window.reportsAPI?.getAllReports();
            if (response && response.success && response.data) {
                const allReports = response.data;

                // --- Perform the Calculations ---

                // Total Reports
                const totalReports = allReports.length;

                // Reports this month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const newThisMonth = allReports.filter(c => new Date(c.createdAt) >= startOfMonth).length;

                // Resolved this week
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                const resolvedThisWeek = allReports.filter(c => c.status === 'resolved' && new Date(c.updatedAt) >= startOfWeek).length;

                // --- Update the UI ---
                if (totalReportsThisMonthElement)
                    totalReportsThisMonthElement.innerHTML = `<i class="fas fa-arrow-up"></i> ${newThisMonth} this month`;
                if (resolvedThisWeekElement)
                    resolvedThisWeekElement.innerHTML = `<i class="fas fa-arrow-up"></i> ${resolvedThisWeek} this week`;

            } else {
                console.log('Using demo data for stats');
            }
        } catch (error) {
            console.error('Error fetching or processing data:', error);
        }
    }

    function updateStatCards(analyticsData) {
        // 1. Select the container and individual cards for clarity.
        const statCardsContainer = document.querySelector('.stats-cards');
        if (!statCardsContainer) {
            console.error("Statistics card container not found!");
            return;
        }

        const totalCard = statCardsContainer.querySelector('.stat-card:nth-child(1)');
        const resolvedCard = statCardsContainer.querySelector('.stat-card:nth-child(2)');
        const pendingCard = statCardsContainer.querySelector('.stat-card:nth-child(3)');

        // 2. Safely extract data with fallbacks to prevent errors if a value is missing.
        const stats = {
            total: analyticsData.reportCount || 0,
            resolved: analyticsData.resolvedCount || 0,
            // Use a dedicated 'pending' value if available, otherwise calculate it.
            pending: analyticsData.pendingCount || (analyticsData.reportCount - analyticsData.resolvedCount) || 0,
            newThisMonth: analyticsData.newReportsThisMonth || 0,
            resolvedThisWeek: analyticsData.resolvedThisWeek || 0,
            // Ensure the average time is a number and format it to one decimal place.
            avgResolution: (typeof analyticsData.avgResolutionTime === 'number') ? analyticsData.avgResolutionTime.toFixed(1) : 'N/A',
            // Ensure satisfaction is a number and format it. Default to 'N/A'.
            activePumps: analyticsData.activePumps || 6
        };

        // 3. Update each card's main number (h2) and supplementary text (small).
        if (totalCard) {
            totalCard.querySelector('h2').textContent = stats.total;
            totalCard.querySelector('small').innerHTML = `<i class="fas fa-arrow-up"></i> ${stats.newThisMonth} this month`;
        }

        if (resolvedCard) {
            resolvedCard.querySelector('h2').textContent = stats.resolved;
            resolvedCard.querySelector('small').innerHTML = `<i class="fas fa-arrow-up"></i> ${stats.resolvedThisWeek} this week`;
        }

        if (pendingCard) {
            pendingCard.querySelector('h2').textContent = stats.pending;
            pendingCard.querySelector('small').textContent = `Avg. Resolve: ${stats.avgResolution} days`;
        }

        updateStatsWithCalculations();
    }

    function updateCharts(data) {
        if (data.reportsByCategory && categoryChart) {
            categoryChart.data.labels = data.reportsByCategory.map(c => c.name);
            categoryChart.data.datasets[0].data = data.reportsByCategory.map(c => c.count);
            categoryChart.update();
        }

        if (data.waterQualityTrends && waterQualityChart) {
            waterQualityChart.data.datasets[0].data = data.waterQualityTrends.phValues || [];
            waterQualityChart.data.datasets[1].data = data.waterQualityTrends.chlorineLevels || [];
            waterQualityChart.data.datasets[2].data = data.waterQualityTrends.turbidityLevels || [];
            waterQualityChart.update();
        }
    }

    function updateChartsWithDemoData() {
        // Demo data for category chart
        if (categoryChart) {
            categoryChart.data.labels = ['Water Supply', 'Water Quality', 'Water Leakage', 'Pump Issue', 'Billing', 'Other'];
            categoryChart.data.datasets[0].data = [65, 42, 38, 30, 25, 15];
            categoryChart.update();
        }

        // Demo data for water quality chart
        if (waterQualityChart) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
            waterQualityChart.data.labels = months;
            waterQualityChart.data.datasets[0].data = [7.2, 7.1, 7.3, 7.2, 7.4, 7.3, 7.1, 7.2, 7.3]; // pH values
            waterQualityChart.data.datasets[1].data = [0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.8, 0.6, 0.7]; // Chlorine levels
            waterQualityChart.data.datasets[2].data = [3.8, 4.1, 3.9, 4.2, 3.7, 3.8, 4.0, 3.9, 3.8]; // Turbidity levels
            waterQualityChart.update();
        }
    }

    function renderRecentActivity(reports) {
        if (!recentActivityList) return;
        recentActivityList.innerHTML = '';

        const recent = reports
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.createdAt))
            .slice(0, 3); // Show top 3 most recent activities

        recent.forEach(activity => {
            const activityType = activity.status === 'resolved' ? 'resolved-icon' :
                activity.status === 'in_progress' ? 'comment-icon' : 'status-icon';
            const iconClass = activity.status === 'resolved' ? 'check-circle' :
                activity.status === 'in_progress' ? 'comment' : 'sync-alt';

            const activityTitle = activity.status === 'resolved' ? 'Water Issue Resolved' :
                activity.status === 'in_progress' ? 'Department Comment' : 'Status Updated';

            const activityDesc = activity.status === 'resolved' ?
                `${activity.title} issue has been resolved.` :
                activity.status === 'in_progress' ?
                    `Water department added comment to ${activity.title.toLowerCase()}.` :
                    `${activity.title} status changed to "${capitalizeFirstLetter(activity.status)}".`;

            const itemHTML = `
                <div class="activity-item">
                    <div class="activity-icon ${activityType}">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="activity-details">
                        <h4>${activityTitle}</h4>
                        <p>${activityDesc}</p>
                        <small>${new Date(activity.updatedAt || activity.createdAt).toLocaleString('en-IN')}</small>
                    </div>
                </div>`;
            recentActivityList.insertAdjacentHTML('beforeend', itemHTML);
        });

        // If no activities, use placeholders
        if (recent.length === 0) {
            const placeholderActivities = [
                {
                    icon: 'check-circle',
                    type: 'resolved-icon',
                    title: 'Water Issue Resolved',
                    desc: 'Low water pressure issue at North Village Zone has been fixed.',
                    date: 'Today, 10:30 AM'
                },
                {
                    icon: 'comment',
                    type: 'comment-icon',
                    title: 'Department Comment',
                    desc: 'Water quality team added comment to discolored water report.',
                    date: 'Yesterday, 3:45 PM'
                },
                {
                    icon: 'sync-alt',
                    type: 'status-icon',
                    title: 'Status Updated',
                    desc: 'Water leakage report status changed to "In Progress".',
                    date: '22 Sep 2023, 9:15 AM'
                }
            ];

            placeholderActivities.forEach(activity => {
                const itemHTML = `
                    <div class="activity-item">
                        <div class="activity-icon ${activity.type}">
                            <i class="fas fa-${activity.icon}"></i>
                        </div>
                        <div class="activity-details">
                            <h4>${activity.title}</h4>
                            <p>${activity.desc}</p>
                            <small>${activity.date}</small>
                        </div>
                    </div>`;
                recentActivityList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
    }

    // --- TABLE, FILTERS, & PAGINATION ---
    function populateIssuesTable() {
        if (!issuesTbody) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const issuesToShow = filteredReports.slice(startIndex, endIndex);

        issuesTbody.innerHTML = '';
        if (issuesToShow.length === 0 && allReports.length === 0) {
            // Use sample data if no reports are available
            const sampleReports = [
                {
                    reportId: 'WR-2023-001',
                    title: 'Water Supply Interruption',
                    userId: { name: 'Rajesh Kumar' },
                    categoryId: { name: 'Water Supply' },
                    createdAt: '2023-09-15T10:30:00',
                    status: 'in_progress',
                    priority: 'high'
                },
                {
                    reportId: 'WR-2023-002',
                    title: 'Water Leakage in Main Pipe',
                    userId: { name: 'Anita Sharma' },
                    categoryId: { name: 'Water Leakage' },
                    createdAt: '2023-09-14T14:15:00',
                    status: 'new',
                    priority: 'medium'
                },
                {
                    reportId: 'WR-2023-003',
                    title: 'Discolored Water',
                    userId: { name: 'Priya Patel' },
                    categoryId: { name: 'Water Quality' },
                    createdAt: '2023-09-13T09:45:00',
                    status: 'resolved',
                    priority: 'high'
                }
            ];

            sampleReports.forEach(issue => {
                appendReportRow(issue);
            });

            return;
        }

        if (issuesToShow.length === 0) {
            issuesTbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No reports match the current filters.</td></tr>`;
            return;
        }

        issuesToShow.forEach(issue => {
            appendReportRow(issue);
        });

        attachActionButtonListeners();
    }

    function appendReportRow(issue) {
        const tr = document.createElement('tr');
        const capitalizedStatus = capitalizeFirstLetter(issue.status.replace('_', ' '));
        const statusBadge = `<span class="status-badge status-${issue.status.replace('_', '-')}">${capitalizedStatus}</span>`;
        const priorityBadge = `<span class="priority-badge priority-${issue.priority}" title="${capitalizeFirstLetter(issue.priority)}"></span>`;
        const actionButtons = `
            <div class="action-buttons">
                <button title="View Details" class="view-issue" data-id="${issue.reportId}"><i class="fas fa-eye"></i></button>
                <button title="Edit Issue" class="edit-issue" data-id="${issue.reportId}"><i class="fas fa-edit"></i></button>
            </div>`;
        tr.innerHTML = `
            <td>${issue.reportId}</td>
            <td>${issue.title}</td>
            <td>${issue.userId?.name || 'N/A'}</td>
            <td>${capitalizeFirstLetter(issue.categoryId?.name) || 'N/A'}</td>
            <td>${new Date(issue.createdAt).toLocaleDateString('en-IN')}</td>
            <td>${statusBadge}</td>
            <td>${priorityBadge}</td>
            <td>${actionButtons}</td>`;
        issuesTbody.appendChild(tr);
    }

    function applyFilters() {
        if (!statusFilter || !categoryFilter || !priorityFilterBtn) return;

        const statusValue = statusFilter.value;
        const categoryValue = categoryFilter.value;
        const priorityValue = priorityFilterBtn.getAttribute('data-priority') || 'all';

        let filtered = [...allReports];
        if (statusValue !== 'all') filtered = filtered.filter(c => c.status === statusValue);
        if (categoryValue !== 'all') filtered = filtered.filter(c => c.categoryId?.name === categoryValue.toLowerCase());
        if (priorityValue !== 'all') filtered = filtered.filter(c => c.priority === priorityValue);

        filteredReports = filtered;
        currentPage = 1;
        populateIssuesTable();
        setupPagination();
    }

    function setupFilters() {
        if (statusFilter) statusFilter.addEventListener('change', applyFilters);
        if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
        if (priorityFilterBtn) {
            priorityFilterBtn.addEventListener('click', function () {
                const currentPriority = this.getAttribute('data-priority') || 'all';
                const priorities = ['all', 'low', 'medium', 'high', 'critical'];
                const nextIndex = (priorities.indexOf(currentPriority) + 1) % priorities.length;
                const nextPriority = priorities[nextIndex];

                this.setAttribute('data-priority', nextPriority);
                this.innerHTML = `<i class="fas fa-flag"></i> ${nextPriority === 'all' ? 'All Priorities' : capitalizeFirstLetter(nextPriority) + ' Priority'}`;

                applyFilters();
            });
        }
    }

    function setupPagination() {
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => { currentPage--; populateIssuesTable(); setupPagination(); });
        paginationContainer.appendChild(prevButton);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) pageButton.className = 'active';
            pageButton.addEventListener('click', () => { currentPage = i; populateIssuesTable(); setupPagination(); });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => { currentPage++; populateIssuesTable(); setupPagination(); });
        paginationContainer.appendChild(nextButton);
    }

    // --- DEPARTMENT CARD INTERACTIONS ---
    function setupDepartmentCardEvents() {
        const departmentCards = document.querySelectorAll('.department-card');
        departmentCards.forEach(card => {
            card.addEventListener('click', function () {
                const departmentName = this.querySelector('.department-title').textContent;
                // In a real app, navigate to department details page or show modal
                console.log(`View details for ${departmentName} department`);
            });

            // Only add click event to the button to prevent event bubbling
            const viewButton = card.querySelector('.view-dept');
            if (viewButton) {
                viewButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent triggering the card's click event
                    const departmentName = this.closest('.department-card').querySelector('.department-title').textContent;
                    window.location.href = `departments/departments.html?department=${encodeURIComponent(departmentName)}`;
                });
            }
        });
    }

    // --- MODALS & ACTIONS ---
    function attachActionButtonListeners() {
        document.querySelectorAll('.view-issue, .edit-issue').forEach(button => {
            button.addEventListener('click', function () {
                const issueId = this.getAttribute('data-id');
                openIssueDetailModal(issueId);
            });
        });
    }

    function updateAudioInModal(issue) {
        const audioGallery = document.getElementById('audio-gallery');
        if (!audioGallery) return;

        if (issue.voice_recording_url) {
            audioGallery.innerHTML = `
            <audio id="detail-audio" controls>
                <source src="${issue.voice_recording_url}" type="audio/webm">
                Your browser does not support the audio element.
            </audio>
        `;
        } else {
            audioGallery.innerHTML = `<p>No audio description provided.</p>`;
        }
    }

    function openIssueDetailModal(issueId) {
        const issue = allReports.find(c => c.reportId === issueId);

        // If issue not found in allReports, use a sample issue (for demo purposes)
        const sampleIssue = {
            reportId: issueId,
            title: issueId === 'WR-2023-001' ? 'Water Supply Interruption' :
                issueId === 'WR-2023-002' ? 'Water Leakage in Main Pipe' : 'Discolored Water',
            userId: {
                name: issueId === 'WR-2023-001' ? 'Rajesh Kumar' :
                    issueId === 'WR-2023-002' ? 'Anita Sharma' : 'Priya Patel'
            },
            categoryId: {
                name: issueId === 'WR-2023-001' ? 'Water Supply' :
                    issueId === 'WR-2023-002' ? 'Water Leakage' : 'Water Quality'
            },
            createdAt: new Date().toISOString(),
            status: issueId === 'WR-2023-001' ? 'in_progress' :
                issueId === 'WR-2023-002' ? 'new' : 'resolved',
            priority: issueId === 'WR-2023-003' ? 'medium' : 'high',
            description: "Detailed description of the water issue. This issue has been reported by residents and requires prompt attention from the water department team.",
            photo_url: 'https://via.placeholder.com/400x200?text=Water+Issue+Photo',
            location_lat: 20.5937,
            location_lng: 78.9629
        };

        const displayIssue = issue || sampleIssue;
        const modal = document.getElementById('issue-detail-modal');
        if (!modal) return;

        // Populate the modal with dynamic data
        const detailId = document.getElementById('detail-id');
        const detailType = document.getElementById('detail-type');
        const detailReporter = document.getElementById('detail-reporter');
        const detailDate = document.getElementById('detail-date');
        const detailDesc = document.getElementById('detail-description');
        const detailImage = document.getElementById('detail-image');
        const issueStatus = document.getElementById('issue-status');
        const issuePriority = document.getElementById('issue-priority');
        const issueDepartment = document.getElementById('issue-department');
        const detailLocation = document.getElementById('detail-location');

        if (detailId) detailId.textContent = displayIssue.reportId;
        if (detailType) detailType.textContent = displayIssue.title;
        if (detailReporter) detailReporter.textContent = displayIssue.userId?.name || 'N/A';
        if (detailDate) detailDate.textContent = new Date(displayIssue.createdAt).toLocaleString('en-IN');
        if (detailDesc) detailDesc.textContent = displayIssue.description;
        if (detailImage) detailImage.src = displayIssue.photo_url || 'https://via.placeholder.com/400x200?text=No+Image';

        if (issueStatus) issueStatus.textContent = capitalizeFirstLetter(displayIssue.status.replace('_', ' '));
        if (issuePriority) issuePriority.textContent = capitalizeFirstLetter(displayIssue.priority);
        if (issueDepartment) issueDepartment.textContent = capitalizeFirstLetter(displayIssue.categoryId?.name) || 'N/A';

        updateAudioInModal(displayIssue);

        // Update location information
        const lat = displayIssue.location_lat;
        const lng = displayIssue.location_lng;

        if (detailLocation) detailLocation.textContent = `Lat: ${lat}, Lng: ${lng}`;

        // Show the modal
        modal.style.display = 'flex';

        // Initialize map if available
        const mapContainer = document.getElementById('issue-map-container');
        if (mapContainer) {
            setTimeout(() => {
                // Initialize Leaflet map if it's available
                try {
                    if (typeof L !== 'undefined') {
                        if (!map) {
                            map = L.map('issue-map-container');
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(map);
                        }

                        map.setView([lat, lng], 16);

                        if (marker) marker.remove();
                        marker = L.marker([lat, lng]).addTo(map);

                        map.invalidateSize();
                    } else {
                        console.log('Leaflet library not loaded');
                    }
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            }, 100);
        }
    }

    // Wire up the existing modal close buttons
    function setupModalFunctionality() {
        const modal = document.getElementById('issue-detail-modal');
        if (!modal) return;

        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });
    }

    // --- CHART INITIALIZATION ---
    function initializeCharts() {
        // Water Issues by Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            categoryChart = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Water Supply', 'Water Quality', 'Water Leakage', 'Pump Issue', 'Billing', 'Other'],
                    datasets: [{
                        label: 'Reports by Category',
                        data: [65, 42, 38, 30, 25, 15],
                        backgroundColor: [
                            '#03a9f4',
                            '#00bcd4',
                            '#4fc3f7',
                            '#29b6f6',
                            '#81d4fa',
                            '#b3e5fc'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 10,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        }

        // Water Quality Trends Chart
        const waterQualityCtx = document.getElementById('waterQualityChart');
        if (waterQualityCtx) {
            waterQualityChart = new Chart(waterQualityCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    datasets: [
                        {
                            label: 'pH Value',
                            data: [7.2, 7.1, 7.3, 7.2, 7.4, 7.3, 7.1, 7.2, 7.3],
                            borderColor: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Chlorine (mg/L)',
                            data: [0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.8, 0.6, 0.7],
                            borderColor: '#388e3c',
                            backgroundColor: 'rgba(56, 142, 60, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Turbidity (NTU)',
                            data: [3.8, 4.1, 3.9, 4.2, 3.7, 3.8, 4.0, 3.9, 3.8],
                            borderColor: '#ffa000',
                            backgroundColor: 'rgba(255, 160, 0, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 5,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // --- LOGOUT AND AUTH FUNCTIONS ---
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

    function initializeLogout() {
        const logoutLink = document.querySelector('.logout');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }

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

    // --- START THE APPLICATION ---
    initializeDashboard();

    // Window resize handler to properly resize charts
    window.addEventListener('resize', function () {
        if (categoryChart) categoryChart.resize();
        if (waterQualityChart) waterQualityChart.resize();
    });

    // --- RECENT REPORTS ENHANCEMENTS ---
    function enhanceReportTable() {
        // Make the entire row clickable for better UX
        const reportRows = document.querySelectorAll('#issues-tbody tr');
        reportRows.forEach(row => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (!e.target.closest('.action-buttons')) {
                    const id = row.querySelector('.view-issue')?.dataset?.id;
                    if (id) openIssueDetailModal(id);
                }
            });

            // Add hover effect for better feedback
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = '#f8f9fa';
            });

            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    }

    // Enhance the Recent Activity display
    function enhanceRecentActivity() {
        const activityItems = document.querySelectorAll('.activity-item');

        activityItems.forEach(item => {
            // Add click interaction if there's a report ID
            const reportId = item.dataset.reportId;
            if (reportId) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    openIssueDetailModal(reportId);
                });
            }

            // Add time-ago format for better readability
            const timeElement = item.querySelector('small');
            if (timeElement && timeElement.textContent) {
                const timestamp = timeElement.dataset.timestamp || timeElement.textContent;
                if (timestamp) {
                    try {
                        const date = new Date(timestamp);
                        if (!isNaN(date)) {
                            timeElement.textContent = timeAgo(date);
                        }
                    } catch (e) {
                        console.error('Error formatting date:', e);
                    }
                }
            }
        });
    }

    // Helper function to display relative time
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        if (interval === 1) return '1 year ago';

        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        if (interval === 1) return '1 month ago';

        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        if (interval === 1) return '1 day ago';

        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return '1 hour ago';

        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return '1 minute ago';

        if (seconds < 10) return 'just now';

        return Math.floor(seconds) + ' seconds ago';
    }

    // Improve the priority badge display
    function enhancePriorityBadges() {
        const priorityBadges = document.querySelectorAll('.priority-badge');

        priorityBadges.forEach(badge => {
            const priority = badge.classList[1]?.replace('priority-', '');
            if (priority) {
                // Add tooltip functionality
                badge.title = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;

                // Make sure proper colors are applied
                const colors = {
                    'low': '#81d4fa',
                    'medium': '#4fc3f7',
                    'high': '#29b6f6',
                    'critical': '#03a9f4'
                };

                if (colors[priority]) {
                    badge.style.backgroundColor = colors[priority];
                }
            }
        });
    }

    // Call these enhancement functions after populating the table
    function applyUIEnhancements() {
        enhanceReportTable();
        enhanceRecentActivity();
        enhancePriorityBadges();
    }

    // Modify existing populateIssuesTable function to call our enhancements
    const originalPopulateIssuesTable = populateIssuesTable;
    populateIssuesTable = function () {
        originalPopulateIssuesTable.apply(this, arguments);
        applyUIEnhancements();
    };

    // Modify renderRecentActivity to include timestamps
    const originalRenderRecentActivity = renderRecentActivity;
    renderRecentActivity = function (reports) {
        originalRenderRecentActivity.apply(this, arguments);
        enhanceRecentActivity();
    };

    // Call enhancements on initial load
    document.addEventListener('DOMContentLoaded', function () {
        // ... existing initialization code ...

        // Apply UI enhancements after a short delay to ensure content is loaded
        setTimeout(applyUIEnhancements, 500);
    });
});