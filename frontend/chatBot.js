document.addEventListener('DOMContentLoaded', function () {
    // Get chat elements
    const chatWidget = document.getElementById("chat-widget");
    const chatToggle = document.getElementById("chat-toggle");
    const closeChat = document.getElementById("close-chat");
    const chatBody = document.getElementById("chat-body");

    if (!chatWidget || !chatToggle || !closeChat || !chatBody) {
        console.error("Chat elements not found");
        return;
    }

    // Toggle chatbox visibility with animation
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.remove("translate-y-full", "opacity-0", "invisible");
        chatWidget.style.transform = 'translateY(0)';
        chatWidget.style.opacity = '1';

        // Clear chat history and start fresh
        chatBody.innerHTML = "";
        setTimeout(() => botWelcome(), 300);
    });

    closeChat.addEventListener('click', () => {
        chatWidget.style.transform = 'translateY(100%)';
        chatWidget.style.opacity = '0';

        setTimeout(() => {
            chatWidget.classList.add("invisible");
        }, 300);
    });

    // Bot welcome message
    function botWelcome() {
        addMessage("Hello! I'm your Water Management Assistant. How can I help you today?", "bot");
        addOptions([
            "Report Water Issue",
            "Water Quality Testing",
            "Maintenance Schedule",
            "Emergency Contacts"
        ]);
    }

    // Add a message to the chat
    function addMessage(text, sender) {
        const messageContainer = document.createElement("div");
        messageContainer.className = `mb-4 ${sender === 'user' ? 'text-right' : ''}`;

        const messageContent = document.createElement("div");
        messageContent.className = sender === 'user'
            ? "inline-block bg-primary-500 text-white p-3 rounded-lg max-w-[80%]"
            : "inline-block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-[80%]";

        // Replace newline characters with <br> tags
        messageContent.innerHTML = text.replace(/\n/g, '<br>');

        // Add typing animation for bot messages
        if (sender === 'bot') {
            messageContent.style.animation = 'fadeIn 0.5s';
        }

        messageContainer.appendChild(messageContent);
        chatBody.appendChild(messageContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Add option buttons
    function addOptions(options) {
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "flex flex-wrap gap-2 mt-4 mb-4";

        options.forEach(option => {
            const btn = document.createElement("button");
            btn.className = "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-3 py-2 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors whitespace-nowrap";
            btn.textContent = option;
            btn.onclick = () => handleUserSelection(option);
            optionsContainer.appendChild(btn);
        });

        chatBody.appendChild(optionsContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Handle user selections
    function handleUserSelection(selection) {
        // Show user's selection
        addMessage(selection, "user");

        // Simulate typing delay
        showTypingIndicator();

        // Process response after a short delay
        setTimeout(() => {
            removeTypingIndicator();
            processUserSelection(selection);
        }, 1000);
    }

    // Process user selection and provide appropriate response
    function processUserSelection(selection) {
        let response = "";
        let followUpOptions = [];

        switch (selection) {
            case "Report Water Issue":
                response = "To report a water issue, please provide the following details:\n\n" +
                    "1. Location of the issue\n" +
                    "2. Type of issue (leakage, contamination, etc.)\n" +
                    "3. How long has this been a problem?\n\n" +
                    "You can also upload photos of the issue when submitting your report.";
                followUpOptions = ["Submit a Report", "View Reporting Guidelines", "Back to Menu"];
                break;

            case "Water Quality Testing":
                response = "Our water quality testing kits can detect:\n\n" +
                    "• Bacterial contamination\n" +
                    "• Chemical impurities\n" +
                    "• pH levels\n" +
                    "• Turbidity\n\n" +
                    "The results are digitally recorded and available in real-time.";
                followUpOptions = ["Request Testing Kit", "View Testing Schedule", "Back to Menu"];
                break;

            case "Maintenance Schedule":
                response = "Regular maintenance is essential for your water infrastructure. Here's a recommended schedule:\n\n" +
                    "• Weekly: Check for leaks, inspect valves\n" +
                    "• Monthly: Clean filters, test water quality\n" +
                    "• Quarterly: Service pumps, clear pipelines\n" +
                    "• Yearly: Complete system overhaul";
                followUpOptions = ["Schedule Maintenance", "View Maintenance History", "Back to Menu"];
                break;

            case "Emergency Contacts":
                response = "💧 <strong>Water Helpline:</strong> 1916\n" +
                    "🚑 <strong>Hospital:</strong> 108\n" +
                    "🔥 <strong>Disaster:</strong> 1070\n" +
                    "👮 <strong>Police:</strong> 100";
                followUpOptions = ["Contact Support Team", "Report Emergency Now", "Back to Menu"];
                break;

            case "Submit a Report":
                response = "You can submit your report through our online form at www.gramdhara.gov.in/report or use the 'Report Water Issue' button on the homepage.";
                followUpOptions = ["Back to Menu"];
                break;

            case "Back to Menu":
                botWelcome();
                return;

            default:
                response = "I'm still learning about that topic. Would you like to talk to a human representative?";
                followUpOptions = ["Contact Support Team", "Back to Menu"];
        }

        addMessage(response, "bot");
        addOptions(followUpOptions);
    }

    // Add typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement("div");
        typingIndicator.id = "typing-indicator";
        typingIndicator.className = "flex space-x-1 p-2 mb-4";

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("div");
            dot.className = "w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce";
            dot.style.animationDelay = `${i * 0.15}s`;
            typingIndicator.appendChild(dot);
        }

        chatBody.appendChild(typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // Text input functionality
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");

    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const userMessage = chatInput.value.trim();

            if (userMessage) {
                // Display user message
                addMessage(userMessage, "user");
                chatInput.value = "";

                // Show typing indicator
                showTypingIndicator();

                // Process custom input
                setTimeout(() => {
                    removeTypingIndicator();
                    handleCustomInput(userMessage);
                }, 1000);
            }
        });
    }

    // Handle custom user input
    function handleCustomInput(message) {
        message = message.toLowerCase();
        let response = "";

        if (message.includes("water") && (message.includes("issue") || message.includes("problem"))) {
            response = "I understand you're having a water issue. Could you please provide more details about the problem?";
            addMessage(response, "bot");
            addOptions(["Report Water Issue", "Contact Support Team", "Back to Menu"]);
        }
        else if (message.includes("quality") || message.includes("testing")) {
            response = "Water quality is our priority! Our testing kits can help you ensure your water is safe for consumption.";
            addMessage(response, "bot");
            addOptions(["Water Quality Testing", "Back to Menu"]);
        }
        else if (message.includes("maintenance") || message.includes("repair")) {
            response = "Regular maintenance ensures your water system runs efficiently. Would you like to know more about maintenance schedules?";
            addMessage(response, "bot");
            addOptions(["Maintenance Schedule", "Back to Menu"]);
        }
        else if (message.includes("emergency") || message.includes("help") || message.includes("urgent")) {
            response = "For emergencies, please contact our emergency helpline immediately.";
            addMessage(response, "bot");
            addOptions(["Emergency Contacts", "Back to Menu"]);
        }
        else {
            response = "I'm not sure I understand your question. Could you please choose from one of these options?";
            addMessage(response, "bot");
            addOptions(["Report Water Issue", "Water Quality Testing", "Maintenance Schedule", "Emergency Contacts"]);
        }
    }
});
