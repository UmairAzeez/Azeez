// manager authentication
// API URL is now configured in config.js
const getApiUrl = () => window.API_CONFIG?.endpoints?.login || '/.netlify/functions/manager-login';

// Check if already logged in
if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('managerToken');
    if (!token) {
        window.location.href = 'index.html';
    }
} else if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    const token = localStorage.getItem('managerToken');
    if (token) {
        window.location.href = '/dashboard-access/dashboard.html';
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const feedback = document.getElementById('login-feedback');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showFeedback('Please fill in all fields', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        feedback.style.display = 'none';

        try {
            const response = await fetch(getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('managerToken', data.token);
                // Redirect to dashboard
                window.location.href = '/dashboard-access/dashboard.html';
            } else {
                showFeedback(data.error || 'Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showFeedback('Network error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    });

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.style.display = 'block';
    }
});

// Logout function
function logout() {
    localStorage.removeItem('managerToken');
    window.location.href = 'index.html';
}
