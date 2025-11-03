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
    fontSize: '22px',
    letterSpacing: '1px',
    backgroundColor: '#000',
    border: focusedField === fieldName 
      ? '2px solid #ffffff' 
      : '2px solid #00ff00',
    color: '#00ff00',
    boxShadow: focusedField === fieldName 
      ? '0 0 20px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
      : 'none',
    transition: 'all 0.2s ease',
    padding: '12px 16px',
    outline: 'none',
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
        rel="stylesheet"
      />
      
      {/* 简化的背景装饰 - 仅用CSS渐变，不使用Canvas */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0, 255, 0, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* 标题 */}
        <div className="text-center mb-12">
          <PixelText style={{ 
            fontSize: '64px',
            textShadow: '0 0 20px #00ff00, 0 2px 0 rgba(255, 255, 255, 0.2)',
            letterSpacing: '6px',
            marginBottom: '20px',
          }}>
            REALITYEATER
          </PixelText>
          <div style={{
            width: '100px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00ff00, #ffffff, #00ff00, transparent)',
            margin: '0 auto 20px',
          }} />
          <PixelText style={{ 
            fontSize: '22px',
            color: '#ffffff',
            opacity: 0.9,
            letterSpacing: '3px',
          }}>
            {mode === 'login' ? 'SYSTEM LOGIN' : 'USER REGISTRATION'}
          </PixelText>
        </div>

        {/* 表单容器 */}
        <div 
          style={{
            backgroundColor: '#000',
            border: '2px solid #00ff00',
            borderTop: '2px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 40px rgba(0, 255, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '40px 30px',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 用户名 */}
            <div>
              <PixelText style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
                {mode === 'login' ? '► USERNAME / EMAIL' : '► USERNAME'}
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
                placeholder={mode === 'login' ? 'Enter username or email' : 'Enter username'}
              />
            </div>

            {/* 邮箱 */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
                  ► EMAIL
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
                  placeholder="Enter email"
                />
              </div>
            )}

            {/* 密码 */}
            <div>
              <PixelText style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
                ► PASSWORD
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
                placeholder="Enter password"
              />
            </div>

            {/* 确认密码 */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
                  ► CONFIRM PASSWORD
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
                  placeholder="Confirm password"
                />
              </div>
            )}

            {/* 手机号 */}
            {mode === 'register' && (
              <div>
                <PixelText style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
                  ► PHONE
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
                  placeholder="Enter phone"
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
                  className="mt-1 w-5 h-5 cursor-pointer"
                  style={{ accentColor: '#00ff00' }}
                />
                <label htmlFor="privacyAgreement" className="flex-1 cursor-pointer">
                  <PixelText style={{ fontSize: '17px', lineHeight: '1.6', opacity: 0.9 }}>
                    I have read and agree to the{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'underline',
                        color: '#ffffff',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                  </PixelText>
                </label>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !agreedToPrivacy)}
              className="w-full px-6 py-4 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-6"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '28px',
                letterSpacing: '3px',
                backgroundColor: '#000',
                border: '3px solid #00ff00',
                borderTop: '3px solid rgba(255, 255, 255, 0.5)',
                color: '#00ff00',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (!loading && !(mode === 'register' && !agreedToPrivacy)) {
                  e.target.style.backgroundColor = '#00ff00';
                  e.target.style.color = '#000';
                  e.target.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#000';
                e.target.style.color = '#00ff00';
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
              }}
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
          </form>

          {/* 切换和游客按钮 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={switchMode}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '20px',
                letterSpacing: '2px',
                backgroundColor: 'transparent',
                border: '2px solid #00ff00',
                color: '#00ff00',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {mode === 'login' ? 'CREATE NEW ACCOUNT' : 'BACK TO LOGIN'}
            </button>

            <button
              onClick={handleGuestMode}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '20px',
                letterSpacing: '2px',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8">
          <PixelText style={{ 
            fontSize: '14px', 
            opacity: 0.5,
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            DIGITAL PET CODE WORLD v1.0
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
      `}</style>
    </div>
  );
};

export default LoginForm;
