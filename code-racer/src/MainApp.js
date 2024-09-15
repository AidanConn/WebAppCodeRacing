// src/App.js

import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';

import './MainApp.css';

const App = ({ socket }) => {
  const [userCode, setUserCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [prompt, setPrompt] = useState('TEMP Prompt');
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');



  // handle the user's code changes, emit the changes to the server
  const handleUserCodeChange = (value) => {
    setUserCode(value);
    socket.emit('codeUpdate', { username, code: value }); // Send username with code
  };

  // Listen for opponent's code updates from the server
  useEffect(() => {
    socket.on('receiveCodeUpdate', (data) => {
      setOpponentCode(data.code);
    });

    // On component mount, request the current state of the code for both users
    socket.emit('requestCodeState', { username });
    
    // Receive the initial code state (for spectators or reconnects)
    socket.on('initialCodeState', (data) => {
      setUserCode(data.userCode);
      setOpponentCode(data.opponentCode);
    });

    return () => {
      socket.off('receiveCodeUpdate');
      socket.off('initialCodeState');
    };
  }, [socket, username]);
  
  return (
    <div className="app">
      <div className="header">
        <h1>Code Racer</h1>
        <p className="prompt">{prompt}</p>
      </div>
      <div className="editors">
        {/* User's code editor */}
        <div className="editor-section">
          <CodeMirror className='user-code-mirror'
            value={userCode}
            height='100%'
            onChange={handleUserCodeChange}
            extensions={[java()]}
            theme={xcodeDark}
            spellCheck={false} 
            
          />
        </div>

        {/* Opponent's code editor (read-only) */}
        <div className="editor-section">
          <CodeMirror className='opponent-code-mirror'
            value={opponentCode}
            height='100%'
            extensions={[java()]}
            theme={xcodeDark}
          />
          <button className="button-64" role="button" onClick={() => setOpponentCode('Test')}><span class="text">Finish</span></button>
        </div>
      </div>
    </div>
  );
};

export default App;