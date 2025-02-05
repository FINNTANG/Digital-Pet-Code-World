import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import OpeningSequence from './components/OpeningSequence';
import GameScreen from './components/GameScreen';
import OpeningMusic from './components/OpeningMusic';

function App() {
  const [isOpeningMusicPlaying, setIsOpeningMusicPlaying] = useState(true);
  
  // 添加路径检查
  const shouldPlayOpeningMusic = window.location.pathname === '/';

  useEffect(() => {
    // 如果不在开始页面，停止开场音乐
    if (!shouldPlayOpeningMusic) {
      setIsOpeningMusicPlaying(false);
    }
  }, [shouldPlayOpeningMusic]);

  const handleStartGame = () => {
    setIsOpeningMusicPlaying(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<OpeningSequence onStartGame={handleStartGame} />} 
        />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <OpeningMusic 
        isPlaying={isOpeningMusicPlaying && shouldPlayOpeningMusic}
        onPlayComplete={() => {
          // 音乐播放完成后的处理（如果需要）
        }}
      />
    </Router>
  );
}

export default App;
