import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import OpeningSequence from './components/OpeningSequence';
import GameScreen from './components/GameScreen';
import OpeningMusic from './components/OpeningMusic';
import LoginForm from './components/LoginForm';
import { isAuthenticated } from './api/auth';

// 受保护的路由组件 - 检查认证状态
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const isGuest = localStorage.getItem('guest_mode') === 'true';

  useEffect(() => {
    // 如果用户既没有登录也不是游客模式，重定向到登录页
    if (!isLoggedIn && !isGuest) {
      navigate('/login');
    }
  }, [isLoggedIn, isGuest, navigate]);

  // 允许已登录用户或游客访问
  if (isLoggedIn || isGuest) {
    return children;
  }

  // 正在重定向时显示空白页
  return null;
}

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
        {/* 登录页面 - 不需要认证 */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* 主页 - 需要认证或游客模式 */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <OpeningSequence onStartGame={handleStartGame} />
            </ProtectedRoute>
          } 
        />
        
        {/* 游戏页面 - 需要认证或游客模式 */}
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <GameScreen />
            </ProtectedRoute>
          } 
        />
        
        {/* 其他路径重定向到首页 */}
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
