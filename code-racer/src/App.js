import React from 'react';
import { Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import MainApp from './MainApp'; // Your main app component

const App = () => (
  <Routes>
    <Route path="/" element={<WelcomePage />} />
    <Route path="/app" element={<MainApp />} />
  </Routes>
);

export default App;
