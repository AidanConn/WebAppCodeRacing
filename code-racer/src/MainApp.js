// src/App.js

import React, { useState, useEffect } from 'react';
import  { socket } from './socket.js';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';

import './MainApp.css';

const App = () => {
  const [userCode, setUserCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [prompt, setPrompt] = useState('TEMP Prompt');
  const [username, setUsername] = useState('');



  // handle the user's code changes, emit the changes to the server
  const handleUserCodeChange = (value) => {
    setUserCode(value);
    socket.emit('codeUpdate', value);
  };

  // Listen for opponent's code updates from the server]
  useEffect(() => {
    socket.on('recieveCodeUpdate', (data) => {
      setOpponentCode(data);
    });
  }, []);
  
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