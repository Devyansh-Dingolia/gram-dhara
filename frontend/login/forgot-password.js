document.addEventListener('DOMContentLoaded', function () {
    // This assumes you have an apiClient object available, for example:
    // import apiClient from './api-client.js';

    const resetFormContainer = document.getElementById('reset-form-container');
    const successContainer = document.getElementById('success-container');
    const submitButton = document.getElementById('submit-reset');
    const goBackButton = document.getElementById('go-back-btn');
    const countdownElement = document.getElementById('countdown');
    const emailInput = document.getElementById('reset-email');
    const errorMessage = document.getElementById('error-message'); // Assumes you have an element with this ID

    // Handle form submission
    submitButton.addEventListener('click', async function () {
        // Clear previous errors
        emailInput.classList.remove('border-red-500');
        if (errorMessage) errorMessage.classList.add('hidden');

        // Basic email validation
        if (!emailInput.value || !emailInput.value.includes('@')) {
            emailInput.classList.add('border-red-500');
            return;
        }

        // Show a loading state
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const data = { email: emailInput.value };
            console.log('Sending forgot password request for:', data);

            const response = await window.authAPI.forgotPassword(data);

            console.log('Forgot Password Response:', response);
            
            if (!response || !response.success) {
                throw new Error(response.message || 'Failed to send reset link');
            }

            resetFormContainer.classList.add('hidden');
            successContainer.classList.remove('hidden');
            startCountdown();

        } catch (error) {
            console.error('Forgot Password Error:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Failed to send reset link. Please check the email and try again.';
                errorMessage.classList.remove('hidden');
            } else {
                alert('An error occurred. Please try again.');
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Go back to login button
    goBackButton.addEventListener('click', function () {
        window.location.href = 'login.html';
    });

    // Countdown function
    function startCountdown() {
        let secondsLeft = 20;
        const countdownInterval = setInterval(function () {
            secondsLeft--;
            countdownElement.textContent = secondsLeft;
            if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                window.location.href = 'login.html';
            }
        }, 1000);
    }
});