
document.addEventListener('DOMContentLoaded', () => {
    initChatWidget();
});

const API_CONFIG = {
    sendMessage: '/.netlify/functions/messages',
    getChat: '/.netlify/functions/get-chat'
};

function initChatWidget() {
    // Inject HTML
    const widgetHTML = `
        <div id="chat-widget" class="chat-widget-container">
            <!-- Chat Window -->
            <div id="chat-window" class="chat-window">
                <div class="chat-header">
                    <div class="chat-title">
                        <div class="chat-status-indicator"></div>
                        <span>Live Chat</span>
                    </div>
                    <button id="chat-close-btn" class="chat-close-btn">&times;</button>
                </div>
                
                <!-- Start Screen -->
                <div id="chat-start-screen" class="chat-start-screen">
                    <div class="chat-start-title">Hey there! 👋</div>
                    <p class="chat-start-desc">Enter your name to start chatting with me.</p>
                    
                    <form id="chat-start-form" style="width: 100%;">
                        <div class="form-group">
                            <input type="text" id="chat-name-input" class="form-input" placeholder="Your Name" required maxlength="100">
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Start Chat</button>
                    </form>
                </div>

                <!-- Messages Area -->
                <div id="chat-messages" class="chat-messages">
                    <!-- Messages will appear here -->
                </div>

                <!-- Input Area -->
                <div class="chat-input-area">
                    <input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." disabled>
                    <button id="chat-send-btn" class="chat-send-btn" disabled>
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>

            <!-- Toggle Button -->
            <button id="chat-toggle-btn" class="chat-toggle-btn">
                <div id="chat-badge" class="chat-notification-badge">!</div>
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Elements
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close-btn');
    const startScreen = document.getElementById('chat-start-screen');
    const startForm = document.getElementById('chat-start-form');
    const messagesContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const badge = document.getElementById('chat-badge');

    // State
    let isOpen = false;
    let sessionId = localStorage.getItem('chat_session_id');
    let userName = localStorage.getItem('chat_user_name');
    let pollInterval = null;

    // Initialize state
    if (sessionId && userName) {
        startScreen.classList.add('hidden');
        enableChat();
        pollMessages();
        toggleBtn.classList.add('visible'); // Show if already chatted
    }

    // Toggle Chat
    toggleBtn.addEventListener('click', (e) => {
        // Prevent click if we just finished dragging (momentum handled below)
        if (Math.abs(vx) > 1 || Math.abs(vy) > 1) return;

        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen) {
            badge.classList.remove('active');
            if (sessionId) scrollToBottom();
        }
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        chatWindow.classList.remove('open');
    });

    // Start Chat
    startForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('chat-name-input').value.trim();
        if (!name) return;

        // Generate Session ID (simple UUID-like)
        sessionId = crypto.randomUUID();
        userName = name;

        // Save
        localStorage.setItem('chat_session_id', sessionId);
        localStorage.setItem('chat_user_name', userName);

        // UI
        startScreen.classList.add('hidden');
        enableChat();

        // Send initial greeting (optional, or just wait for user input)
        // Actually, let's just let the user type.
    });

    // Send Message
    async function sendMessage() {
        const content = input.value.trim();
        if (!content) return;

        // Optimistic UI
        appendMessage(content, 'user');
        input.value = '';
        scrollToBottom();

        try {
            const response = await fetch(API_CONFIG.sendMessage, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    name: userName,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error(error);
            appendMessage('Failed to send message', 'error');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Poll Messages
    function pollMessages() {
        if (pollInterval) clearInterval(pollInterval);

        fetchChatHistory(); // Initial fetch

        pollInterval = setInterval(fetchChatHistory, 5000); // Poll every 5s
    }

    async function fetchChatHistory() {
        if (!sessionId) return;

        try {
            const response = await fetch(`${API_CONFIG.getChat}?session_id=${sessionId}`);
            if (!response.ok) return;

            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Polling error:', error);
        }
    }

    function renderMessages(messages) {
        // Simple diffing: if count changed, re-render all (inefficient but safe for MVP)
        // Better: Check ID of last message.

        const currentCount = messagesContainer.querySelectorAll('.chat-message').length;
        if (messages.length === currentCount) return;

        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(msg.content, msg.sender_type || 'user', msg.created_at);
        });

        scrollToBottom();

        // Notification if closed
        if (!isOpen && messages.length > currentCount) {
            // Only if last message is manager
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender_type === 'manager') {
                badge.classList.add('active');
            }
        }
    }

    function appendMessage(text, type, timeStr) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        div.textContent = text;

        if (timeStr) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'message-time';
            const date = new Date(timeStr);
            timeSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            div.appendChild(timeSpan);
        }

        messagesContainer.appendChild(div);
    }

    function enableChat() {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // PHYSICS & MOMENTUM DRAG
    let isDragging = false;
    let x = 0, y = 0; // Current translation
    let vx = 0, vy = 0; // Velocity
    let lastX = 0, lastY = 0;
    let friction = 0.95; // Friction multiplier
    let bounce = 0.6; // Bounce elasticity
    let padding = 20; // Padding from window edges

    const widgetContainer = document.getElementById('chat-widget');

    function update() {
        if (!isDragging) {
            // Apply friction
            vx *= friction;
            vy *= friction;

            // Apply velocity
            x += vx;
            y += vy;

            // Boundary Checks & Bouncing
            const rect = toggleBtn.getBoundingClientRect();

            if (rect.left < padding) {
                x += padding - rect.left;
                vx *= -bounce;
            } else if (rect.right > window.innerWidth - padding) {
                x -= rect.right - (window.innerWidth - padding);
                vx *= -bounce;
            }

            if (rect.top < padding) {
                y += padding - rect.top;
                vy *= -bounce;
            } else if (rect.bottom > window.innerHeight - padding) {
                y -= rect.bottom - (window.innerHeight - padding);
                vy *= -bounce;
            }

            // Stop when velocity is near zero
            if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
                vx = 0;
                vy = 0;
            } else {
                setTranslate(x, y, widgetContainer);
            }
        }
        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    function dragStart(e) {
        isDragging = true;
        const event = e.type === 'touchstart' ? e.touches[0] : e;
        lastX = event.clientX;
        lastY = event.clientY;
        vx = 0;
        vy = 0;

        // Prevent window scrolling while dragging on mobile
        if (e.type === 'touchstart') e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const event = e.type === 'touchmove' ? e.touches[0] : e;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        x += dx;
        y += dy;

        vx = dx; // Simple velocity tracking
        vy = dy;

        lastX = event.clientX;
        lastY = event.clientY;

        setTranslate(x, y, widgetContainer);
    }

    function dragEnd() {
        isDragging = false;
    }

    toggleBtn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    toggleBtn.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // EXPOSED METHODS
    window.openChat = () => {
        // Refresh session state in case it was set by contact.js
        sessionId = localStorage.getItem('chat_session_id');
        userName = localStorage.getItem('chat_user_name');

        if (sessionId && userName) {
            startScreen.classList.add('hidden');
            enableChat();
            pollMessages(); // Trigger immediate fetch
        }

        isOpen = true;
        chatWindow.classList.add('open');
        toggleBtn.classList.add('visible');

        if (sessionId) {
            scrollToBottom();
            fetchChatHistory(); // One-off immediate fetch
        } else {
            const nameInput = document.getElementById('chat-name-input');
            if (nameInput) nameInput.focus();
        }
    };

    window.showChatButton = () => {
        // Just in case we need to sync session state when form is submitted
        sessionId = localStorage.getItem('chat_session_id');
        userName = localStorage.getItem('chat_user_name');

        if (sessionId && userName) {
            startScreen.classList.add('hidden');
            enableChat();
        }

        toggleBtn.classList.add('visible');
    };
}
