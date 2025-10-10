document.addEventListener('DOMContentLoaded', function () {
    // Display current date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);

    //Profile
    const profileAvatar = document.getElementById('profile-avatar');
    const profileNameHeader = document.getElementById('profile-name-header');
    const profileRole = document.getElementById('profile-role');
    const profileNameInput = document.getElementById('profile-name');
    const profileUsernameInput = document.getElementById('profile-username');
    const profileEmailInput = document.getElementById('profile-email');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileUserIdInput = document.getElementById('profile-userid');

    // Password Change Modal
    const passwordModal = document.getElementById('password-modal');
    const successModal = document.getElementById('success-modal');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const submitPasswordBtn = document.getElementById('submit-password');
    const passwordForm = document.getElementById('password-change-form');
    const closeSuccessBtn = document.querySelector('.close-success-modal');

    // Password fields
    const oldPasswordInput = document.getElementById('old-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Password toggle buttons
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqMatch = document.getElementById('req-match');

    // Open password modal
    changePasswordBtn.addEventListener('click', function () {
        passwordModal.classList.add('active');
        // Reset form
        passwordForm.reset();
        resetRequirements();
        updateSubmitButton();
    });

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            passwordModal.classList.remove('active');
        });
    });

    closeSuccessBtn.addEventListener('click', function () {
        successModal.classList.remove('active');
    });

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.querySelector('i').classList.remove('bi-eye');
                this.querySelector('i').classList.add('bi-eye-slash');
            } else {
                targetInput.type = 'password';
                this.querySelector('i').classList.remove('bi-eye-slash');
                this.querySelector('i').classList.add('bi-eye');
            }
        });
    });

    // Check password requirements
    function checkPasswordRequirements() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check length
        if (newPassword.length >= 8) {
            reqLength.classList.add('valid');
            reqLength.querySelector('i').classList.remove('bi-x-circle');
            reqLength.querySelector('i').classList.add('bi-check-circle');
        } else {
            reqLength.classList.remove('valid');
            reqLength.querySelector('i').classList.remove('bi-check-circle');
            reqLength.querySelector('i').classList.add('bi-x-circle');
        }

        // Check uppercase
        if (/[A-Z]/.test(newPassword)) {
            reqUppercase.classList.add('valid');
            reqUppercase.querySelector('i').classList.remove('bi-x-circle');
            reqUppercase.querySelector('i').classList.add('bi-check-circle');
        } else {
            reqUppercase.classList.remove('valid');
            reqUppercase.querySelector('i').classList.remove('bi-check-circle');
            reqUppercase.querySelector('i').classList.add('bi-x-circle');
        }

        // Check lowercase
        if (/[a-z]/.test(newPassword)) {
            reqLowercase.classList.add('valid');
            reqLowercase.querySelector('i').classList.remove('bi-x-circle');
            reqLowercase.querySelector('i').classList.add('bi-check-circle');
        } else {
            reqLowercase.classList.remove('valid');
            reqLowercase.querySelector('i').classList.remove('bi-check-circle');
            reqLowercase.querySelector('i').classList.add('bi-x-circle');
        }

        // Check number
        if (/\d/.test(newPassword)) {
            reqNumber.classList.add('valid');
            reqNumber.querySelector('i').classList.remove('bi-x-circle');
            reqNumber.querySelector('i').classList.add('bi-check-circle');
        } else {
            reqNumber.classList.remove('valid');
            reqNumber.querySelector('i').classList.remove('bi-check-circle');
            reqNumber.querySelector('i').classList.add('bi-x-circle');
        }

        // Check passwords match
        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            reqMatch.classList.add('valid');
            reqMatch.querySelector('i').classList.remove('bi-x-circle');
            reqMatch.querySelector('i').classList.add('bi-check-circle');
        } else {
            reqMatch.classList.remove('valid');
            reqMatch.querySelector('i').classList.remove('bi-check-circle');
            reqMatch.querySelector('i').classList.add('bi-x-circle');
        }

        updateSubmitButton();
    }

    // Reset requirements
    function resetRequirements() {
        const requirements = [reqLength, reqUppercase, reqLowercase, reqNumber, reqMatch];
        requirements.forEach(req => {
            req.classList.remove('valid');
            req.querySelector('i').classList.remove('bi-check-circle');
            req.querySelector('i').classList.add('bi-x-circle');
        });
    }

    // Update submit button state
    function updateSubmitButton() {
        const allRequirementsMet =
            reqLength.classList.contains('valid') &&
            reqUppercase.classList.contains('valid') &&
            reqLowercase.classList.contains('valid') &&
            reqNumber.classList.contains('valid') &&
            reqMatch.classList.contains('valid') &&
            oldPasswordInput.value.trim() !== '';

        submitPasswordBtn.disabled = !allRequirementsMet;
    }

    // Input event listeners
    newPasswordInput.addEventListener('input', checkPasswordRequirements);
    confirmPasswordInput.addEventListener('input', checkPasswordRequirements);
    oldPasswordInput.addEventListener('input', updateSubmitButton);

    // Submit password change
    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const oldPassword = oldPasswordInput.value;
        const newPassword = newPasswordInput.value;

        const originalBtnText = submitPasswordBtn.textContent;

        try {
            // --- Show loading state ---
            submitPasswordBtn.disabled = true;
            submitPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';

            // --- Make the API call ---
            const response = await window.authAPI.changePassword({ oldPassword, newPassword });

            if (response && response.success) {
                // --- On success ---
                passwordModal.classList.remove('active');
                successModal.classList.add('active'); // Show success popup
            } else {
                // If the API returns a failure message (e.g., wrong old password)
                throw new Error(response?.message || 'Failed to change password');
            }
        } catch (error) {
            // --- On failure ---
            console.error("Error changing password:", error);
            showToast(error.message, 'error'); // Show an error message
        } finally {
            // --- This always runs, on success or failure ---
            submitPasswordBtn.disabled = false;
            submitPasswordBtn.textContent = originalBtnText;
            passwordForm.reset();
            resetRequirements();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === passwordModal) {
            passwordModal.classList.remove('active');
        }
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            passwordModal.classList.remove('active');
            successModal.classList.remove('active');
        }
    });

    // Load profile data
    loadProfileData();

    function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = getToastIcon(type);

        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span> <button class="toast-close">&times;</button>`;
        toastContainer.appendChild(toast);

        // Function to remove the toast
        const removeToast = () => {
            toast.classList.remove('show');
            // Wait for the animation to finish before removing from the DOM
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        };

        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', removeToast);

        // Add toast to the container
        toastContainer.appendChild(toast);

        // Trigger the "show" animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-remove after 5 seconds
        setTimeout(removeToast, 5000);
    }

    function getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    async function loadProfileData() {
        try {
            const response = await window.authAPI.getCurrentUser(); // Assuming you have this API call
            if (response && response.success) {
                const user = response.data;

                // Update the HTML elements with the fetched data
                profileAvatar.src = user.avatarUrl || '../../../images/avatar.png';
                profileNameHeader.textContent = user.name;
                profileRole.textContent = user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

                // Update the form input values
                profileNameInput.value = user.name;
                profileUsernameInput.value = user.username;
                profileEmailInput.value = user.email;
                profilePhoneInput.value = user.phoneNumber || '';
                profileUserIdInput.value = user.userId; // Or user._id
            }
        } catch (error) {
            console.error("Failed to load profile data:", error);
        }
    }
});
