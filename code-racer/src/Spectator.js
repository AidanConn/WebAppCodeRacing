import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';

import './Spectator.css'; // Ensure this file contains relevant styles

const Spectator = ({ socket }) => {
  const [player1Code, setPlayer1Code] = useState(''); // For Player 1's code
  const [player2Code, setPlayer2Code] = useState(''); // For Player 2's code
  const [prompt, setPrompt] = useState('TEMP Prompt'); // Prompt to be provided by the server

  useEffect(() => {
    // Receive initial code state when first connecting
    socket.on('initialCodeState', (data) => {
      setPlayer1Code(data.player1Code); // Adjust data keys if different
      setPlayer2Code(data.player2Code);
    });

    // Listen for code updates
    socket.on('receiveCodeUpdate', (data) => {
      console.log(data);
      if (data.role === 'player1') {
        setPlayer1Code(data.code);
      } else if (data.role === 'player2') {
        setPlayer2Code(data.code);
      }
    });

    return () => {
      socket.off('initialCodeState');
      socket.off('receiveCodeUpdate');
    };
  }, [socket]);

  return (
    <div className="spectator-app">
      <div className="header">
        <h1>Code Racer - Spectator Mode</h1>
        <p className="prompt">{prompt}</p>
      </div>
      <div className="editors2">
        {/* Player 1's code display (read-only) */}
        <div className="editor-section2">
          <h3>Player 1</h3>
          <CodeMirror className='player1Code'
            value={player1Code}
            height="100%"
            extensions={[java()]}
            theme={xcodeDark}
            readOnly={true}
          />
        </div>

        {/* Player 2's code display (read-only) */}
        <div className="editor-section2">
          <h3>Player 2</h3>
          <CodeMirror className='player2Code'
            value={player2Code}
            height="100%"
            extensions={[java()]}
            theme={xcodeDark}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Spectator;
