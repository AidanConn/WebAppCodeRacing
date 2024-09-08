import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import './WelcomePage.css';


const WelcomePage = () => {
    const [username, setUsername] = useState('');
    const [haveUsername, setHaveUsername] = useState(false);
    const [serverIP, setServerIP] = useState('');
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [lobbies, setLobbies] = useState({ player1: false, player2: false, spectator: false });
    const navigate = useNavigate();

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleServerIPChange = (event) => {
        setServerIP(event.target.value);
    };

    // Connect to the socket server
    const connectToServer = () => {
        const newSocket = io(`http://${serverIP}:4000`);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnected(true);

        });

        newSocket.on('lobbyStatus', (status) => {
            setLobbies(status);
        });

        newSocket.on('connectedUsers', (users) => {
            setConnectedUsers(users);
          });
    };

    // handle lobby selection
    const handleJoinLobby = (role) => {
        if (connected) {
          socket.emit('joinLobby', { username, role });
          navigate('/app');
        }
      };

    const handleUsernameSubmit = () => {
        if (username !== '') {
            setHaveUsername(true);
            socket.emit('addUser', username);
        }
    };

      // Effect to manage socket connection
    useEffect(() => {
    if (socket) {
      socket.on('disconnect', () => {
        setConnected(false);
        setHaveUsername(false);
        setLobbies({ player1: false, player2: false, spectator: false });
        setConnectedUsers([]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [socket]);

  // use effect to constantly update connected users
    useEffect(() => {
        if (socket) {
        socket.on('connectedUsers', (users) => {
            setConnectedUsers(users);
        });
    
        return () => {
            socket.off('connectedUsers');
        };
        }
    }, [socket]);


  return (
    <div className="welcome-page">
      {!connected ? (
        <div className="input-container">
          <h1>Enter Server IP</h1>
          <input
            type="text"
            value={serverIP}
            onChange={handleServerIPChange}
            placeholder="Server IP Address"
          />
          <button onClick={connectToServer}>Connect</button>
        </div>
      ) : !haveUsername ? (
        <div>
          <h1>Welcome to Code Racer</h1>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
          />
          <button onClick={handleUsernameSubmit}>Submit Username</button>
        </div>
      ) : (
        <div>
          <h1>Welcome, {username}</h1>
          <div className="lobbies">
            <button onClick={() => handleJoinLobby('player1')} disabled={lobbies.player1}>
              Join as Player 1
            </button>
            <button onClick={() => handleJoinLobby('player2')} disabled={lobbies.player2}>
              Join as Player 2
            </button>
            <button onClick={() => handleJoinLobby('spectator')}>Join as Spectator</button>
          </div>
          <div className="connected-users">
            <h2>Connected Users</h2>
            <ul>
              {connectedUsers.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
