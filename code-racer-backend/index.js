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
const lobbies = { player1: false, player2: false };
var spectators = 0;
const player1code="";
const player2code="";

const broadcastConnectedUsers = () => {
    io.emit('connectedUsers', Array.from(connectedUsers.values()));
};

// Handle socket connection
io.on('connection', (socket) => {
    // Handle connection event
    console.log('a user connected:', socket.id);
  socket.on('disconnect', () => {
    const username = connectedUsers.get(socket.id);
        
        if (username){
          if (username.role && username.role in lobbies){
            lobbies[username.role] = false;
          }
        }
        connectedUsers.delete(socket.id);
        broadcastConnectedUsers();
        console.log(`User ${username || 'unknown'} disconnected with socket ID ${socket.id}`);
  });

  // handle user events
  // ----------------------------------------------------
  // Handle user joining
  socket.on('addUser', ({username, serverIP}) => {
    connectedUsers.set(socket.id, { username, role: 'Lobby', server: serverIP });
    broadcastConnectedUsers();
    console.log(`User ${username} connected with socket ID ${socket.id} to ${serverIP}`);
    socket.emit('lobbyStatus', lobbies);
  });

  // Handle reconnection
  socket.on('reconnectUser', ({ username, serverIP }) => {
    // Find if the username already exists
    for (const [id, user] of connectedUsers) {
      if (user.username === username && user.server === serverIP) {
        connectedUsers.delete(id);
      }
    }

    // Add the new user entry
    connectedUsers.set(socket.id, { username, role: 'Lobby', server: serverIP });
    console.log(`User ${username} reconnected with socket ID ${socket.id}`);
    socket.emit('lobbyStatus', lobbies);
    broadcastConnectedUsers();
});


    // Handle user leaving
    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        
        if (username){
          if (username.role && username.role in lobbies){
            lobbies[username.role] = false;
          }
        }
        connectedUsers.delete(socket.id);
        broadcastConnectedUsers();
        console.log(`User ${username || 'unknown'} disconnected with socket ID ${socket.id}`);
      });
    
    // Handle joining lobby
    socket.on('joinLobby', ({ username, role }) => {
      const user = connectedUsers.get(socket.id);

      if (user && user.username === username) {
        // Check if any user already occupies the requested role
        let roleTaken = false;
        connectedUsers.forEach((otherUser) => {
          if (otherUser.role === role) {
            roleTaken = true;
          }
        });

        // If the role is not taken and exists in the lobbies
        if (role in lobbies && !roleTaken) {
          lobbies[role] = true;
          console.log(`User ${username} joined as ${role}`);

          // Update user role
          user.role = role;
          connectedUsers.set(socket.id, user);

          // Broadcast updated lobby status and connected users list
          io.emit('lobbyStatus', lobbies);
          broadcastConnectedUsers();
        } else if (roleTaken) {
          console.log(`Role ${role} is already taken by another user.`);
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