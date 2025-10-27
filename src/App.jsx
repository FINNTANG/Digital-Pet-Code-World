import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import OpeningSequence from './components/OpeningSequence';
import GameScreen from './components/GameScreen';
import OpeningMusic from './components/OpeningMusic';
import LoginForm from './components/LoginForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import { isAuthenticated } from './api/auth';

// 受保护的路由组件 - 检查认证状态
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const isGuest = localStorage.getItem('guest_mode') === 'true';

  useEffect(() => {
    // 如果用户既没有登录也不是游客模式，重定向到登录页
    if (!isLoggedIn && !isGuest) {
      console.log('未登录且非游客模式，重定向到登录页');
      // 保存当前路径，登录后可以返回
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [isLoggedIn, isGuest, navigate, location]);

  // 允许已登录用户或游客访问
  if (isLoggedIn || isGuest) {
    return children;
  }

  // 正在重定向时显示加载状态
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '20px'
    }}>
      LOADING...
    </div>
  );
}

// 登录页面路由 - 如果已登录则重定向
function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const isGuest = localStorage.getItem('guest_mode') === 'true';

  useEffect(() => {
    // 如果已登录或是游客，重定向到之前的页面或首页
    if (isLoggedIn || isGuest) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, isGuest, navigate, location]);

  // 未登录时显示登录页面
  if (!isLoggedIn && !isGuest) {
    return <LoginForm />;
  }

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
        {/* 登录页面 - 如果已登录则自动重定向 */}
        <Route path="/login" element={<LoginRoute />} />
        
        {/* 隐私政策页面 - 公开访问 */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
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
        
        {/* 其他路径重定向到登录页（未认证）或首页（已认证） */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={isAuthenticated() || localStorage.getItem('guest_mode') === 'true' ? '/' : '/login'} 
              replace 
            />
          } 
        />
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
