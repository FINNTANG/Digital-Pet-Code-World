import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginFlow, registerFlow } from '../api/auth';

// 错误弹窗组件
const ErrorModal = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      <div 
        className="border-2 p-8 max-w-md w-full mx-4"
        style={{
          backgroundColor: '#000',
          borderColor: '#ff0044',
          boxShadow: '0 0 40px rgba(255, 0, 68, 0.6)',
          animation: 'errorSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          <div style={{ 
            fontSize: '36px',
            fontFamily: "'VT323', monospace",
            color: '#ff0044',
            textShadow: '0 0 10px #ff0044',
            letterSpacing: '4px',
          }}>
            [ ERROR ]
          </div>
          
          <div style={{ 
            fontSize: '22px',
            fontFamily: "'VT323', monospace", 
            color: '#ff6688',
            lineHeight: '1.6',
            letterSpacing: '1px',
          }}>
            {message}
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-3 transition-all duration-200"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '24px',
              letterSpacing: '2px',
              backgroundColor: 'transparent',
              border: '2px solid #ff0044',
              color: '#ff0044',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff0044';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ff0044';
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
      <style>{`
        @keyframes errorSlideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 简化的像素风格文本组件
const PixelText = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      fontFamily: "'VT323', monospace",
      color: '#00ff00',
      letterSpacing: '2px',
      ...style
    }}
  >
    {children}
  </div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: ''
  });
  const [modalError, setModalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, tokens } = await loginFlow({
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('user_info', JSON.stringify(user));
        localStorage.removeItem('guest_mode');
        localStorage.removeItem('guest_timestamp');
        navigate('/opening', { replace: true });
      } else {
        if (formData.password !== formData.password_confirm) {
          setModalError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!agreedToPrivacy) {
          setModalError('Please read and agree to the Privacy Policy');
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
        localStorage.setItem('user_info', JSON.stringify(user));
        localStorage.removeItem('guest_mode');
        localStorage.removeItem('guest_timestamp');
        navigate('/opening', { replace: true });
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed, please try again';
      setModalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem('guest_mode', 'true');
    localStorage.setItem('guest_timestamp', Date.now().toString());
    navigate('/opening', { replace: true });
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setAgreedToPrivacy(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      phone: ''
    });
  };

  // 简化的输入框样式
  const getInputStyle = (fieldName) => ({
    fontFamily: "'VT323', monospace",
    fontSize: '24px',
    letterSpacing: '2px',
    backgroundColor: 'rgba(0, 20, 0, 0.3)',
    border: 'none',
    borderBottom: focusedField === fieldName 
      ? '2px solid #00ff00' 
      : '2px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    boxShadow: focusedField === fieldName 
      ? '0 10px 20px -10px rgba(0, 255, 0, 0.2)' 
      : 'none',
    transition: 'all 0.3s ease',
    padding: '15px 10px',
    outline: 'none',
    width: '100%',
    borderRadius: '0'
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
        rel="stylesheet"
      />
      
      {/* 背景装饰 - 网格 */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 50, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 50, 0, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* 标题 */}
        <div className="text-center mb-16">
          <div style={{ 
            fontSize: '72px',
            fontFamily: "'VT323', monospace",
            color: '#00ff00',
            textShadow: '0 0 15px rgba(0, 255, 0, 0.6), 0 0 30px rgba(0, 255, 0, 0.4)',
            letterSpacing: '8px',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            REALITYEATER
          </div>
          <div style={{
            display: 'inline-block',
            padding: '5px 20px',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            backgroundColor: 'rgba(0, 20, 0, 0.5)',
            borderRadius: '20px'
          }}>
            <PixelText style={{ 
              fontSize: '18px',
              color: '#aaffaa',
              letterSpacing: '4px',
            }}>
              {mode === 'login' ? '► SYSTEM ACCESS' : '► NEW USER ENTRY'}
            </PixelText>
          </div>
        </div>

        {/* 表单容器 */}
        <div 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #333',
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
            padding: '50px 40px',
            position: 'relative',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* 装饰性边角 */}
          <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '20px', height: '20px', borderTop: '2px solid #00ff00', borderLeft: '2px solid #00ff00' }} />
          <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '20px', height: '20px', borderTop: '2px solid #00ff00', borderRight: '2px solid #00ff00' }} />
          <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '20px', height: '20px', borderBottom: '2px solid #00ff00', borderLeft: '2px solid #00ff00' }} />
          <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '20px', height: '20px', borderBottom: '2px solid #00ff00', borderRight: '2px solid #00ff00' }} />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 用户名 */}
            <div className="relative">
              <PixelText style={{ 
                fontSize: '16px', 
                marginBottom: '5px', 
                opacity: 0.7,
                transform: 'translateY(5px)' 
              }}>
                {mode === 'login' ? 'IDENTITY' : 'USERNAME'}
              </PixelText>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                required
                style={getInputStyle('username')}
                placeholder={mode === 'login' ? 'Enter ID...' : 'Choose username...'}
              />
            </div>

            {/* 邮箱 */}
            {mode === 'register' && (
              <div className="relative">
                <PixelText style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.7 }}>
                  CONTACT LINK
                </PixelText>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                  style={getInputStyle('email')}
                  placeholder="email@domain.com"
                />
              </div>
            )}

            {/* 密码 */}
            <div className="relative">
              <PixelText style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.7 }}>
                SECURITY KEY
              </PixelText>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                style={getInputStyle('password')}
                placeholder="••••••••"
              />
            </div>

            {/* 确认密码 */}
            {mode === 'register' && (
              <div className="relative">
                <PixelText style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.7 }}>
                  VERIFY KEY
                </PixelText>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password_confirm')}
                  onBlur={() => setFocusedField('')}
                  required
                  style={getInputStyle('password_confirm')}
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* 手机号 */}
            {mode === 'register' && (
              <div className="relative">
                <PixelText style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.7 }}>
                  SIGNAL FREQUENCY
                </PixelText>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  required
                  style={getInputStyle('phone')}
                  placeholder="Mobile number"
                />
              </div>
            )}

            {/* 隐私政策 */}
            {mode === 'register' && (
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="privacyAgreement"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 cursor-pointer appearance-none border-2 border-green-500 bg-black checked:bg-green-500"
                  style={{ 
                    accentColor: '#00ff00',
                    position: 'relative'
                  }}
                />
                <label htmlFor="privacyAgreement" className="flex-1 cursor-pointer">
                  <PixelText style={{ fontSize: '16px', lineHeight: '1.5', opacity: 0.8 }}>
                    Initialize protocol: <br/>
                    I accept the{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        color: '#fff',
                        borderBottom: '1px dashed #fff'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      User Agreement
                    </a>
                  </PixelText>
                </label>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !agreedToPrivacy)}
              className="w-full px-6 py-5 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-8 group relative overflow-hidden"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '24px',
                letterSpacing: '4px',
                backgroundColor: '#000',
                border: '2px solid #00ff00',
                color: '#00ff00',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              <div className="absolute inset-0 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out opacity-20"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                {loading ? '>>> PROCESSING' : mode === 'login' ? '>>> INITIATE LOGIN' : '>>> EXECUTE REGISTER'}
              </span>
            </button>
          </form>

          {/* 切换和游客按钮 */}
          <div className="mt-8 space-y-4 border-t border-gray-800 pt-8">
            <button
              onClick={switchMode}
              className="w-full px-4 py-2 transition-all duration-200 text-left hover:pl-6"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '18px',
                color: '#666',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.color = '#00ff00'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              {mode === 'login' ? '[ CREATE NEW IDENTITY ]' : '[ RETURN TO LOGIN ]'}
            </button>

            <button
              onClick={handleGuestMode}
              className="w-full px-4 py-2 transition-all duration-200 text-left hover:pl-6"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '18px',
                color: '#666',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              [ GUEST ACCESS MODE ]
            </button>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-12">
          <PixelText style={{ 
            fontSize: '14px', 
            opacity: 0.3,
            letterSpacing: '2px'
          }}>
            SECURE CONNECTION ESTABLISHED :: v2.4.0
          </PixelText>
        </div>
      </div>

      {/* 错误弹窗 */}
      <ErrorModal 
        message={modalError} 
        onClose={() => setModalError('')} 
      />

      <style>{`
        input::placeholder {
          color: rgba(0, 255, 0, 0.3);
          font-family: 'VT323', monospace;
        }
        
        /* 移动端适配 */
        @media (max-width: 768px) {
          .min-h-screen {
            padding: 20px 0;
          }
          
          /* 调整标题大小 */
          .text-center > div:first-child {
            font-size: 36px !important;
            letter-spacing: 4px !important;
            line-height: 1.2;
            word-break: break-word;
          }
          
          /* 调整副标题 */
          .text-center > div:nth-child(2) {
            padding: 3px 10px !important;
          }
          
          .text-center > div:nth-child(2) > div {
            font-size: 12px !important;
            letter-spacing: 2px !important;
          }
          
          /* 调整表单容器 */
          .relative.z-10 > div:nth-child(2) {
            padding: 30px 20px !important;
          }
          
          /* 调整输入框字体 */
          input {
            font-size: 18px !important;
            padding: 12px 8px !important;
          }
          
          /* 调整按钮 */
          button[type="submit"] {
            font-size: 18px !important;
            padding: 15px 20px !important;
            letter-spacing: 2px !important;
          }
          
          /* 调整底部按钮 */
          .mt-8.space-y-4 button {
            font-size: 14px !important;
          }
          
          /* 调整标签文字 */
          label > div {
            font-size: 12px !important;
          }
          
          /* 调整底部文字 */
          .text-center.mt-12 > div {
            font-size: 10px !important;
          }
          
          /* 减小间距 */
          .mb-16 {
            margin-bottom: 2rem !important;
          }
          
          .space-y-8 > * + * {
            margin-top: 1.5rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .text-center > div:first-child {
            font-size: 28px !important;
            letter-spacing: 2px !important;
          }
          
          .relative.z-10 > div:nth-child(2) {
            padding: 20px 15px !important;
          }
          
          input {
            font-size: 16px !important;
          }
          
          button[type="submit"] {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
