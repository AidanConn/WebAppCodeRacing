const http = require('http');
const { Server } = require('socket.io');

// Create an HTTP server
const httpServer = http.createServer();

// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow requests from your frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }
});

// Store connected users
const connectedUsers = new Map();
const lobbies = { player1: false, player2: false, spectator: false };

const broadcastConnectedUsers = () => {
    io.emit('connectedUsers', Array.from(connectedUsers.values()));
};

// Handle socket connection
io.on('connection', (socket) => {
    // Handle connection event
    console.log('a user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // handle user events
  // ----------------------------------------------------
  // Handle user joining
  socket.on('addUser', (username) => {
    connectedUsers.set(socket.id, username);
    broadcastConnectedUsers();
    console.log(`User ${username} connected with socket ID ${socket.id}`);
    socket.emit('lobbyStatus', lobbies);
  });

    // Handle user leaving
    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        connectedUsers.delete(socket.id);
        broadcastConnectedUsers();
        console.log(`User ${username || 'unknown'} disconnected with socket ID ${socket.id}`);
      });
    
      // Handle joining lobby
    socket.on('joinLobby', ({ username, role }) => {
        if (connectedUsers.get(socket.id) === username) {
        if (role in lobbies) {
            lobbies[role] = true;
            io.emit('lobbyStatus', lobbies);
            console.log(`User ${username} joined as ${role}`);
        }
        }
    });

  // handle code update event
  socket.on('codeUpdate', (code) => {
    socket.broadcast.emit('recieveCodeUpdate', code);
    console.log('Code updated:', code);
  });

  socket.on('finish', (code) => {
    // Handle finish event
    console.log('Code submitted:', code);
  });
});

// Start the server on port 4000
httpServer.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});