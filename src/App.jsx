import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OpeningSequence from './components/OpeningSequence';
import GameScreen from './components/GameScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OpeningSequence />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
