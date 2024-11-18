import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';

import './Spectator.css'; // Ensure this file contains relevant styles

const Spectator = ({ socket }) => {
  const [player1Code, setPlayer1Code] = useState(''); // For Player 1's code
  const [player2Code, setPlayer2Code] = useState(''); // For Player 2's code
  const [problemDetails, setProblemDetails] = useState({
    title: '',
    description: '',
    exampleInput: '',
    exampleOutput: '',
    difficulty: '',
  });
  const [SpecPoints, setSpecPoints] = useState(200);
  const [flashbangTarget, setFlashbangTarget] = useState(null);


  useEffect(() => {
    // Receive initial code state when first connecting
    socket.on('initialCodeState', (data) => {
      setPlayer1Code(data.player1Code); 
      setPlayer2Code(data.player2Code);
    });

    socket.emit('requestProblem', {"Spectator" : String}, (problem) => {
      setProblemDetails({
        title: problem.title,
        description: problem.description,
        inputExample: problem.inputExample,
        outputExample: problem.outputExample,
        difficulty: problem.difficulty,
      });
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

    socket.on('nextProblem', (data) => {
      const { problem } = data;
      setProblemDetails({
        title: problem.title,
        description: problem.description,
        inputExample: problem.inputExample,
        outputExample: problem.outputExample,
        difficulty: problem.difficulty,
      });
    });

    socket.on('SpectatorFlashbang', (data) => {
      const { player } = data;
      console.log(`Flashbang used on ${player}`);
      setFlashbangTarget(player);

      setTimeout(() => {
        setFlashbangTarget(null);
      }, 3000);
  });

    return () => {
      socket.off('initialCodeState');
      socket.off('receiveCodeUpdate');
      socket.off('currentProblem');
      socket.off('Spectatorflashbang');
      
    };
  }, [socket]);

  // ----------------------------------
  // Handle Points logic

  const handleGeneratePoints = () => {
    setSpecPoints((prev) => prev + 1);
  };

  const flashbang = (player) => {
    if (SpecPoints >= 100 ){
      setSpecPoints((prev) => prev - 100);
      socket.emit('flashbang', { player });
    } else {
      alert("You don't have enough points to use this ability");
    }
  };

  return (
    <div className="spectator-app">
      <div className="header">
        <h1>Code Racer - Spectator Mode</h1>
        <div className='problem-details'>
          <h2>{problemDetails.title}</h2>
          <p><strong>Description:</strong> {problemDetails.description}</p>
          <p><strong>Example Input:</strong> {problemDetails.inputExample}</p>
          <p><strong>Example Output:</strong> {problemDetails.outputExample}</p>
          <p><strong>Difficulty:</strong> {problemDetails.difficulty}</p>
        </div>
      </div>
      <div className="editors2">
        {/* Player 1's code display (read-only) */}
        <div className={`editor-section2`}>
          <h3>Player 1</h3>
          <CodeMirror
            className={`player1Code ${flashbangTarget === 'player1' ? 'flashbang-effect' : ''}`}
            value={player1Code}
            height="100%"
            extensions={[java()]}
            theme={xcodeDark}
            readOnly={true}
          />
          <button
            className="mess-button"
            onClick={() => flashbang('player1')}
            disabled={SpecPoints < 100}
          >
            FlashBang Player 1 (-100 points)
          </button>
        </div>
        
        {/* Central points generator */}
        <div className="points-generator">
          <button
            className="generate-points"
            onClick={handleGeneratePoints}
          >
            Generate Points (+1)
          </button>
          <p>Points: {SpecPoints}</p>
        </div>
  
        {/* Player 2's code display (read-only) */}
        <div className="editor-section2">
          <h3>Player 2</h3>
          <CodeMirror
            className={`player2Code ${flashbangTarget === 'player2' ? 'flashbang-effect' : ''}`}
            value={player2Code}
            height="100%"
            extensions={[java()]}
            theme={xcodeDark}
            readOnly={true}
          />
          <button
            className="mess-button"
            onClick={() => flashbang('player2')}
            disabled={SpecPoints < 100}
          >
            FlashBang Player 2 (-100 points)
          </button>
        </div>
      </div>
    </div>
  );  
};

export default Spectator;
