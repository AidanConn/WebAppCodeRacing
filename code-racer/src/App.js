import React, {useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import WelcomePage from './WelcomePage';
import MainApp from './MainApp'; // Your main app component

const App = () => {
  const [socket, setSocket] = useState(null);

  const connectToServer = (serverIP) => {
    return new Promise((resolve, reject) => {
      const newSocket = io(`http://${serverIP}:4000`);
  
      newSocket.on('connect', () => {
        setSocket(newSocket); // Set the socket in state
        resolve(newSocket);   // Resolve the promise when connected
        console.log('Connected to server');
      });
  
      newSocket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        reject(error);        // Reject if there's a connection error
      });
    });
  };

  return(
  <Routes>
    <Route path="/" element={<WelcomePage socket={socket} connectToServer={connectToServer} />} />
    <Route path="/app" element={<MainApp socket={socket} />} />
  </Routes>
  );
};

export default App;
