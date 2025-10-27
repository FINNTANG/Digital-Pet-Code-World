import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="text-center mb-8">
          <PixelText style={{ fontSize: '48px' }}>
            PRIVACY POLICY
          </PixelText>
          <PixelText style={{ fontSize: '20px', marginTop: '10px', opacity: 0.8 }}>
            隐私政策
          </PixelText>
        </div>

        {/* 内容容器 */}
        <div 
          className="border-2 border-green-500 p-8 max-h-[70vh] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
          }}
        >
          {/* 自定义滚动条样式 */}
          <style>{`
            .privacy-content::-webkit-scrollbar {
              width: 10px;
            }
            .privacy-content::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.5);
              border-left: 1px solid #00ff00;
            }
            .privacy-content::-webkit-scrollbar-thumb {
              background: #00ff00;
              box-shadow: 0 0 6px #00ff00;
            }
            .privacy-content::-webkit-scrollbar-thumb:hover {
              background: #00ff00;
              box-shadow: 0 0 10px #00ff00;
            }
          `}</style>

          <div className="privacy-content space-y-6">
            {/* 更新日期 */}
            <div>
              <PixelText style={{ fontSize: '16px', opacity: 0.7 }}>
                最后更新时间：2025年10月27日
              </PixelText>
              <PixelText style={{ fontSize: '16px', opacity: 0.7, marginTop: '5px' }}>
                Last Updated: October 27, 2025
              </PixelText>
            </div>

            {/* 引言 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 引言 / INTRODUCTION
              </PixelText>
              <PixelText style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.8' }}>
                欢迎使用REALITYEATER数字宠物系统。我们重视您的隐私，并承诺保护您的个人信息。
                本隐私政策说明了我们如何收集、使用、存储和保护您的数据。
              </PixelText>
              <PixelText style={{ fontSize: '16px', opacity: 0.7, lineHeight: '1.6', marginTop: '10px' }}>
                Welcome to the REALITYEATER Digital Pet System. We value your privacy and are 
                committed to protecting your personal information. This Privacy Policy explains 
                how we collect, use, store, and protect your data.
              </PixelText>
            </section>

            {/* 信息收集 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 信息收集 / INFORMATION COLLECTION
              </PixelText>
              <div className="ml-4 space-y-3">
                <div>
                  <PixelText style={{ fontSize: '20px', color: '#00dd00' }}>
                    1. 账户信息
                  </PixelText>
                  <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.6' }}>
                    • 用户名 (Username)<br/>
                    • 电子邮箱 (Email Address)<br/>
                    • 手机号码 (Phone Number)<br/>
                    • 密码（加密存储）(Password - Encrypted)
                  </PixelText>
                </div>
                
                <div>
                  <PixelText style={{ fontSize: '20px', color: '#00dd00' }}>
                    2. 游戏数据
                  </PixelText>
                  <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.6' }}>
                    • 宠物状态和属性 (Pet Status & Attributes)<br/>
                    • 游戏进度和成就 (Game Progress & Achievements)<br/>
                    • 交互记录 (Interaction History)<br/>
                    • 对话历史 (Conversation History)
                  </PixelText>
                </div>

                <div>
                  <PixelText style={{ fontSize: '20px', color: '#00dd00' }}>
                    3. 技术信息
                  </PixelText>
                  <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.6' }}>
                    • 设备信息 (Device Information)<br/>
                    • IP地址 (IP Address)<br/>
                    • 浏览器类型 (Browser Type)<br/>
                    • 访问日志 (Access Logs)
                  </PixelText>
                </div>
              </div>
            </section>

            {/* 信息使用 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 信息使用 / INFORMATION USAGE
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们使用您的信息用于：<br/><br/>
                  • 提供和维护游戏服务 (Provide and maintain game services)<br/>
                  • 个性化用户体验 (Personalize user experience)<br/>
                  • 与您的数字宠物进行AI互动 (AI interaction with your digital pet)<br/>
                  • 改进游戏功能和性能 (Improve game features and performance)<br/>
                  • 发送重要通知和更新 (Send important notifications and updates)<br/>
                  • 防止欺诈和滥用 (Prevent fraud and abuse)<br/>
                  • 遵守法律义务 (Comply with legal obligations)
                </PixelText>
              </div>
            </section>

            {/* 数据安全 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 数据安全 / DATA SECURITY
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们采取多种安全措施保护您的信息：<br/><br/>
                  • 密码加密存储 (Encrypted password storage)<br/>
                  • HTTPS安全传输 (HTTPS secure transmission)<br/>
                  • 定期安全审计 (Regular security audits)<br/>
                  • 访问权限控制 (Access control)<br/>
                  • 数据备份机制 (Data backup mechanisms)<br/><br/>
                  然而，请注意没有任何互联网传输或电子存储方法是100%安全的。
                </PixelText>
              </div>
            </section>

            {/* 数据共享 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 数据共享 / DATA SHARING
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们不会出售您的个人信息。我们仅在以下情况下共享数据：<br/><br/>
                  • 经您明确同意 (With your explicit consent)<br/>
                  • 法律要求或执法请求 (Legal requirements or law enforcement)<br/>
                  • 保护我们的权利和安全 (To protect our rights and safety)<br/>
                  • 与第三方AI服务提供商（仅用于游戏功能）<br/>
                  &nbsp;&nbsp;(With third-party AI providers for game functionality only)
                </PixelText>
              </div>
            </section>

            {/* Cookie使用 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► Cookie和本地存储 / COOKIES & LOCAL STORAGE
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们使用Cookie和本地存储来：<br/><br/>
                  • 维持登录状态 (Maintain login session)<br/>
                  • 保存游戏偏好设置 (Save game preferences)<br/>
                  • 记住用户选择 (Remember user choices)<br/>
                  • 分析网站使用情况 (Analyze site usage)<br/><br/>
                  您可以通过浏览器设置管理Cookie，但这可能影响某些功能。
                </PixelText>
              </div>
            </section>

            {/* 用户权利 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 您的权利 / YOUR RIGHTS
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  您拥有以下权利：<br/><br/>
                  • 访问您的个人数据 (Access your personal data)<br/>
                  • 更正不准确的信息 (Correct inaccurate information)<br/>
                  • 删除您的账户和数据 (Delete your account and data)<br/>
                  • 导出您的数据 (Export your data)<br/>
                  • 撤回同意 (Withdraw consent)<br/>
                  • 限制数据处理 (Restrict data processing)<br/>
                  • 反对数据处理 (Object to data processing)
                </PixelText>
              </div>
            </section>

            {/* 未成年人保护 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 未成年人保护 / CHILDREN'S PRIVACY
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们的服务面向13岁及以上用户。如果您未满13岁，请在家长或监护人的监督下使用。
                  我们不会故意收集13岁以下儿童的个人信息。<br/><br/>
                  Our service is intended for users aged 13 and above. If you are under 13, 
                  please use our service under parental supervision. We do not knowingly 
                  collect personal information from children under 13.
                </PixelText>
              </div>
            </section>

            {/* 数据保留 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 数据保留 / DATA RETENTION
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们将保留您的个人信息，只要：<br/><br/>
                  • 您的账户处于活跃状态 (Your account is active)<br/>
                  • 提供服务所必需 (Necessary to provide services)<br/>
                  • 遵守法律义务 (Comply with legal obligations)<br/>
                  • 解决争议 (Resolve disputes)<br/><br/>
                  账户删除后，您的数据将在30天内永久删除（法律要求保留的除外）。
                </PixelText>
              </div>
            </section>

            {/* 政策更新 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 政策更新 / POLICY UPDATES
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  我们可能会不时更新本隐私政策。重大变更将通过电子邮件或游戏内通知告知您。
                  继续使用服务即表示您接受更新后的政策。<br/><br/>
                  We may update this Privacy Policy from time to time. Significant changes 
                  will be communicated via email or in-game notifications. Continued use of 
                  the service indicates acceptance of the updated policy.
                </PixelText>
              </div>
            </section>

            {/* 联系方式 */}
            <section>
              <PixelText style={{ fontSize: '24px', marginBottom: '15px' }}>
                ► 联系我们 / CONTACT US
              </PixelText>
              <div className="ml-4">
                <PixelText style={{ fontSize: '18px', opacity: 0.8, lineHeight: '1.8' }}>
                  如有任何隐私相关问题或请求，请联系我们：<br/><br/>
                  Email: privacy@realityeater.com<br/>
                  系统代码：PRIVACY-INQUIRY-2025<br/><br/>
                  我们将在30天内回复您的请求。
                </PixelText>
              </div>
            </section>

            {/* 同意声明 */}
            <section className="border-t-2 border-green-500 pt-6 mt-8">
              <PixelText style={{ fontSize: '20px', opacity: 0.9, lineHeight: '1.8' }}>
                使用REALITYEATER数字宠物系统，即表示您已阅读、理解并同意本隐私政策的所有条款。<br/><br/>
                By using the REALITYEATER Digital Pet System, you acknowledge that you have 
                read, understood, and agree to all terms of this Privacy Policy.
              </PixelText>
            </section>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '22px',
              letterSpacing: '2px',
              fontWeight: '700',
              boxShadow: '0 0 8px #00ff00',
            }}
          >
            ← BACK / 返回
          </button>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6">
          <PixelText style={{ fontSize: '14px', opacity: 0.5 }}>
            DIGITAL PET CODE WORLD v1.0 - PRIVACY POLICY
          </PixelText>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

