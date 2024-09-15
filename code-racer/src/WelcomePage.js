import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = ({ socket, connectToServer }) => {
    const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
    const [haveUsername, setHaveUsername] = useState(!!username);
    const [serverIP, setServerIP] = useState(sessionStorage.getItem('serverIP') || '');
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

    // Connect to the socket server only if not already connected
    const handleConnect = async () => {
      if (!socket) {
        try{
          await connectToServer(serverIP);
          setConnected(true);
          sessionStorage.setItem('serverIP', serverIP);
        } catch (error){
          console.log('error connecting to server: ', error)
        }
      }
    };

    useEffect(() => {
      const connectAndEmit = async () => {
        if (!socket && haveUsername) {
          try {
            const newSocket = await connectToServer(serverIP); // Wait for the connection
            if (newSocket) {
              newSocket.emit('reconnectUser', { username, serverIP }); // Emit only after connection is established
            }
          } catch (error) {
            console.error('Error reconnecting user:', error);
          }
        }
      };
    
      connectAndEmit();
    }, [socket, haveUsername, serverIP, username]); // Add necessary dependencies
    

    useEffect(() => {
      if(socket){
        socket.on('connect', () => {
          setConnected(true);
        });

        if (username) {
          setConnected(true);
          socket.emit('reconnectUser', { username, serverIP});
          setHaveUsername(true);
        }

        socket.on('lobbyStatus', (status) => {
          setLobbies(status);
        });

        socket.on('connectedUsers', (users) => {
          setConnectedUsers(users);
          updateLobbyStatus(users)
        });

        return () => {
          socket.off('connect');
          socket.off('lobbyStatus');
          socket.off('connectedUsers');
        };
      }
    }, [socket]);

    // Function to update lobby status based on connected users
    const updateLobbyStatus = (users) => {
      const updatedLobbies = { player1: false, player2: false };

      users.forEach(user => {
        if (user.role === 'player1') updatedLobbies.player1 = true;
        if (user.role === 'player2') updatedLobbies.player2 = true;
      });

      setLobbies(updatedLobbies); // Update the lobby availability state
    };



    const handleJoinLobby = (role) => {
        if (connected) {
          socket.emit('joinLobby', { username, role });
          navigate('/app');
        }
      };

    const handleUsernameSubmit = () => {
        if (username !== '') {
            setHaveUsername(true);
            sessionStorage.setItem('username', username);
            socket.emit('addUser', { username, serverIP});
        }
    };

    useEffect(() => {
      if (socket) {
        socket.on('disconnect', () => {
          setConnected(false);
          setHaveUsername(false);
          setLobbies({ player1: false, player2: false, spectator: false });
          setConnectedUsers([]);
        });

        return () => {
          // Remove disconnect event listener here, but don't disconnect the socket
          socket.off('disconnect');
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
          <button onClick={handleConnect}>Connect</button>
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
                <li key={index}>
                    {user.username} - {user.role}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
