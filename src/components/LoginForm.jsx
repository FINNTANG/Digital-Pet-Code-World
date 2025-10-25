import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginFlow, registerFlow } from '../api/auth';

// Matrix Rain背景组件
const MatrixRain = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const fontSize = 16;
    const columns = canvas.width/fontSize;
    const rainDrops = Array(Math.floor(columns)).fill(1);
    
    let lastTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;
    
    const draw = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > frameInterval) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff66';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillStyle = `rgba(0, 255, 102, ${Math.random() * 0.5 + 0.5})`;
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
          
          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
        
        lastTime = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    animationFrameRef.current = requestAnimationFrame(draw);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.15,
        willChange: 'transform'
      }}
    />
  );
};

// 像素风格文本组件
const PixelText = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      fontFamily: "'VT323', monospace",
      imageRendering: 'pixelated',
      textShadow: '0 0 3px #00ff00, 0 0 6px #00ff00',
      color: '#00ff00',
      fontWeight: '700',
      letterSpacing: '2px',
      ...style
    }}
  >
    {children}
  </div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // 登录
        const { user, tokens } = await loginFlow({
          username: formData.username,
          password: formData.password
        });
        console.log('登录成功:', user);
        // 保存用户信息
        localStorage.setItem('user_info', JSON.stringify(user));
        // 跳转到首页
        navigate('/');
      } else {
        // 注册
        if (formData.password !== formData.password_confirm) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        const { user, tokens } = await registerFlow({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          phone: formData.phone
        });
        console.log('注册成功:', user);
        // 保存用户信息
        localStorage.setItem('user_info', JSON.stringify(user));
        // 跳转到首页
        navigate('/');
      }
    } catch (err) {
      console.error('认证失败:', err);
      setError(err.response?.data?.message || err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    // 设置游客标记
    localStorage.setItem('guest_mode', 'true');
    navigate('/');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      phone: ''
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
        rel="stylesheet"
      />
      <MatrixRain />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <PixelText style={{ fontSize: '48px' }}>
            REALITYEATER
          </PixelText>
          <PixelText style={{ fontSize: '20px', marginTop: '10px', opacity: 0.8 }}>
            {mode === 'login' ? 'SYSTEM LOGIN' : 'USER REGISTRATION'}
          </PixelText>
        </div>

        {/* 表单容器 */}
        <div 
          className="border-2 border-green-500 p-6"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <PixelText style={{ fontSize: '18px', marginBottom: '8px' }}>
                {mode === 'login' ? 'USERNAME / EMAIL' : 'USERNAME'}
              </PixelText>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full bg-black border-2 border-green-500 text-green-500 px-4 py-2 focus:outline-none"
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: '20px',
                  letterSpacing: '1px',
                  boxShadow: '0 0 4px #00ff00',
                  textShadow: '0 0 2px #00ff00',
                }}
                placeholder={mode === 'login' ? 'Enter username or email' : 'Enter username'}
              />
            </div>

            {/* 邮箱（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px' }}>
                  EMAIL
                </PixelText>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-green-500 text-green-500 px-4 py-2 focus:outline-none"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '20px',
                    letterSpacing: '1px',
                    boxShadow: '0 0 4px #00ff00',
                    textShadow: '0 0 2px #00ff00',
                  }}
                  placeholder="Enter email"
                />
              </div>
            )}

            {/* 密码 */}
            <div>
              <PixelText style={{ fontSize: '18px', marginBottom: '8px' }}>
                PASSWORD
              </PixelText>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-black border-2 border-green-500 text-green-500 px-4 py-2 focus:outline-none"
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: '20px',
                  letterSpacing: '1px',
                  boxShadow: '0 0 4px #00ff00',
                  textShadow: '0 0 2px #00ff00',
                }}
                placeholder="Enter password"
              />
            </div>

            {/* 确认密码（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px' }}>
                  CONFIRM PASSWORD
                </PixelText>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-green-500 text-green-500 px-4 py-2 focus:outline-none"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '20px',
                    letterSpacing: '1px',
                    boxShadow: '0 0 4px #00ff00',
                    textShadow: '0 0 2px #00ff00',
                  }}
                  placeholder="Confirm password"
                />
              </div>
            )}

            {/* 手机号（仅注册时显示，可选） */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px' }}>
                  PHONE (OPTIONAL)
                </PixelText>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black border-2 border-green-500 text-green-500 px-4 py-2 focus:outline-none"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '20px',
                    letterSpacing: '1px',
                    boxShadow: '0 0 4px #00ff00',
                    textShadow: '0 0 2px #00ff00',
                  }}
                  placeholder="Enter phone"
                />
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div 
                className="border-2 border-red-500 p-3"
                style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                }}
              >
                <PixelText style={{ 
                  fontSize: '16px', 
                  color: '#ff0000',
                  textShadow: '0 0 3px #ff0000, 0 0 6px #ff0000'
                }}>
                  ERROR: {error}
                </PixelText>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '24px',
                letterSpacing: '2px',
                fontWeight: '700',
                boxShadow: '0 0 8px #00ff00',
              }}
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
          </form>

          {/* 切换模式和游客登录 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={switchMode}
              className="w-full px-4 py-2 bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '18px',
                letterSpacing: '1px',
                boxShadow: '0 0 4px #00ff00',
              }}
            >
              {mode === 'login' ? 'CREATE NEW ACCOUNT' : 'BACK TO LOGIN'}
            </button>

            <button
              onClick={handleGuestMode}
              className="w-full px-4 py-2 bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '18px',
                letterSpacing: '1px',
                boxShadow: '0 0 4px #00ff00',
                opacity: 0.7
              }}
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6">
          <PixelText style={{ fontSize: '14px', opacity: 0.5 }}>
            DIGITAL PET CODE WORLD v1.0
          </PixelText>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
