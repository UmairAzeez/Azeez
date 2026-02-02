// Contact form handler
const API_URL = '/.netlify/functions/messages'; // Netlify Functions endpoint

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = form.querySelector('.form-submit');
    const submitText = form.querySelector('.submit-text');
    const submitLoading = form.querySelector('.submit-loading');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();

        // Basic validation
        if (!name || !message) {
            showFeedback('Please fill in all fields', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        feedback.style.display = 'none';

        // Get session data or create if it doesn't exist
        let sessionId = localStorage.getItem('chat_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('chat_session_id', sessionId);
        }
        localStorage.setItem('chat_user_name', name);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    name: name,
                    content: message
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showFeedback('Message sent successfully! Open the chat widget to see live replies.', 'success');
                form.reset();
                // If chat widget exists, trigger a refresh
                if (window.showChatButton) {
                    window.showChatButton();
                }
                if (window.openChat) {
                    // Slight delay to let the message save
                    setTimeout(() => window.openChat(), 1000);
                }
            } else {
                // Handle specific errors
                if (response.status === 429) {
                    showFeedback('Too many messages sent. Please try again later.', 'error');
                } else if (data.errors) {
                    showFeedback(data.errors[0].msg || 'Please check your input', 'error');
                } else {
                    showFeedback(data.error || 'Failed to send message. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showFeedback('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    });

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    }
});
