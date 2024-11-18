// src/App.js

import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';


import './MainApp.css';

const App = ({ socket }) => {
  const [userCode, setUserCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [problemDetails, setProblemDetails] = useState({
    title: '',
    description: '',
    exampleInput: '',
    exampleOutput: '',
    difficulty: '',
  });
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
  const [notification, setNotification] = useState(null);
  const [opponentEffect, setOpponentEffect] = useState('');
  const [opponentNotification, setOpponentNotification] = useState(null);

  // Fetch problem from the backend when the component mounts
  useEffect(() => {
    socket.emit('requestProblem', { username }, (problem) => {
      setUserCode(problem.template);
      setProblemDetails({
        title: problem.title,
        description: problem.description,
        inputExample: problem.inputExample,
        outputExample: problem.outputExample,
        difficulty: problem.difficulty,
      })
    });

    // Listen for opponent's code updates from the server
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

    socket.on('nextProblem', (data) => {
      const { problem } = data;
      setUserCode(problem.template);
      setProblemDetails({
        title: problem.title,
        description: problem.description,
        inputExample: problem.inputExample,
        outputExample: problem.outputExample,
        difficulty: problem.difficulty,
      });
    });

    socket.on('OpponentSuccess', (data) => {
      if (data.username !== username) {
        setOpponentEffect('success'); // Trigger success animation
        setOpponentNotification({ type: 'success', message: 'Opponent successfully compiled and executed their code!' });
        setTimeout(() => setOpponentNotification(null), 3000); // Clear notification after 10 seconds
        setTimeout(() => setOpponentEffect(''), 3000); // Clear animation after 3 seconds
      }
    });

    socket.on('OpponentFailure', (data) => {
      if (data.username !== username) {
        setOpponentEffect('failure'); // Trigger failure animation
        setOpponentNotification({ type: 'error', message: 'Opponent failed to compile or execute their code!' });
        setTimeout(() => setOpponentNotification(null), 3000); // Clear
        setTimeout(() => setOpponentEffect(''), 3000); // Clear animation after 3 seconds
      }
    });

    return () => {
      socket.off('receiveCodeUpdate');
      socket.off('initialCodeState');
      socket.off('Success');
      socket.off('Failure');
    };
  }, [socket, username]);

  // Fetch the next problem
  const loadNextProblem = () => {
    setNotification(null);
    socket.emit('requestNextProblem', { username }, (problem) => {
      setUserCode(problem.template);
      setProblemDetails({
        title: problem.title,
        description: problem.description,
        inputExample: problem.inputExample,
        outputExample: problem.outputExample,
        difficulty: problem.difficulty,
      });
    });
  };

  // Handle code execution event
  const executeCode = () => {
    socket.emit('executeCode', { language: 'java', code: userCode }, (response) => {
      if (response.success) {
        setNotification({ type: 'success', message: 'Code compiled and executed successfully!' });
        socket.emit('Success', { username });
      } else {
        console.log(response);
        if (response.result.error) {
          setNotification({ type: 'error', message: `Execution Error: ${response.result.error}` });
          socket.emit('Failure', { username });
        } else {
          setNotification({ type: 'error', message: `Execution Error: ${response.result.stderr}` });
          socket.emit('Failure', { username });
        }
      }

      setTimeout(() => setNotification(null), 5000);
    });
  };

  // Handle the user's code changes, emit the changes to the server
  const handleUserCodeChange = (value) => {
    setUserCode(value);
    socket.emit('codeUpdate', { username, code: value }); // Send username with code
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Code Racer</h1>
        <button className="next-problem-button" onClick={loadNextProblem}>
          Next Problem
        </button>
        <div className='problem-details'>
          <h2>{problemDetails.title}</h2>
          <p><strong>Description:</strong> {problemDetails.description}</p>
          <p><strong>Example Input:</strong> {problemDetails.inputExample}</p>
          <p><strong>Example Output:</strong> {problemDetails.outputExample}</p>
          <p><strong>Difficulty:</strong> {problemDetails.difficulty}</p>
        </div>
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
        <div className={`editor-section opponent-editor`}>
          <CodeMirror className= {`opponent-code-mirror ${opponentEffect === 'success' ? 'success-effect' : opponentEffect === 'failure' ? 'failure-effect' : ''
          }`}
            value={opponentCode}
            height='100%'
            extensions={[java()]}
            theme={xcodeDark}
          />
          {opponentNotification && (
            <div className={`Oppnotification ${opponentNotification.type}`}>
              {opponentNotification.message}
            </div>
          )}
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          <button className="button-64" role="button" onClick={executeCode}>
            <span className="text">Test Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
