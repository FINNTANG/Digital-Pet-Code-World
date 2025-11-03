import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Matrix Rain背景组件
const MatrixRain = React.memo(() => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    
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
    
    const fontSize = 18;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = new Array(columns).fill(1);
    
    let lastTime = 0;
    const fps = 20;
    const frameInterval = 1000 / fps;
    
    const draw = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > frameInterval) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          const brightness = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(0, 255, 102, ${brightness})`;
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
        opacity: 0.2,
        pointerEvents: 'none',
      }}
    />
  );
});

MatrixRain.displayName = 'MatrixRain';

// 像素风格文本组件
const PixelText = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      fontFamily: "'VT323', monospace",
      textShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
      color: '#00ff00',
      letterSpacing: '2px',
      ...style
    }}
  >
    {children}
  </div>
);

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8">
      <link
        href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
        rel="stylesheet"
      />
      <MatrixRain />
      
      <div className="relative z-10 w-full max-w-4xl px-4">
        {/* 标题 */}
        <div className="text-center mb-10">
          <PixelText style={{ 
            fontSize: '56px',
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
            letterSpacing: '4px',
          }}>
            PRIVACY POLICY
          </PixelText>
          <PixelText style={{ fontSize: '22px', marginTop: '15px', opacity: 0.8, letterSpacing: '3px' }}>
            [ REALITYEATER SYSTEM ]
          </PixelText>
        </div>

        {/* 内容容器 */}
        <div 
          className="privacy-content max-h-[70vh] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '3px solid #00ff00',
            boxShadow: '0 0 30px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.05)',
            padding: '50px 40px',
          }}
        >
          {/* 自定义滚动条样式 */}
          <style>{`
            .privacy-content::-webkit-scrollbar {
              width: 12px;
            }
            .privacy-content::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.5);
              border-left: 2px solid #00ff00;
            }
            .privacy-content::-webkit-scrollbar-thumb {
              background: #00ff00;
              box-shadow: 0 0 10px #00ff00;
            }
            .privacy-content::-webkit-scrollbar-thumb:hover {
              background: #00ff88;
              box-shadow: 0 0 15px #00ff88;
            }
          `}</style>

          <div className="space-y-8">
            {/* 更新日期 */}
            <div>
              <PixelText style={{ fontSize: '18px', opacity: 0.7, letterSpacing: '1px' }}>
                Last Updated: October 27, 2025
              </PixelText>
            </div>

            {/* 引言 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► INTRODUCTION
              </PixelText>
              <PixelText style={{ fontSize: '20px', opacity: 0.9, lineHeight: '1.8', letterSpacing: '1px' }}>
                Welcome to the REALITYEATER Digital Pet System. We value your privacy and are 
                committed to protecting your personal information. This Privacy Policy explains 
                how we collect, use, store, and protect your data.
              </PixelText>
            </section>

            {/* 信息收集 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► INFORMATION COLLECTION
              </PixelText>
              <div className="ml-6 space-y-4">
                <div>
                  <PixelText style={{ fontSize: '22px', color: '#00ff88', marginBottom: '10px' }}>
                    1. Account Information
                  </PixelText>
                  <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.8' }}>
                    • Username<br/>
                    • Email Address<br/>
                    • Phone Number<br/>
                    • Password (Encrypted)
                  </PixelText>
                </div>
                
                <div>
                  <PixelText style={{ fontSize: '22px', color: '#00ff88', marginBottom: '10px' }}>
                    2. Game Data
                  </PixelText>
                  <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.8' }}>
                    • Pet Status & Attributes<br/>
                    • Game Progress & Achievements<br/>
                    • Interaction History<br/>
                    • Conversation History
                  </PixelText>
                </div>

                <div>
                  <PixelText style={{ fontSize: '22px', color: '#00ff88', marginBottom: '10px' }}>
                    3. Technical Information
                  </PixelText>
                  <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.8' }}>
                    • Device Information<br/>
                    • IP Address<br/>
                    • Browser Type<br/>
                    • Access Logs
                  </PixelText>
                </div>
              </div>
            </section>

            {/* 信息使用 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► INFORMATION USAGE
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We use your information to:<br/><br/>
                  • Provide and maintain game services<br/>
                  • Personalize user experience<br/>
                  • Enable AI interaction with your digital pet<br/>
                  • Improve game features and performance<br/>
                  • Send important notifications and updates<br/>
                  • Prevent fraud and abuse<br/>
                  • Comply with legal obligations
                </PixelText>
              </div>
            </section>

            {/* 数据安全 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► DATA SECURITY
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We implement various security measures:<br/><br/>
                  • Encrypted password storage<br/>
                  • HTTPS secure transmission<br/>
                  • Regular security audits<br/>
                  • Access control systems<br/>
                  • Data backup mechanisms<br/><br/>
                  However, please note that no method of internet transmission or electronic 
                  storage is 100% secure.
                </PixelText>
              </div>
            </section>

            {/* 数据共享 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► DATA SHARING
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We do not sell your personal information. We only share data when:<br/><br/>
                  • You provide explicit consent<br/>
                  • Required by law or law enforcement<br/>
                  • Necessary to protect our rights and safety<br/>
                  • With third-party AI providers (for game functionality only)
                </PixelText>
              </div>
            </section>

            {/* Cookie使用 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► COOKIES & LOCAL STORAGE
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We use cookies and local storage to:<br/><br/>
                  • Maintain login sessions<br/>
                  • Save game preferences<br/>
                  • Remember user choices<br/>
                  • Analyze site usage<br/><br/>
                  You can manage cookies through your browser settings, though this may affect 
                  certain features.
                </PixelText>
              </div>
            </section>

            {/* 用户权利 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► YOUR RIGHTS
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  You have the following rights:<br/><br/>
                  • Access your personal data<br/>
                  • Correct inaccurate information<br/>
                  • Delete your account and data<br/>
                  • Export your data<br/>
                  • Withdraw consent<br/>
                  • Restrict data processing<br/>
                  • Object to data processing
                </PixelText>
              </div>
            </section>

            {/* 未成年人保护 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► CHILDREN'S PRIVACY
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  Our service is intended for users aged 13 and above. If you are under 13, 
                  please use our service under parental supervision. We do not knowingly 
                  collect personal information from children under 13.
                </PixelText>
              </div>
            </section>

            {/* 数据保留 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► DATA RETENTION
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We retain your personal information as long as:<br/><br/>
                  • Your account is active<br/>
                  • Necessary to provide services<br/>
                  • Required by law<br/>
                  • Needed to resolve disputes<br/><br/>
                  After account deletion, your data will be permanently removed within 30 days 
                  (except where legally required).
                </PixelText>
              </div>
            </section>

            {/* 政策更新 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► POLICY UPDATES
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  We may update this Privacy Policy from time to time. Significant changes 
                  will be communicated via email or in-game notifications. Continued use of 
                  the service indicates acceptance of the updated policy.
                </PixelText>
              </div>
            </section>

            {/* 联系方式 */}
            <section>
              <PixelText style={{ fontSize: '28px', marginBottom: '20px', textShadow: '0 0 10px #00ff88' }}>
                ► CONTACT US
              </PixelText>
              <div className="ml-6">
                <PixelText style={{ fontSize: '20px', opacity: 0.85, lineHeight: '1.9' }}>
                  For any privacy-related questions or requests, please contact us:<br/><br/>
                  Email: privacy@realityeater.com<br/>
                  System Code: PRIVACY-INQUIRY-2025<br/><br/>
                  We will respond to your request within 30 days.
                </PixelText>
              </div>
            </section>

            {/* 同意声明 */}
            <section 
              className="pt-8 mt-8" 
              style={{
                borderTop: '2px solid rgba(0, 255, 0, 0.5)',
              }}
            >
              <PixelText style={{ fontSize: '22px', opacity: 0.95, lineHeight: '1.9', textAlign: 'center' }}>
                By using the REALITYEATER Digital Pet System, you acknowledge that you have 
                read, understood, and agree to all terms of this Privacy Policy.
              </PixelText>
            </section>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const from = window.location.pathname;
              if (from.includes('/privacy-policy')) {
                navigate('/login');
              } else {
                navigate(-1);
              }
            }}
            className="px-10 py-4 transition-all duration-300"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '26px',
              letterSpacing: '3px',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              border: '3px solid #00ff00',
              color: '#00ff00',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.4)',
              textShadow: '0 0 8px #00ff00',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#00ff00';
              e.target.style.color = '#000';
              e.target.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
              e.target.style.color = '#00ff00';
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← BACK
          </button>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8">
          <PixelText style={{ fontSize: '15px', opacity: 0.6, letterSpacing: '1px' }}>
            DIGITAL PET CODE WORLD v1.0 - PRIVACY POLICY
          </PixelText>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
