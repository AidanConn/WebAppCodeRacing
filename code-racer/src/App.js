// src/App.js

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CodeMirror from 'react-codemirror';

const socket = io('http://localhost:3001'); // Connect to the server

const App = () => {
  const [code, setCode] = useState('');
  const [canType, setCanType] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // When the code changes, emit the update to the other connected clients
  const hangleCodeChange = (value) => {
    if (canType){
      socket.emit('code-update', value);
    }
  };

  // Listen for code updates from the other user
  useEffect(() => {
    socket.on('receiveCodeUpdate', (newCode) => {
      setCode(newCode);
    });
  }, []);

  // Listen for the start signal from the server
  useEffect(() => {
    socket.on('start', () => {
      setCanType(true);
    });

    // Listen for the finish signal from the server
    socket.on('finish', () => {
      setCanType(false);
      setIsFinished(true);
    });
  }, []);

  // Listen for the reset signal from the server
  useEffect(() => {
    socket.on('reset', () => {
      setCanType(false);
      setIsFinished(false);
      setCode('');
    });
  }, []);

  return (
    <div>
      <h1>Code Racer</h1>
      <CodeMirror
        value={code}
        onChange={handleCodeChange}
        options={{
          theme: 'dracula',
          mode: 'java',
          lineNumbers: true,
          readOnly: !canType || isFinished,
        }}
      />
      <button onClick={handleStart} disabled={canType}>Start</button>
      <button onClick={handleFinish} disabled={!canType || isFinished}>Finish</button>
    </div>
  );
};

export default App;
