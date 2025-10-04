// Add event listeners safely with error handling
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            
            // Store theme preference
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Chat toggle - Fixed implementation
    const chatToggle = document.getElementById('chat-toggle');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    
    if (chatToggle && chatWidget) {
        chatToggle.addEventListener('click', function() {
            // Remove transform and opacity classes first
            chatWidget.classList.remove('translate-y-full', 'opacity-0', 'invisible');
            // Force a browser reflow for the transition to work properly
            void chatWidget.offsetWidth;
            // Apply visible styling
            chatWidget.style.transform = 'translateY(0)';
            chatWidget.style.opacity = '1';
        });
    }

    if (closeChat && chatWidget) {
        closeChat.addEventListener('click', function() {
            // Apply hidden styling
            chatWidget.style.transform = 'translateY(100%)';
            chatWidget.style.opacity = '0';
            // Add invisible class after transition completes
            setTimeout(() => {
                chatWidget.classList.add('invisible');
            }, 300);
        });
    }

    // Simple chat functionality 
    if (chatWidget) {
        chatWidget.addEventListener('click', function() {
            const chatBody = document.getElementById('chat-body');
            if (chatBody && chatBody.children.length === 0) {
                // Add initial message
                const botMessage = document.createElement('div');
                botMessage.className = 'mb-3';
                botMessage.innerHTML = `
                    <div class="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg inline-block max-w-3/4">
                        <p class="text-gray-800 dark:text-gray-200">Hello! How can I assist you with water management today?</p>
                    </div>
                `;
                chatBody.appendChild(botMessage);

                // Add response options
                const options = document.createElement('div');
                options.className = 'mb-3 flex flex-wrap gap-2';
                options.innerHTML = `
                    <button class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Report a leak</button>
                    <button class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Water quality issues</button>
                    <button class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Contact support</button>
                `;
                chatBody.appendChild(options);
            }
        });
    }

    // Initialize map
    initializeMap();
});

// Initialize map function
function initializeMap() {
    if (typeof L !== 'undefined' && document.getElementById('map-container')) {
        try {
            // Create map
            const map = L.map('map-container').setView([22.5937, 78.9629], 5); // Center on India
            
            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Define custom icon for markers
            const waterIcon = L.divIcon({
                html: '<i class="bi bi-droplet-fill" style="font-size: 24px; color: #1e88e5;"></i>',
                className: 'water-marker-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -20]
            });

            // Add markers for each gram panchayat
            const gramPanchayats = [
                { name: 'Punsari', block: 'Talod', district: 'Sabarkantha', state: 'Gujarat', lat: 23.38, lng: 73.08 },
                { name: 'Hiware Bazar', block: 'Ahmednagar', district: 'Ahmednagar', state: 'Maharashtra', lat: 19.16, lng: 74.88 },
                { name: 'Odanthurai', block: 'Karamadai', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.26, lng: 76.88 },
                { name: 'Mawlynnong', block: 'Pynursla', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.19, lng: 91.91 },
                { name: 'Dharnai', block: 'Hulasganj', district: 'Jehanabad', state: 'Bihar', lat: 25.15, lng: 85.14 },
                { name: 'Lohawat', block: 'Lohawat', district: 'Jodhpur', state: 'Rajasthan', lat: 26.98, lng: 72.59 },
                { name: 'Mattur', block: 'Shivamogga', district: 'Shivamogga', state: 'Karnataka', lat: 13.93, lng: 75.54 },
                { name: 'Kumbalangi', block: 'Palluruthy', district: 'Ernakulam', state: 'Kerala', lat: 9.89, lng: 76.28 },
                { name: 'Ramchandrapur', block: 'Gaighata', district: 'North 24 Parganas', state: 'West Bengal', lat: 22.91, lng: 88.75 },
                { name: 'Chhapar', block: 'Sujangarh', district: 'Churu', state: 'Rajasthan', lat: 27.81, lng: 74.40 },
                { name: 'Kuthambakkam', block: 'Poonamallee', district: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.04, lng: 80.05 },
                { name: 'Piplantri', block: 'Rajsamand', district: 'Rajsamand', state: 'Rajasthan', lat: 25.07, lng: 73.81 },
                { name: 'Baghuwar', block: 'Amarpur', district: 'Dindori', state: 'Madhya Pradesh', lat: 22.99, lng: 81.01 },
                { name: 'Iglas', block: 'Iglas', district: 'Aligarh', state: 'Uttar Pradesh', lat: 27.71, lng: 77.93 },
                { name: 'Gangadevipalli', block: 'Geesugonda', district: 'Warangal', state: 'Telangana', lat: 18.06, lng: 79.67 },
                { name: 'Khonoma', block: 'Sechü Zubza', district: 'Kohima', state: 'Nagaland', lat: 25.66, lng: 94.00 },
                { name: 'Kokrebellur', block: 'Maddur', district: 'Mandya', state: 'Karnataka', lat: 12.55, lng: 77.10 },
                { name: 'Baladia', block: 'Bhuj', district: 'Kutch', state: 'Gujarat', lat: 23.21, lng: 69.83 },
                { name: 'Pothanikkad', block: 'Pothanikkad', district: 'Ernakulam', state: 'Kerala', lat: 10.03, lng: 76.69 },
                { name: 'Katwaria Sarai', block: 'Hauz Khas', district: 'South Delhi', state: 'Delhi', lat: 28.54, lng: 77.19 },
                { name: 'Achanakmar', block: 'Kota', district: 'Bilaspur', state: 'Chhattisgarh', lat: 22.56, lng: 81.85 },
                { name: 'Tikekarwadi', block: 'Karmala', district: 'Solapur', state: 'Maharashtra', lat: 18.36, lng: 75.20 },
                { name: 'Kanjirapally', block: 'Kanjirapally', district: 'Kottayam', state: 'Kerala', lat: 9.55, lng: 76.78 },
                { name: 'Digambarpur', block: 'Patharpratima', district: 'South 24 Parganas', state: 'West Bengal', lat: 21.78, lng: 88.35 },
                { name: 'Bhadana', block: 'Indri', district: 'Karnal', state: 'Haryana', lat: 29.83, lng: 77.08 },
                { name: 'Shani Shingnapur', block: 'Nevasa', district: 'Ahmednagar', state: 'Maharashtra', lat: 19.39, lng: 74.82 },
                { name: 'Nepura', block: 'Rajgir', district: 'Nalanda', state: 'Bihar', lat: 25.03, lng: 85.42 },
                { name: 'Majuli', block: 'Majuli', district: 'Majuli', state: 'Assam', lat: 26.91, lng: 94.19 },
                { name: 'Hodka', block: 'Banni Pachham', district: 'Kutch', state: 'Gujarat', lat: 23.70, lng: 69.82 },
                { name: 'Malana', block: 'Malana', district: 'Kullu', state: 'Himachal Pradesh', lat: 32.06, lng: 77.25 },
                { name: 'Adat', block: 'Puzhakkal', district: 'Thrissur', state: 'Kerala', lat: 10.56, lng: 76.15 },
                { name: 'Apshinge', block: 'Satara', district: 'Satara', state: 'Maharashtra', lat: 17.76, lng: 74.07 },
                { name: 'Cherrapunji', block: 'Shella Bholaganj', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.27, lng: 91.73 },
                { name: 'Dhanora', block: 'Dhanora', district: 'Gadchiroli', state: 'Maharashtra', lat: 20.32, lng: 80.20 },
                { name: 'Eraviperoor', block: 'Koipuram', district: 'Pathanamthitta', state: 'Kerala', lat: 9.36, lng: 76.62 },
                { name: 'Ghasera', block: 'Nuh', district: 'Nuh', state: 'Haryana', lat: 28.25, lng: 77.04 },
                { name: 'Hampi', block: 'Hospet', district: 'Vijayanagara', state: 'Karnataka', lat: 15.33, lng: 76.46 },
                { name: 'Kalap', block: 'Mori', district: 'Uttarkashi', state: 'Uttarakhand', lat: 31.02, lng: 78.11 },
                { name: 'Lakkundi', block: 'Gadag', district: 'Gadag', state: 'Karnataka', lat: 15.38, lng: 75.72 },
                { name: 'Mandwa', block: 'Alibag', district: 'Raigad', state: 'Maharashtra', lat: 18.86, lng: 72.92 }
            ];
            
            // Add all markers to the map
            gramPanchayats.forEach(gp => {
                L.marker([gp.lat, gp.lng], {icon: waterIcon})
                    .addTo(map)
                    .bindPopup(
                        `<strong>${gp.name}</strong><br>
                        Block: ${gp.block}<br>
                        District: ${gp.district}<br>
                        State: ${gp.state}`
                    );
            });

            // Handle dark mode for map tiles
            function updateMapTiles() {
                const isDarkMode = document.documentElement.classList.contains('dark');
                if (map) {
                    map.eachLayer(layer => {
                        if (layer instanceof L.TileLayer) {
                            map.removeLayer(layer);
                        }
                    });

                    if (isDarkMode) {
                        // Add dark mode tiles
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                            maxZoom: 19
                        }).addTo(map);
                    } else {
                        // Add light mode tiles
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19
                        }).addTo(map);
                    }
                }
            }

            // Initial map setup based on current theme
            updateMapTiles();

            // Update map when theme changes
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', function() {
                    // Allow time for the theme to change
                    setTimeout(updateMapTiles, 100);
                });
            }

            // Adjust map on window resize
            window.addEventListener('resize', function() {
                if (map) {
                    map.invalidateSize();
                }
            });
        } catch (e) {
            console.error("Error initializing map:", e);
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-xl"><p class="text-gray-500 dark:text-gray-300">Unable to load map. Please try again later.</p></div>';
            }
        }
    } else {
        console.warn("Leaflet library not loaded or map container not found");
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-xl"><p class="text-gray-500 dark:text-gray-300">Map loading failed. Please check your internet connection.</p></div>';
        }
    }
}