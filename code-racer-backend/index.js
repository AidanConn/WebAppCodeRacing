const http = require('http');
const { Server } = require('socket.io');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// DOCKER COMMANDS
// ----------------------------------------------------
function checkDockerImageExists(imageName) {
  return new Promise((resolve, reject) => {
    exec(`docker images -q ${imageName}`, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout.trim() !== '');
    });
  });
}

function buildDockerImage(imageName, dockerfilePath) {
  return new Promise((resolve, reject) => {
    exec(`docker build -t ${imageName} -f ${dockerfilePath} .`, (error) => {
      console.log(`Building Docker image ${imageName}...`);
      console.log(`Error: ${error}`);
      if (error) return reject(error);
      resolve();
    });
  });
}

async function compileAndRunCode(language, code) {
  const imageName = `code-racer-${language}`;
  const dockerfilePath = `./dockerfiles/Dockerfile.${language}`;

  // Path to existing problem files
  const problem = getCurrentProblem();
  let templateCode = fs.readFileSync(`${__dirname}/problems/${language}/${problem.fileName}`, 'utf8');
  templateCode = templateCode.replace("// User needs to implement this method", code);

  // Write the code to a temporary file with a unique name
  const tempFileName = `temp${Date.now()}.java`;
  const classname = problem.fileName.split('.')[0];
  const fileLocation = `${__dirname}/problems/${language}/Temp/${tempFileName.split('.')[0]}`
  templateCode = templateCode.replace(classname, tempFileName.split('.')[0]);
  fs.mkdirSync(fileLocation, { recursive: true });
  const tempFilePath = path.join(fileLocation, tempFileName);
  fs.writeFileSync(tempFilePath, templateCode);


  if (!(await checkDockerImageExists(imageName))) {
    await buildDockerImage(imageName, dockerfilePath);
  }

  return new Promise((resolve, reject) => {
    const containerCommand = `docker run -v ${fileLocation}:/usr/src/app -w /usr/src/app ${imageName}`;

    exec(containerCommand, (error, stdout, stderr) => {
      console.log(`Executing code in Docker container...`);
      console.log(`Error: ${error}`);
      console.log(`Stdout: ${stdout}`);
      console.log(`Stderr: ${stderr}`);
      
      if (error) return reject(stderr);
      resolve(stdout);
    });
  });
}

// PROBLEM SETUP
// ----------------------------------------------------
const currentProblemID = 1;
const problemsFile = require('./problems/problems.json');

// Fetch current problem
function getCurrentProblem() {
  return problemsFile.problems.find((problem) => problem.id === currentProblemID);
}

// Fetch next problem, if overflow, wrap back to 1
function getNextProblem() {
  currentProblemID = currentProblemID % problems.length + 1;
  return getCurrentProblem();
}


// SERVER SETUP
// ----------------------------------------------------
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

// GLOBAL VARIABLES
const connectedUsers = new Map();
const lobbies = { player1: false, player2: false };
let codeStates = {};

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

  // Handle problem request event
  socket.on('requestProblem', (data, callback) => {
    const { username } = data;
    const problem = getCurrentProblem();
    codeStates[username] = problem.template;
    callback(problem);
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

// Handle code update event
socket.on('codeUpdate', ({ username, code }) => {
  // Update the code state for the given user
  codeStates[username] = code;

  // Search through connectedUsers for the role of the user
  const user = connectedUsers.get(socket.id);

  if (user) {
    const { role } = user;

    // Broadcast code update to the opponent and spectators, including the role
    socket.broadcast.emit('receiveCodeUpdate', { username, role, code });
    console.log(`${username}-${role} code: ${code}`);
  } else {
    console.log(`User ${username} not found in connectedUsers map.`);
  }
});

  socket.on('requestCodeState', ({ username }) => {
    // You may want to determine which user is the opponent
    const opponentUsername = getOpponentUsername(username); // Custom function
    const opponentCode = codeStates[opponentUsername] || '';

    // Emit the current code state to the user
    socket.emit('initialCodeState', {
      userCode: codeStates[username] || '',
      opponentCode
    });
  });

  socket.on('finish', (code) => {
    // Handle finish event
    console.log('Code submitted:', code);
  });

  // Handle code execution event
  socket.on('executeCode', async ({ language, code }, callback) => {
    console.log(`Executing code for language ${language}`);
    try {
      const result = await compileAndRunCode(language, code);
      callback({ success: true, result });
    } catch (error) {
      callback({ success: false, error });
    }
  });

});

// Start the server on port 4000
httpServer.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});

// Helper function to find the opponent (adjust logic as needed)
function getOpponentUsername(username) {
  const users = Object.keys(codeStates);
  return users.find((user) => user !== username);
}
