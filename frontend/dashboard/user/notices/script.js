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

    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => closeNoticeModal());
    });

    const noticeModal = document.getElementById('notice-detail-modal');
    if (noticeModal) {
        noticeModal.addEventListener('click', (e) => {
            if (e.target === noticeModal) {
                closeNoticeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && noticeModal && noticeModal.classList.contains('active')) {
            closeNoticeModal();
        }
    });
    
    // Initialize notices
    const noticesManager = new NoticesManager();
    noticesManager.init();

    // Load backend notices
    loadBackendNotices();

    // Add logout functionality
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
});

// --- NEW CODE TO ADD FOR BACKEND NOTICES ---
function createBackendNoticeCard(notice) {
    const card = document.createElement('div');
    card.className = 'notice-card';
    card.dataset.noticeId = notice._id; // API uses _id

    const header = document.createElement('div');
    header.className = 'notice-header';
    const title = document.createElement('h3');
    title.className = 'notice-title';
    title.textContent = notice.title;
    header.appendChild(title);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'notice-body';
    const preview = document.createElement('div');
    preview.className = 'notice-preview';
    preview.textContent = notice.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
    body.appendChild(preview);
    card.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'notice-footer';
    const date = document.createElement('div');
    date.className = 'notice-date';
    // Format the date from the API (assuming it's called createdAt)
    const formattedDate = new Date(notice.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    date.innerHTML = `<i class="bi bi-calendar3"></i> ${formattedDate}`;
    footer.appendChild(date);
    card.appendChild(footer);

    // In this simple version, clicking the card can log to console or do nothing
    card.addEventListener('click', () => {
        console.log("Clicked backend notice:", notice);
        openNoticeModal(notice);
    });

    return card;
}

async function loadBackendNotices() {
    const backendGrid = document.getElementById('backend-notices-grid');
    if (!backendGrid) {
        console.error('Backend notices grid not found!');
        return;
    }

    try {
        console.log("Fetching backend notices from the API...");
        const response = await window.noticeAPI.getAllNotices();

        if (response && response.success && Array.isArray(response.data)) {
            const notices = response.data;
            backendGrid.innerHTML = ''; // Clear any placeholders

            if (notices.length === 0) {
                // If no notices, you can hide the section
                const backendNoticesContainer = backendGrid.closest('.backend-notices');
                if (backendNoticesContainer) backendNoticesContainer.style.display = 'none';
            } else {
                // If there are notices, create and append a card for each
                notices.forEach(notice => {
                    const noticeCard = createBackendNoticeCard(notice);
                    backendGrid.appendChild(noticeCard);
                });
            }
        } else {
            console.error('Failed to load backend notices, API response invalid.');
        }
    } catch (error) {
        console.error('Error fetching backend notices:', error);
    }
}

// --- NEW MODAL HELPER FUNCTIONS ---

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function openNoticeModal(notice) {
    const noticeModal = document.getElementById('notice-detail-modal');
    if (!noticeModal) return;

    // Set modal content from the notice object
    document.getElementById('modal-title').textContent = notice.title;
    document.getElementById('modal-date').innerHTML = `<i class="bi bi-calendar3"></i> ${formatDate(notice.createdAt)}`;
    document.getElementById('modal-category').textContent = notice.category;
    document.getElementById('modal-category').className = `notice-category category-${notice.category}`;
    document.getElementById('modal-content').innerHTML = notice.content;

    // Logic for attachments (assuming API provides a URL)
    const attachmentsContainer = document.getElementById('modal-attachments');
    attachmentsContainer.innerHTML = ''; // Clear previous attachments
    if (notice.attachments && notice.attachments.length > 0) {
        const attachmentsTitle = document.createElement('h3');
        attachmentsTitle.textContent = 'Attachments';
        attachmentsContainer.appendChild(attachmentsTitle);
        notice.attachments.forEach(file => {
            const item = document.createElement('a');
            item.href = file.url; // The link to the file
            item.target = '_blank'; // Open in a new tab
            item.className = 'attachment-item';
            item.innerHTML = `<i class="bi bi-file-earmark-arrow-down attachment-icon"></i> <span class="attachment-name">${file.name || 'Download'}</span>`;
            attachmentsContainer.appendChild(item);
        });
        attachmentsContainer.style.display = 'block';
    } else {
        attachmentsContainer.style.display = 'none';
    }

    // Show the modal
    noticeModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeNoticeModal() {
    const noticeModal = document.getElementById('notice-detail-modal');
    if (noticeModal) {
        noticeModal.classList.remove('active');
    }
    document.body.style.overflow = ''; // Restore background scrolling
}

class NoticesManager {
    constructor() {
        // DOM Elements
        this.loadingContainer = document.getElementById('loading-container');
        this.emptyState = document.getElementById('empty-state');
        this.pinnedNoticesGrid = document.getElementById('pinned-notices-grid');
        this.recentNoticesGrid = document.getElementById('recent-notices-grid');
        this.archiveNoticesList = document.getElementById('archive-notices-list');
        this.noticeModal = document.getElementById('notice-detail-modal');

        // Search and filters
        this.searchInput = document.getElementById('notice-search');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sort-select');
        this.resetFilterBtn = document.querySelector('.btn-reset-filters');

        // Pagination
        this.currentPageEl = document.getElementById('current-page');
        this.totalPagesEl = document.getElementById('total-pages');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');

        // State
        this.notices = [];
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.currentPage = 1;
        this.noticesPerPage = 6;
        this.searchQuery = '';
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();

        // Show loading state
        this.showLoading();

        // Fetch and display notices
        this.fetchNotices()
            .then(() => {
                this.renderNotices();
                this.hideLoading();
            })
            .catch(error => {
                console.error('Error initializing notices:', error);
                this.hideLoading();
                this.showError('Failed to load notices. Please try again later.');
            });
    }

    setupEventListeners() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentFilter = button.dataset.filter;
                this.currentPage = 1; // Reset to first page when filtering
                this.renderNotices();
            });
        });

        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.currentSort = this.sortSelect.value;
                this.renderNotices();
            });
        }

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce(() => {
                this.searchQuery = this.searchInput.value.toLowerCase();
                this.currentPage = 1; // Reset to first page when searching
                this.renderNotices();
            }, 300));
        }

        // Reset filters button
        if (this.resetFilterBtn) {
            this.resetFilterBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Pagination buttons
        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderNotices();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => {
                const filteredNotices = this.filterNotices();
                const totalPages = Math.ceil(filteredNotices.filter(notice => !notice.pinned).length / this.noticesPerPage);

                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderNotices();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        // Modal close buttons
        const closeModalButtons = document.querySelectorAll('.close-modal');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeNoticeDetail();
            });
        });

        // Download button in modal
        const downloadBtn = document.getElementById('modal-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const title = document.getElementById('modal-title').textContent;
                alert(`Downloading PDF for: ${title}\n\nIn a real implementation, this would generate and download a PDF of the notice.`);
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.noticeModal) {
                this.closeNoticeDetail();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.noticeModal.classList.contains('active')) {
                this.closeNoticeDetail();
            }
        });
    }

    async fetchNotices() {
        await new Promise(resolve => setTimeout(resolve, 1500));

        this.notices = [
            {
                id: 1,
                title: "Scheduled Water Supply Interruption",
                content: `<p>Dear residents,</p>
                <p>We regret to inform you that there will be a temporary interruption in the water supply on <strong>October 25, 2023</strong> from <strong>9:00 AM to 2:00 PM</strong> due to essential maintenance work on the main distribution line.</p>
                <p>The following areas will be affected:</p>
                <ul>
                    <li>North Village Zone</li>
                    <li>Central Market Area</li>
                    <li>Eastern Residential Blocks</li>
                </ul>
                <p>We recommend storing sufficient water for your needs during this period. Our maintenance team will work diligently to complete the repairs as quickly as possible.</p>
                <p>We apologize for any inconvenience caused and thank you for your understanding and cooperation.</p>
                <p>For emergency assistance during this period, please contact our helpline at 1800-425-0124.</p>`,
                preview: "There will be a temporary interruption in the water supply on October 25, 2023 from 9:00 AM to 2:00 PM due to essential maintenance work.",
                date: "2023-10-20T10:30:00",
                category: "maintenance",
                priority: "high",
                pinned: true,
                attachments: [
                    {
                        name: "Maintenance_Schedule.pdf",
                        size: "1.2 MB",
                        type: "pdf"
                    }
                ]
            },
            {
                id: 2,
                title: "Water Quality Test Results - October 2023",
                content: `<p>Dear community members,</p>
                <p>We are pleased to share the results of the recent water quality tests conducted in our village. The tests were performed by the State Water Testing Laboratory on October 10, 2023.</p>
                <p>The analysis shows that our water quality meets all safety standards established by the National Water Quality Guidelines. Here are the key parameters:</p>
                <ul>
                    <li>pH Level: 7.2 (Normal range: 6.5-8.5)</li>
                    <li>Total Dissolved Solids: 320 mg/L (Standard: <500 mg/L)</li>
                    <li>Turbidity: 0.8 NTU (Standard: <5 NTU)</li>
                    <li>Residual Chlorine: 0.5 mg/L (Standard: 0.2-1.0 mg/L)</li>
                    <li>Bacterial Count: 0 CFU/100mL (Standard: 0 CFU/100mL)</li>
                </ul>
                <p>The detailed report is available for viewing at the Gram Panchayat office during regular hours or can be downloaded from the attachment below.</p>
                <p>We remain committed to providing safe and clean drinking water to all residents.</p>`,
                preview: "The water quality tests conducted on October 10, 2023 show that our water meets all safety standards established by the National Water Quality Guidelines.",
                date: "2023-10-15T14:15:00",
                category: "announcement",
                priority: "medium",
                pinned: true,
                attachments: [
                    {
                        name: "Water_Quality_Report_Oct2023.pdf",
                        size: "2.8 MB",
                        type: "pdf"
                    },
                    {
                        name: "Testing_Methodology.xlsx",
                        size: "875 KB",
                        type: "excel"
                    }
                ]
            },
            {
                id: 3,
                title: "New Water Connection Application Process Update",
                content: `<p>Dear residents,</p>
                <p>We are pleased to announce that the process for applying for new water connections has been simplified. Starting from November 1, 2023, all applications can be submitted online through our portal or in person at the Water Department office.</p>
                <p>The updated process includes:</p>
                <ul>
                    <li>Reduced documentation requirements</li>
                    <li>Faster approval time (within 7 working days)</li>
                    <li>Online status tracking</li>
                    <li>Digital payment options</li>
                </ul>
                <p>Required documents:</p>
                <ul>
                    <li>Property ownership proof or rental agreement</li>
                    <li>Identity proof (Aadhaar/PAN/Voter ID)</li>
                    <li>Recent property tax receipt</li>
                    <li>Site plan showing proposed connection point</li>
                </ul>
                <p>Application fees remain unchanged at ₹1,500 for residential connections and ₹3,000 for commercial properties.</p>
                <p>For assistance with the application process, please visit our help desk at the Panchayat office on weekdays between 10:00 AM and 4:00 PM.</p>`,
                preview: "Starting from November 1, 2023, the process for applying for new water connections has been simplified with online applications and faster approvals.",
                date: "2023-10-12T09:45:00",
                category: "announcement",
                priority: "medium",
                pinned: false,
                attachments: [
                    {
                        name: "Connection_Application_Form.pdf",
                        size: "450 KB",
                        type: "pdf"
                    }
                ]
            },
            {
                id: 4,
                title: "⚠️ Boil Water Advisory: Eastern Sector",
                content: `<p><strong>IMPORTANT NOTICE: BOIL WATER ADVISORY</strong></p>
                <p>The Water Department is issuing a precautionary boil water advisory for residents in the Eastern Sector due to a water main break that occurred earlier today.</p>
                <p>Affected areas include:</p>
                <ul>
                    <li>All residences east of Main Road</li>
                    <li>The Primary School zone</li>
                    <li>Eastern Agricultural Area</li>
                </ul>
                <p>Until further notice, residents in these areas should:</p>
                <ul>
                    <li>Boil all water used for drinking, cooking, brushing teeth, or washing dishes for at least one minute</li>
                    <li>Discard ice made from tap water</li>
                    <li>Use boiled or bottled water for preparing infant formula</li>
                </ul>
                <p>Repairs are underway and water samples are being tested. We expect to resolve this issue within 48 hours and will notify residents as soon as the water is confirmed safe to consume without boiling.</p>
                <p>For urgent queries, please contact our emergency helpline: 1800-425-0124</p>`,
                preview: "A precautionary boil water advisory has been issued for residents in the Eastern Sector due to a water main break.",
                date: "2023-10-10T16:20:00",
                category: "alert",
                priority: "high",
                pinned: true,
                attachments: []
            },
            {
                id: 5,
                title: "Water Conservation Tips for Summer",
                content: `<p>Dear community members,</p>
                <p>As we approach the summer months, we'd like to share some important water conservation tips to help ensure a stable water supply for everyone in our village.</p>
                <p><strong>Indoor Water Conservation:</strong></p>
                <ul>
                    <li>Fix leaking taps and pipes promptly - a dripping tap can waste over 3,000 liters per year</li>
                    <li>Install water-efficient fixtures such as low-flow showerheads and dual-flush toilets</li>
                    <li>Turn off taps while brushing teeth or shaving</li>
                    <li>Run washing machines and dishwashers only when full</li>
                    <li>Reuse RO waste water for cleaning floors or watering plants</li>
                </ul>
                <p><strong>Outdoor Water Conservation:</strong></p>
                <ul>
                    <li>Water plants during early morning or evening to reduce evaporation</li>
                    <li>Use a bucket instead of a hose for washing vehicles</li>
                    <li>Install drip irrigation systems for gardens</li>
                    <li>Harvest rainwater for gardening use</li>
                    <li>Sweep driveways and paths rather than hosing them down</li>
                </ul>
                <p>Our water resources are precious. By implementing these simple measures, each household can save thousands of liters of water each month.</p>
                <p>Thank you for your cooperation in conserving water for our community's future.</p>`,
                preview: "Learn important water conservation tips for the upcoming summer months to help ensure a stable water supply for everyone in our village.",
                date: "2023-10-08T11:30:00",
                category: "general",
                priority: "low",
                pinned: false,
                attachments: [
                    {
                        name: "Water_Conservation_Guide.pdf",
                        size: "1.5 MB",
                        type: "pdf"
                    }
                ]
            },
            {
                id: 6,
                title: "Monthly Water Billing Schedule Change",
                content: `<p>Dear water consumers,</p>
                <p>This is to inform you that the monthly water billing schedule will change starting from November 2023.</p>
                <p><strong>New Billing Schedule:</strong></p>
                <ul>
                    <li>Bills will be generated on the 5th of each month (previously 1st)</li>
                    <li>Due date for payment will be the 20th of each month (previously 15th)</li>
                    <li>Late payment charges will apply after the 25th of each month</li>
                </ul>
                <p><strong>Payment Options:</strong></p>
                <ul>
                    <li>Online payment through our web portal or mobile app</li>
                    <li>UPI payment (scan QR code on bill)</li>
                    <li>Cash/check at the Water Department office</li>
                    <li>Authorized collection centers in the village</li>
                </ul>
                <p>Please update your payment reminders accordingly to avoid any late fees. For any questions regarding billing, please contact our customer service at water.billing@gramdhara.gov.in or call 0123-4567890 during office hours.</p>
                <p>Thank you for your attention to this matter.</p>`,
                preview: "Starting from November 2023, the monthly water billing schedule will change. Bills will be generated on the 5th of each month with payment due by the 20th.",
                date: "2023-10-05T13:45:00",
                category: "announcement",
                priority: "medium",
                pinned: false,
                attachments: []
            },
            {
                id: 7,
                title: "Annual Maintenance of Village Water Tank",
                content: `<p>Dear residents,</p>
                <p>The Water Department will be conducting the annual maintenance and cleaning of the main village water tank as per the following schedule:</p>
                <p><strong>Maintenance Details:</strong></p>
                <ul>
                    <li><strong>Date:</strong> October 30-31, 2023</li>
                    <li><strong>Time:</strong> 8:00 AM to 6:00 PM both days</li>
                    <li><strong>Activities:</strong> Cleaning, disinfection, structural inspection, and minor repairs</li>
                </ul>
                <p><strong>Impact on Water Supply:</strong></p>
                <p>During the maintenance period, water supply will be provided through tankers at the following locations:</p>
                <ul>
                    <li>Village Square (8:00 AM, 12:00 PM, 4:00 PM)</li>
                    <li>Primary School Grounds (9:00 AM, 1:00 PM, 5:00 PM)</li>
                    <li>Eastern Colony Park (10:00 AM, 2:00 PM, 6:00 PM)</li>
                </ul>
                <p>Please bring your own clean containers for collecting water. Priority will be given to elderly residents and families with infants.</p>
                <p>We apologize for any inconvenience this necessary maintenance may cause and appreciate your cooperation.</p>`,
                preview: "The annual maintenance and cleaning of the main village water tank will be conducted on October 30-31, 2023. Water supply will be provided through tankers during this period.",
                date: "2023-10-02T10:00:00",
                category: "maintenance",
                priority: "medium",
                pinned: false,
                attachments: [
                    {
                        name: "Maintenance_Schedule.pdf",
                        size: "820 KB",
                        type: "pdf"
                    },
                    {
                        name: "Tanker_Locations_Map.jpg",
                        size: "1.1 MB",
                        type: "image"
                    }
                ]
            },
            {
                id: 8,
                title: "New Water Tariff Rates for 2023-24",
                content: `<p>Dear consumers,</p>
                <p>The Gram Panchayat, in consultation with the District Water Authority, has approved the revised water tariff structure for the financial year 2023-24. The new rates will be effective from November 1, 2023.</p>
                <p><strong>Revised Residential Rates:</strong></p>
                <ul>
                    <li>0-5,000 liters: ₹5.00 per 1,000 liters (previously ₹4.50)</li>
                    <li>5,001-10,000 liters: ₹8.00 per 1,000 liters (previously ₹7.00)</li>
                    <li>Above 10,000 liters: ₹12.00 per 1,000 liters (previously ₹10.00)</li>
                </ul>
                <p><strong>Revised Commercial Rates:</strong></p>
                <ul>
                    <li>0-10,000 liters: ₹15.00 per 1,000 liters (previously ₹12.00)</li>
                    <li>Above 10,000 liters: ₹20.00 per 1,000 liters (previously ₹18.00)</li>
                </ul>
                <p><strong>Monthly Fixed Charges:</strong></p>
                <ul>
                    <li>Residential connections: ₹50 (unchanged)</li>
                    <li>Commercial connections: ₹150 (previously ₹120)</li>
                </ul>
                <p>The modest increase in tariffs is necessary to cover rising operational costs, infrastructure maintenance, and to fund planned improvements to the water distribution system.</p>
                <p>Subsidized rates continue to be available for BPL cardholders and senior citizens. To apply for subsidies, please visit the Water Department with relevant documentation.</p>`,
                preview: "Revised water tariff rates for 2023-24 will be effective from November 1, 2023. The modest increase is necessary to cover operational costs and infrastructure maintenance.",
                date: "2023-09-28T15:30:00",
                category: "announcement",
                priority: "high",
                pinned: false,
                attachments: [
                    {
                        name: "Detailed_Tariff_Structure.pdf",
                        size: "650 KB",
                        type: "pdf"
                    }
                ]
            },
            {
                id: 9,
                title: "Water Testing Camp - Free for All Residents",
                content: `<p>Dear community members,</p>
                <p>We are organizing a free water testing camp for all village residents in collaboration with the District Health Department and Rural Water Supply Mission.</p>
                <p><strong>Camp Details:</strong></p>
                <ul>
                    <li><strong>Date:</strong> October 15-16, 2023</li>
                    <li><strong>Time:</strong> 9:00 AM to 5:00 PM</li>
                    <li><strong>Venue:</strong> Community Hall, Village Center</li>
                </ul>
                <p><strong>Services Provided:</strong></p>
                <ul>
                    <li>Basic water quality testing (pH, TDS, hardness, chlorine levels)</li>
                    <li>Bacterial contamination screening</li>
                    <li>Individual reports with recommendations</li>
                    <li>Consultation with water quality experts</li>
                    <li>Information on household water treatment options</li>
                </ul>
                <p><strong>How to Participate:</strong></p>
                <p>Bring a 500ml water sample in a clean plastic bottle collected from your tap or primary drinking water source. For best results:</p>
                <ul>
                    <li>Use a thoroughly cleaned bottle (preferably new)</li>
                    <li>Collect water in the morning of the day you visit the camp</li>
                    <li>Keep the bottle sealed until testing</li>
                </ul>
                <p>No prior registration is required, and all services are completely free of charge. We encourage all households to take advantage of this opportunity to ensure your drinking water is safe.</p>`,
                preview: "A free water testing camp for all village residents will be held on October 15-16, 2023 at the Community Hall. Bring a 500ml water sample for testing.",
                date: "2023-09-25T09:10:00",
                category: "general",
                priority: "medium",
                pinned: false,
                attachments: [
                    {
                        name: "Water_Testing_Flyer.pdf",
                        size: "580 KB",
                        type: "pdf"
                    }
                ]
            },
            {
                id: 10,
                title: "⚠️ Water Contamination Alert: Western Zone",
                content: `<p><strong>URGENT NOTICE: DO NOT CONSUME TAP WATER IN WESTERN ZONE</strong></p>
                <p>The Water Department has received reports of possible water contamination in the Western Zone of the village. Initial tests indicate the presence of coliform bacteria exceeding safety limits.</p>
                <p><strong>Affected Areas:</strong></p>
                <ul>
                    <li>All areas west of the Main Canal</li>
                    <li>Western Market vicinity</li>
                    <li>New Housing Colony</li>
                </ul>
                <p><strong>Immediate Precautions:</strong></p>
                <ul>
                    <li>DO NOT drink tap water or use it for cooking</li>
                    <li>DO NOT use tap water for brushing teeth or washing food</li>
                    <li>Boiling water is NOT sufficient to eliminate all potential contaminants</li>
                </ul>
                <p><strong>Safe Water Sources:</strong></p>
                <p>Clean drinking water will be provided through water tankers at the following locations starting immediately:</p>
                <ul>
                    <li>Western Zone Community Center (every 3 hours)</li>
                    <li>New Housing Colony Entrance (every 4 hours)</li>
                    <li>Western Market Square (every 3 hours)</li>
                </ul>
                <p>Our team is actively investigating the source of contamination and working to resolve the issue. We expect to restore safe water supply within 48-72 hours.</p>
                <p>For medical concerns related to water consumption, please contact the Health Center immediately at 0123-7890123.</p>
                <p>Updates will be provided every 6 hours through SMS alerts and announcements. Please share this information with neighbors, especially elderly residents.</p>`,
                preview: "URGENT: Possible water contamination detected in the Western Zone. DO NOT consume tap water. Safe drinking water is being provided through tankers.",
                date: "2023-09-20T17:15:00",
                category: "alert",
                priority: "high",
                pinned: false,
                attachments: [
                    {
                        name: "Affected_Areas_Map.jpg",
                        size: "950 KB",
                        type: "image"
                    },
                    {
                        name: "Safety_Guidelines.pdf",
                        size: "420 KB",
                        type: "pdf"
                    }
                ]
            }
        ];
    }

    filterNotices() {
        let result = [...this.notices];

        // Apply category filter
        if (this.currentFilter !== 'all') {
            result = result.filter(notice => notice.category === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(notice =>
                notice.title.toLowerCase().includes(query) ||
                notice.preview.toLowerCase().includes(query) ||
                notice.content.toLowerCase().includes(query) ||
                notice.category.toLowerCase().includes(query)
            );
        }

        // Apply sort
        result = this.sortNotices(result);

        return result;
    }

    sortNotices(notices) {
        return [...notices].sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'priority-desc':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, undefined: 0 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'priority-asc':
                    const priorityOrderAsc = { 'high': 3, 'medium': 2, 'low': 1, undefined: 0 };
                    return priorityOrderAsc[a.priority] - priorityOrderAsc[b.priority];
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    }

    renderNotices() {
        // Clear containers
        this.pinnedNoticesGrid.innerHTML = '';
        this.recentNoticesGrid.innerHTML = '';
        this.archiveNoticesList.innerHTML = '';

        // Filter and sort notices
        const filteredNotices = this.filterNotices();

        // Get pinned notices
        const pinnedNotices = filteredNotices.filter(notice => notice.pinned);

        // Get recent and archived notices
        const unpinnedNotices = filteredNotices.filter(notice => !notice.pinned);
        const startIndex = (this.currentPage - 1) * this.noticesPerPage;
        const endIndex = startIndex + this.noticesPerPage;
        const recentNotices = unpinnedNotices.slice(startIndex, endIndex);
        const archivedNotices = unpinnedNotices.slice(endIndex, endIndex + 5); // Show 5 archived notices

        // Update pagination
        this.updatePagination(unpinnedNotices.length);

        // Render pinned notices
        if (pinnedNotices.length > 0) {
            pinnedNotices.forEach(notice => {
                this.pinnedNoticesGrid.appendChild(this.createNoticeCard(notice));
            });
            document.querySelector('.pinned-notices').style.display = 'block';
        } else {
            document.querySelector('.pinned-notices').style.display = 'none';
        }

        // Render recent notices
        if (recentNotices.length > 0) {
            recentNotices.forEach(notice => {
                this.recentNoticesGrid.appendChild(this.createNoticeCard(notice));
            });
            document.querySelector('.recent-notices').style.display = 'block';
        } else {
            document.querySelector('.recent-notices').style.display = 'none';
        }

        // Render archived notices
        if (archivedNotices.length > 0) {
            archivedNotices.forEach(notice => {
                this.archiveNoticesList.appendChild(this.createNoticeListItem(notice));
            });
            document.querySelector('.notice-archive').style.display = 'block';
        } else {
            document.querySelector('.notice-archive').style.display = 'none';
        }

        // Show empty state if no notices are found
        if (filteredNotices.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
        }
    }

    createNoticeCard(notice) {
        const card = document.createElement('div');
        card.className = 'notice-card';
        card.dataset.noticeId = notice.id;

        // Priority indicator
        if (notice.priority) {
            const priorityElement = document.createElement('div');
            priorityElement.className = `notice-priority priority-${notice.priority}`;
            card.appendChild(priorityElement);
        }

        // Card header
        const header = document.createElement('div');
        header.className = 'notice-header';

        const title = document.createElement('h3');
        title.className = 'notice-title';
        title.textContent = notice.title;
        title.addEventListener('click', () => this.openNoticeDetail(notice));

        header.appendChild(title);

        if (notice.pinned) {
            const pin = document.createElement('i');
            pin.className = 'bi bi-pin-angle-fill notice-pin';
            header.appendChild(pin);
        }

        card.appendChild(header);

        // Card body
        const body = document.createElement('div');
        body.className = 'notice-body';

        const preview = document.createElement('div');
        preview.className = 'notice-preview';
        preview.textContent = notice.preview;
        body.appendChild(preview);

        card.appendChild(body);

        // Card footer
        const footer = document.createElement('div');
        footer.className = 'notice-footer';

        const date = document.createElement('div');
        date.className = 'notice-date';
        date.innerHTML = `<i class="bi bi-calendar3"></i> ${this.formatDate(notice.date)}`;

        const category = document.createElement('div');
        category.className = `notice-category category-${notice.category}`;
        category.textContent = notice.category;

        footer.appendChild(date);
        footer.appendChild(category);

        card.appendChild(footer);

        // Click event to open notice detail
        card.addEventListener('click', () => {
            this.openNoticeDetail(notice);
        });

        return card;
    }

    createNoticeListItem(notice) {
        const item = document.createElement('div');
        item.className = 'notice-list-item';
        item.dataset.noticeId = notice.id;

        // Category icon
        const iconClass = this.getCategoryIcon(notice.category);
        const icon = document.createElement('i');
        icon.className = `${iconClass} notice-list-icon`;

        // Content
        const content = document.createElement('div');
        content.className = 'notice-list-content';

        const title = document.createElement('h4');
        title.className = 'notice-list-title';
        title.textContent = notice.title;

        const meta = document.createElement('div');
        meta.className = 'notice-list-meta';
        meta.innerHTML = `
            <span><i class="bi bi-calendar3"></i> ${this.formatDate(notice.date)}</span>
            <span><i class="bi bi-tag"></i> ${notice.category}</span>
        `;

        content.appendChild(title);
        content.appendChild(meta);

        item.appendChild(icon);
        item.appendChild(content);

        // Click event to open notice detail
        item.addEventListener('click', () => {
            this.openNoticeDetail(notice);
        });

        return item;
    }

    getCategoryIcon(category) {
        switch (category) {
            case 'announcement': return 'bi bi-megaphone';
            case 'alert': return 'bi bi-exclamation-triangle';
            case 'maintenance': return 'bi bi-tools';
            case 'general': return 'bi bi-info-circle';
            default: return 'bi bi-chat-text';
        }
    }

    openNoticeDetail(notice) {
        // Set modal content
        document.getElementById('modal-title').textContent = notice.title;
        document.getElementById('modal-date').innerHTML = `<i class="bi bi-calendar3"></i> ${this.formatDate(notice.date)}`;
        document.getElementById('modal-category').className = `notice-category category-${notice.category}`;
        document.getElementById('modal-category').textContent = notice.category;

        // Set priority
        const modalPriority = document.getElementById('modal-priority');
        if (notice.priority) {
            modalPriority.style.display = '';
            modalPriority.className = '';
            modalPriority.classList.add('notice-category', `category-${notice.priority === 'high' ? 'alert' : notice.priority === 'medium' ? 'maintenance' : 'general'}`);

            switch (notice.priority) {
                case 'high':
                    modalPriority.innerHTML = '<i class="bi bi-exclamation-triangle"></i> High Priority';
                    break;
                case 'medium':
                    modalPriority.innerHTML = '<i class="bi bi-dash-circle"></i> Medium Priority';
                    break;
                case 'low':
                    modalPriority.innerHTML = '<i class="bi bi-info-circle"></i> Low Priority';
                    break;
            }
        } else {
            modalPriority.style.display = 'none';
        }

        // Set content
        document.getElementById('modal-content').innerHTML = notice.content;

        // Set attachments
        const attachmentsContainer = document.getElementById('modal-attachments');
        attachmentsContainer.innerHTML = '';

        if (notice.attachments && notice.attachments.length > 0) {
            const attachmentsTitle = document.createElement('h3');
            attachmentsTitle.textContent = 'Attachments';
            attachmentsContainer.appendChild(attachmentsTitle);

            notice.attachments.forEach(attachment => {
                const item = document.createElement('div');
                item.className = 'attachment-item';

                // Icon based on file type
                let iconClass = 'bi bi-file-earmark';
                if (attachment.type === 'pdf') iconClass = 'bi bi-file-earmark-pdf';
                else if (attachment.type === 'excel') iconClass = 'bi bi-file-earmark-excel';
                else if (attachment.type === 'image') iconClass = 'bi bi-file-earmark-image';

                item.innerHTML = `
                    <i class="${iconClass} attachment-icon"></i>
                    <span class="attachment-name">${attachment.name}</span>
                    <span class="attachment-size">${attachment.size}</span>
                    <button class="attachment-download" title="Download"><i class="bi bi-download"></i></button>
                `;

                // Add download handler
                const downloadBtn = item.querySelector('.attachment-download');
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    alert(`Downloading: ${attachment.name}`);
                });

                attachmentsContainer.appendChild(item);
            });

            attachmentsContainer.style.display = 'block';
        } else {
            attachmentsContainer.style.display = 'none';
        }

        // Show modal
        this.noticeModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    closeNoticeDetail() {
        this.noticeModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    updatePagination(totalItems) {
        const totalPages = Math.max(1, Math.ceil(totalItems / this.noticesPerPage));

        this.currentPageEl.textContent = this.currentPage;
        this.totalPagesEl.textContent = totalPages;

        // Update button states
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= totalPages;
    }

    formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', options);
    }

    resetFilters() {
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.currentPage = 1;
        this.searchQuery = '';

        // Reset UI
        this.searchInput.value = '';
        this.sortSelect.value = 'date-desc';
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });

        this.renderNotices();
        this.hideEmptyState();
    }

    showLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'none';
        }
    }

    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
    }

    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }

    showError(message) {
        alert(message); // Simple error handling for now
    }
}

// Utility function for debouncing input events
function debounce(func, delay = 300) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Load user information
async function updateUserInformation() {
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

async function updateNotificationCount() {
    try {
        if (!window.notificationsAPI) {
            console.error("Notifications API is not available.");
            return;
        }

        const response = await window.notificationsAPI.getMyNotifications();
        if (response && response.success && Array.isArray(response.data)) {
            // Assuming your API returns an array of notification objects
            const unreadCount = response.data.filter(notif => !notif.isRead).length;

            if (notificationBadgeEl) {
                if (unreadCount > 0) {
                    notificationBadgeEl.textContent = unreadCount;
                    notificationBadgeEl.style.display = 'flex';
                } else {
                    notificationBadgeEl.style.display = 'none';
                }
            }
        } else {
            if (notificationBadgeEl) {
                notificationBadgeEl.style.display = 'none'; // Hide if no data
            }
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

// DOM Elements
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const notificationBadgeEl = document.getElementById('notification-badge');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await updateUserInformation();
    await updateNotificationCount();
});