const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
    console.log('New connection');

    socket.on('join', (username, callback) => {
        try {
            // Validation
            if (!username || username.trim() === '') {
                return callback('Username is required');
            }

            if (Object.values(users).includes(username)) {
                return callback('Username is already taken');
            }

            // Register user
            users[socket.id] = username;
            socket.username = username;

            // Notifications
            socket.emit('message', {
                id: uuidv4(),
                username: 'System',
                text: `Welcome to the chat, ${username}!`,
                timestamp: new Date().toISOString(),
                type: 'system'
            });

            socket.broadcast.emit('message', {
                id: uuidv4(),
                username: 'System',
                text: `${username} has joined the chat`,
                timestamp: new Date().toISOString(),
                type: 'system'
            });

            io.emit('users', Object.values(users));
            callback(null); // Success
        } catch (err) {
            console.error('Join error:', err);
            callback('Server error');
        }
    });

    socket.on('sendMessage', (message) => {
        if (!message || !socket.username) return;

        const msgObj = {
            id: uuidv4(),
            username: socket.username,
            text: message,
            timestamp: new Date().toISOString(),
            type: 'user'
        };

        io.emit('message', msgObj);
    });

    socket.on('typing', () => {
        if (socket.username) {
            socket.broadcast.emit('typing', socket.username);
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete users[socket.id];
            io.emit('message', {
                id: uuidv4(),
                username: 'System',
                text: `${socket.username} has left the chat`,
                timestamp: new Date().toISOString(),
                type: 'system'
            });
            io.emit('users', Object.values(users));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));







// const express = require('express');
// const socketio = require('socket.io');
// const http = require('http');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Store connected users
// const users = {};

// // Socket.io connection
// io.on('connection', (socket) => {
//     console.log('New user connected');

//     // Handle new user joining
//     socket.on('join', (username) => {
//         if (!username || username.trim() === '') {
//             socket.emit('error', 'Username is required');
//             return;
//         }

//         // Check if username is already taken
//         if (Object.values(users).includes(username)) {
//             socket.emit('error', 'Username is already taken');
//             return;
//         }

//         users[socket.id] = username;
//         socket.emit('message', {
//             id: uuidv4(),
//             username: 'System',
//             text: `Welcome to the chat, ${username}!`,
//             timestamp: new Date().toISOString(),
//             type: 'system'
//         });

//         // Broadcast to all other users
//         socket.broadcast.emit('message', {
//             id: uuidv4(),
//             username: 'System',
//             text: `${username} has joined the chat`,
//             timestamp: new Date().toISOString(),
//             type: 'system'
//         });

//         // Send list of online users
//         io.emit('users', Object.values(users));
//     });

//     // Handle incoming messages
//     socket.on('sendMessage', (message) => {
//         if (!message || message.trim() === '') return;

//         const msgObj = {
//             id: uuidv4(),
//             username: users[socket.id],
//             text: message,
//             timestamp: new Date().toISOString(),
//             type: 'user'
//         };

//         io.emit('message', msgObj);
//     });

//     // Handle typing indicator
//     socket.on('typing', () => {
//         socket.broadcast.emit('typing', users[socket.id]);
//     });

//     // Handle disconnect
//     socket.on('disconnect', () => {
//         const username = users[socket.id];
//         if (username) {
//             delete users[socket.id];
//             io.emit('message', {
//                 id: uuidv4(),
//                 username: 'System',
//                 text: `${username} has left the chat`,
//                 timestamp: new Date().toISOString(),
//                 type: 'system'
//             });
//             io.emit('users', Object.values(users));
//         }
//     });

//     // Error handling
//     socket.on('error', (error) => {
//         console.error('Socket error:', error);
//     });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled rejection:', err);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//     console.error('Uncaught exception:', err);
// });