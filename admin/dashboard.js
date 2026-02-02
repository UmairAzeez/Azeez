
// Admin Dashboard - Chat System
const CHAT_API = {
    getMessages: window.API_CONFIG?.endpoints?.getMessages || '/.netlify/functions/get-messages',
    reply: window.API_CONFIG?.endpoints?.reply || '/.netlify/functions/reply'
};

// Global state
let sessions = {};
let currentSessionId = null;
let pollInterval = null;
let authToken = localStorage.getItem('adminToken');

// Immediate redirect if no token
if (!authToken && !window.location.pathname.includes('index.html')) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard Initializing...');

    // Attach logout immediately
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logging out...');
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        });
    }

    initDashboard();
});

function initDashboard() {
    // Elements
    const sessionListEl = document.getElementById('session-list');
    const refreshIndicator = document.getElementById('refresh-indicator');
    const activeChatContainer = document.getElementById('active-chat-container');
    const noChatSelected = document.getElementById('no-chat-selected');

    // Chat Elements
    const activeChatName = document.getElementById('active-chat-name');
    const activeChatId = document.getElementById('active-chat-id');
    const chatMessagesEl = document.getElementById('admin-chat-messages');
    const replyForm = document.getElementById('admin-reply-form');
    const replyInput = document.getElementById('admin-reply-input');

    if (!sessionListEl || !activeChatContainer) {
        console.error('Core dashboard elements missing!');
        return;
    }

    // Start Polling
    fetchData(); // Initial load
    pollInterval = setInterval(fetchData, 5000);

    async function fetchData() {
        if (refreshIndicator) refreshIndicator.classList.add('active');

        try {
            console.log('Fetching messages...');
            const response = await fetch(CHAT_API.getMessages, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 401) {
                console.warn('Unauthorized. Redirecting to login.');
                localStorage.removeItem('adminToken');
                window.location.href = 'index.html';
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server returned ${response.status}`);
            }

            const allMessages = await response.json();
            console.log(`Received ${allMessages.length} messages.`);
            processMessages(allMessages);

            if (refreshIndicator) {
                refreshIndicator.textContent = 'Updated';
                setTimeout(() => refreshIndicator.classList.remove('active'), 500);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            if (refreshIndicator) {
                refreshIndicator.textContent = 'Error';
                refreshIndicator.classList.add('active');
            }
        }
    }

    function processMessages(messages) {
        const newSessions = {};

        messages.forEach(msg => {
            if (!msg.session_id) return;

            if (!newSessions[msg.session_id]) {
                newSessions[msg.session_id] = {
                    id: msg.session_id,
                    name: 'Anonymous', // Default
                    messages: [],
                    lastMessage: null,
                    unreadCount: 0
                };
            }

            const session = newSessions[msg.session_id];
            session.messages.push(msg);

            // Use the name from the most recent user message if available
            if (msg.sender_type === 'user') {
                session.name = msg.name || 'Anonymous';
                if (!msg.is_read) session.unreadCount++;
            }
        });

        // Current session check
        Object.values(newSessions).forEach(session => {
            session.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            session.lastMessage = session.messages[session.messages.length - 1];
        });

        sessions = newSessions;
        renderSessionList();

        if (currentSessionId && sessions[currentSessionId]) {
            renderChat(currentSessionId, true);
        }
    }

    function renderSessionList() {
        const sessionArray = Object.values(sessions).sort((a, b) => {
            const timeA = new Date(a.lastMessage?.created_at || 0);
            const timeB = new Date(b.lastMessage?.created_at || 0);
            return timeB - timeA;
        });

        if (sessionArray.length === 0) {
            sessionListEl.innerHTML = '<div class="loading">No active chats</div>';
            return;
        }

        const html = sessionArray.map(session => {
            const isActive = session.id === currentSessionId ? 'active' : '';
            const isUnread = session.unreadCount > 0 ? 'unread' : '';
            const unreadBadge = session.unreadCount > 0 ? `<span class="badge">${session.unreadCount}</span>` : '';
            const time = new Date(session.lastMessage?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const preview = session.lastMessage?.content || '(No message content)';
            const prefix = session.lastMessage?.sender_type === 'admin' ? 'You: ' : '';

            return `
                <div class="session-item ${isActive} ${isUnread}" onclick="selectSession('${session.id}')">
                    <span class="session-time">${time}</span>
                    <span class="session-name">${escapeHtml(session.name)} ${unreadBadge}</span>
                    <div class="session-preview">${prefix}${escapeHtml(preview)}</div>
                </div>
            `;
        }).join('');

        sessionListEl.innerHTML = html;
    }

    window.selectSession = (sessionId) => {
        console.log(`Selected session: ${sessionId}`);
        currentSessionId = sessionId;
        renderSessionList();
        renderChat(sessionId);
    };

    function renderChat(sessionId, isUpdate = false) {
        const session = sessions[sessionId];
        if (!session) return;

        noChatSelected.style.display = 'none';
        activeChatContainer.style.display = 'flex';

        activeChatName.textContent = session.name;
        activeChatId.textContent = sessionId;

        const wasAtBottom = chatMessagesEl.scrollHeight - chatMessagesEl.scrollTop <= chatMessagesEl.clientHeight + 10;

        const html = session.messages.map(msg => {
            const type = msg.sender_type || 'user';
            const time = new Date(msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

            return `
                <div class="chat-msg-row ${type}">
                    <div class="chat-bubble ${type}">
                        ${escapeHtml(msg.content)}
                    </div>
                    <span class="chat-time">${time}</span>
                </div>
            `;
        }).join('');

        chatMessagesEl.innerHTML = html;

        if (!isUpdate || wasAtBottom) {
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        }
    }

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reply = replyInput.value.trim();
        if (!reply || !currentSessionId) return;

        replyInput.disabled = true;
        try {
            const response = await fetch(CHAT_API.reply, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    session_id: currentSessionId,
                    reply: reply
                })
            });

            if (!response.ok) throw new Error('Reply failed');

            replyInput.value = '';
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to send reply');
        } finally {
            replyInput.disabled = false;
            replyInput.focus();
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
