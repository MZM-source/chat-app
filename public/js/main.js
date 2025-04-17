document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const usernameModal = document.getElementById('username-modal');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    const usernameError = document.getElementById('username-error');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');
    const usersList = document.getElementById('users-list');
    const onlineCount = document.getElementById('online-count');
    const typingIndicator = document.getElementById('typing-indicator');

    // Show modal initially and focus on username input
    usernameModal.style.display = 'flex';
    usernameInput.focus();

    // Handle username submission
    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        
        if (!username) {
            usernameError.textContent = 'Username is required';
            return;
        }

        socket.emit('join', username, (error) => {
            if (error) {
                usernameError.textContent = error;
                return;
            }
            
            // Successfully joined - hide modal
            usernameModal.style.display = 'none';
            messageInput.focus();
        });
    });

    // Handle message submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message) {
            socket.emit('sendMessage', message);
            messageInput.value = '';
        }
    });

    // Handle typing indicator
    let typingTimeout;
    messageInput.addEventListener('input', () => {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingIndicator.textContent = '';
        }, 2000);
    });

    // Handle incoming messages
    socket.on('message', (message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (message.type === 'system') {
            messageElement.classList.add('message-system');
            messageElement.textContent = message.text;
        } else {
            const isCurrentUser = socket.username === message.username;
            // Changed class assignment for correct alignment
            messageElement.classList.add(isCurrentUser ? 'message-user' : 'message-other');
            
            messageElement.innerHTML = `
                <div class="message-text">${message.text}</div>
                <span class="message-time">${formatTime(message.timestamp)}</span>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    });

    // Handle online users list updates
    socket.on('users', (users) => {
        onlineCount.textContent = users.length;
        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <i class="fas fa-user"></i> ${user}
            </div>
        `).join('');
    });

    // Handle typing notifications
    socket.on('typing', (username) => {
        typingIndicator.textContent = `${username} is typing...`;
    });

    // Handle errors
    socket.on('error', (error) => {
        const errorElement = document.createElement('div');
        errorElement.classList.add('message', 'message-system');
        errorElement.textContent = error;
        messagesContainer.appendChild(errorElement);
        scrollToBottom();
    });

    // Helper function to format time
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Helper function to scroll to bottom of messages
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Clean up on page refresh/close
    window.addEventListener('beforeunload', () => {
        socket.emit('leave');
    });
});









// document.addEventListener('DOMContentLoaded', () => {
//     const socket = io();
//     const usernameModal = document.getElementById('username-modal');
//     const usernameForm = document.getElementById('username-form');
//     const usernameInput = document.getElementById('username-input');
//     const usernameError = document.getElementById('username-error');
//     const messageForm = document.getElementById('message-form');
//     const messageInput = document.getElementById('message-input');
//     const messagesContainer = document.getElementById('messages');
//     const usersList = document.getElementById('users-list');
//     const onlineCount = document.getElementById('online-count');
//     const typingIndicator = document.getElementById('typing-indicator');

//     // Show modal initially
//     usernameModal.style.display = 'flex';
//     usernameInput.focus();

//     // Username submission
//     usernameForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const username = usernameInput.value.trim();
        
//         if (!username) {
//             usernameError.textContent = 'Username is required';
//             return;
//         }

//         socket.emit('join', username, (error) => {
//             if (error) {
//                 usernameError.textContent = error;
//                 return;
//             }
            
//             // Successfully joined
//             usernameModal.style.display = 'none';
//             messageInput.focus();
//         });
//     });

//     // Message submission
//     messageForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const message = messageInput.value.trim();
        
//         if (message) {
//             socket.emit('sendMessage', message);
//             messageInput.value = '';
//         }
//     });

//     // Typing indicator
//     let typingTimeout;
//     messageInput.addEventListener('input', () => {
//         socket.emit('typing');
//         clearTimeout(typingTimeout);
//         typingTimeout = setTimeout(() => {
//             typingIndicator.textContent = '';
//         }, 2000);
//     });

//     // Socket events
//     socket.on('message', (message) => {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('message');
        
//         if (message.type === 'system') {
//             messageElement.classList.add('message-system');
//             messageElement.textContent = message.text;
//         } else {
//             const isCurrentUser = socket.username === message.username;
//             messageElement.classList.add(isCurrentUser ? 'message-user' : 'message-other');
            
//             messageElement.innerHTML = `
//                 <div class="message-text">${message.text}</div>
//                 <span class="message-time">${formatTime(message.timestamp)}</span>
//             `;
//         }
        
//         messagesContainer.appendChild(messageElement);
//         scrollToBottom();
//     });

//     socket.on('users', (users) => {
//         onlineCount.textContent = users.length;
//         usersList.innerHTML = users.map(user => `
//             <div class="user-item">
//                 <i class="fas fa-user"></i> ${user}
//             </div>
//         `).join('');
//     });

//     socket.on('typing', (username) => {
//         typingIndicator.textContent = `${username} is typing...`;
//     });

//     // Helper functions
//     function formatTime(timestamp) {
//         const date = new Date(timestamp);
//         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     }

//     function scrollToBottom() {
//         messagesContainer.scrollTop = messagesContainer.scrollHeight;
//     }
// });