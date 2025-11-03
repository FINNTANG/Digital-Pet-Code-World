import React, { useState, useEffect, useRef } from 'react';
import { setPetName, setPetInfo } from '../utils/petState';
import { useNavigate } from 'react-router-dom';
import SoundEffect from './SoundEffect';

// Add Google Font link for VT323
const FontLoader = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
    rel="stylesheet"
  />
);

const MatrixRain = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const katakana =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
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
    const columns = canvas.width / fontSize;
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
          const text = alphabet.charAt(
            Math.floor(Math.random() * alphabet.length),
          );
          ctx.fillStyle = `rgba(0, 255, 102, ${Math.random() * 0.4 + 0.7})`;
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (
            rainDrops[i] * fontSize > canvas.height &&
            Math.random() > 0.975
          ) {
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
        opacity: 0.28,
        willChange: 'transform',
      }}
    />
  );
};

const PixelStyleText = ({ children, className = '', style = {} }) => (
  <div
    className={`pixel-text ${className}`}
    style={{
      fontFamily: "'VT323', monospace",
      imageRendering: 'pixelated',
      textShadow: '0 0 3px #00ff00, 0 0 6px #00ff00',
      color: '#00ff00',
      fontWeight: '700',
      ...style,
    }}
  >
    {children}
  </div>
);

const TypewriterText = ({
  text,
  onComplete,
  delay = 100,
  className = '',
  showCursor = true,
  fadeOut = false,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        if (onComplete) {
          setTimeout(onComplete, 3000);
        }
      }
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay, onComplete]);

  return (
    <PixelStyleText
      className={`typewriter ${className}`}
      style={{
        letterSpacing: '2px',
        fontSize: '96px',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: fadeOut ? 0 : 1,
        filter: fadeOut ? 'blur(2px)' : 'blur(0)',
        transform: fadeOut ? 'scale(0.98)' : 'scale(1)',
        textShadow: fadeOut
          ? 'none'
          : '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00',
      }}
    >
      <span className="typing-text">{displayText}</span>
      {showCursor && (
        <span className={`typing-cursor ${fadeOut ? 'fade-out' : ''}`}></span>
      )}
    </PixelStyleText>
  );
};

const OpeningSequence = ({ onStartGame }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('title'); // title -> select -> naming -> ready
  const [selectedPet, setSelectedPet] = useState(null);
  const [customName, setCustomName] = useState('');
  const [fadeOutTitle, setFadeOutTitle] = useState(false);
  const [fadeOutPrompt, setFadeOutPrompt] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredPet, setHoveredPet] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  const pets = [
    {
      type: 'dog',
      displayName: 'Dog',
      traits: ['LOYAL', 'DEVOTED'],
      gifPath: '/pets/dog/idle.gif',
    },
    {
      type: 'fox',
      displayName: 'Fox',
      traits: ['CLEVER', 'SPIRITUAL'],
      gifPath: '/pets/fox/idle.gif',
    },
    {
      type: 'snake',
      displayName: 'Snake',
      traits: ['HEALING', 'MYSTERIOUS'],
      gifPath: '/pets/snake/idle.gif',
    },
  ];

  const handlePetSelect = (pet) => {
    if (!isTransitioning) {
      SoundEffect.playClick();
      setIsTransitioning(true);
      setSelectedPet(pet);
      setFadeOutPrompt(true);

      setTimeout(() => {
        setShowPrompt(false);
        setShowInput(false);
      }, 800);

      setTimeout(() => {
        setPhase('naming');
        setIsTransitioning(false);
      }, 1000);
    }
  };

  const handleNameSubmit = () => {
    if (customName.trim() && !isTransitioning) {
      SoundEffect.playClick();
      setIsTransitioning(true);
      
      // 保存宠物信息
      setPetName(customName.trim());
      setPetInfo({
        name: customName.trim(),
        type: selectedPet.type,
        traits: selectedPet.traits,
      });

      setTimeout(() => {
        setPhase('ready');
        setShowReady(true);
        setIsTransitioning(false);
      }, 400);
    }
  };

  const handleInitialize = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setFadeOutTitle(true);

      setTimeout(() => {
        setPhase('select');
        setShowInput(true);
        setShowPrompt(true);
        setIsTransitioning(false);
      }, 3000);
    }
  };

  const handlePlay = () => {
    if (selectedPet && customName.trim()) {
      SoundEffect.playClick();
      onStartGame();
      navigate('/game');
    }
  };

  // 初始化光标位置和聚焦
  useEffect(() => {
    if (phase === 'naming' && inputRef.current) {
      setCursorPosition(0);
      setIsInputFocused(false);
      // 确保输入框聚焦
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setIsInputFocused(true);
        }
      }, 100);
    }
  }, [phase]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
      <FontLoader />
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {/* Title Phase */}
        {phase === 'title' && (
          <div
            style={{
              padding: '20px 0',
              marginTop: '20px',
              opacity: fadeOutTitle ? 0 : 1,
              transition: 'opacity 3s ease-in-out',
            }}
          >
            <TypewriterText
              text="REALITYEATER"
              onComplete={handleInitialize}
              delay={200}
              className="font-bold"
            />
          </div>
        )}

        {/* Pet Selection Phase */}
        {showPrompt && phase === 'select' && (
          <div
            className={`text-2xl mt-4 mb-10 transition-all duration-700 ${
              fadeOutPrompt ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <PixelStyleText
              style={{
                textShadow: '0 0 8px rgba(255, 255, 255, 0.6), 0 0 15px #00ff00',
                fontSize: '40px',
                letterSpacing: '4px',
                color: '#ffffff',
              }}
            >
              Choose your virtual companion...
            </PixelStyleText>
          </div>
        )}

        {(showInput || fadeOutPrompt) && phase === 'select' && (
          <div
            className="flex flex-row items-start justify-center gap-16"
            style={{
              opacity: fadeOutPrompt ? 0 : 1,
              transform: fadeOutPrompt ? 'translateY(20px) scale(0.98)' : 'translateY(0) scale(1)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {pets.map((pet, index) => (
              <button
                key={pet.type}
                onClick={() => handlePetSelect(pet)}
                onMouseEnter={() => setHoveredPet(pet.type)}
                onMouseLeave={() => setHoveredPet(null)}
                className="group relative transition-all duration-300"
                style={{
                  fontFamily: "'VT323', monospace",
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  outline: 'none',
                  transform: hoveredPet === pet.type ? 'translateY(-8px) scale(1.08)' : 'translateY(0) scale(1)',
                  filter: hoveredPet === pet.type ? 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.4))' : 'none',
                  animation: `smoothFadeIn 0.8s ease-out ${index * 0.15}s both`,
                }}
              >
                {/* 电子宠物机外壳 */}
                <div
                  style={{
                    width: '280px',
                    height: '360px',
                    background: `
                      linear-gradient(135deg, 
                        rgba(0, 26, 0, 0.95) 0%, 
                        rgba(0, 51, 0, 1) 20%,
                        rgba(0, 51, 0, 1) 80%,
                        rgba(0, 26, 0, 0.95) 100%
                      )
                    `,
                    border: '4px solid #00ff00',
                    borderRadius: '50px 50px 30px 30px',
                    position: 'relative',
                    boxShadow: `
                      inset 3px 3px 8px rgba(0, 255, 0, 0.25),
                      inset -3px -3px 8px rgba(0, 80, 0, 0.6),
                      0 2px 0 rgba(0, 180, 0, 0.4),
                      0 8px 0 rgba(0, 100, 0, 0.6),
                      0 12px 25px rgba(0, 0, 0, 0.6),
                      0 0 0 1px rgba(0, 255, 0, 0.1)
                    `,
                  }}
                >
                  {/* 顶部挂绳孔 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '24px',
                      background: 'radial-gradient(circle at 35% 35%, #002200, #000800)',
                      border: '3px solid #00ff00',
                      borderRadius: '50%',
                      boxShadow: `
                        inset 0 3px 6px rgba(0, 0, 0, 0.9),
                        inset 0 -1px 2px rgba(0, 255, 0, 0.2),
                        0 2px 4px rgba(0, 0, 0, 0.5)
                      `,
                    }}
                  >
                    {/* 内圈孔洞效果 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '10px',
                        height: '10px',
                        background: '#000',
                        borderRadius: '50%',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 1)',
                      }}
                    />
                </div>

                  {/* 品牌标识 */}
                <div
                  style={{
                      position: 'absolute',
                      top: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '11px',
                      color: '#00ff00',
                      letterSpacing: '1px',
                      opacity: 0.7,
                      textShadow: '0 0 3px #00ff00',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    DIGITAL-PET™
                  </div>

                  {/* LCD屏幕区域 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '45px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '220px',
                      height: '200px',
                      background: `
                        linear-gradient(180deg, 
                          #8B9B7D 0%, 
                          #A8B89C 15%,
                          #B5C5A8 50%,
                          #A8B89C 85%,
                          #8B9B7D 100%
                        )
                      `,
                      border: '3px solid #00ff00',
                      borderRadius: '8px',
                      boxShadow: `
                        inset 3px 3px 6px rgba(0, 0, 0, 0.4),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.15),
                        0 0 12px rgba(0, 255, 0, 0.25),
                        0 2px 0 rgba(0, 150, 0, 0.3)
                      `,
                      overflow: 'hidden',
                    }}
                  >
                    {/* LCD扫描线效果 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.08) 2px, transparent 2px, transparent 4px)',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />

                    {/* 宠物类型标签 - 在屏幕顶部 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '24px',
                        color: '#1a1a1a',
                    letterSpacing: '2px',
                    fontWeight: '700',
                        textShadow: '1px 1px 0 rgba(255, 255, 255, 0.3)',
                        zIndex: 1,
                        whiteSpace: 'nowrap',
                  }}
                >
                      {pet.displayName.toUpperCase()}
                </div>

                    {/* 宠物GIF - 在屏幕中央 */}
                <div
                  style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={pet.gifPath}
                        alt={pet.displayName}
                        style={{
                          width: '140px',
                          height: '140px',
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                          filter: 'brightness(0.85) contrast(1.1)',
                        }}
                      />
                    </div>
                  </div>

                  {/* 装饰性按键 - 简洁单键设计 */}
                  <div
                      style={{
                      position: 'absolute',
                      bottom: '35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* 中央圆形按键 */}
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        background: 'radial-gradient(circle at 35% 35%, #004400, #001a00)',
                        border: '3px solid #00ff00',
                        borderRadius: '50%',
                        boxShadow: `
                          inset 0 3px 6px rgba(0, 0, 0, 0.7),
                          inset 0 -2px 4px rgba(0, 255, 0, 0.15),
                          0 3px 0 rgba(0, 120, 0, 0.6),
                          0 1px 0 rgba(0, 200, 0, 0.3)
                        `,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* 按键中心点 */}
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          background: 'radial-gradient(circle at 40% 40%, #00ff00, #00aa00)',
                          borderRadius: '50%',
                          boxShadow: `
                            0 0 4px rgba(0, 255, 0, 0.6),
                            0 0 8px rgba(0, 255, 0, 0.3),
                            inset 0 1px 2px rgba(255, 255, 255, 0.3)
                          `,
                        }}
                      />
                    </div>
                  </div>

                  {/* 选择提示 - 始终占位，控制可见性 */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '16px',
                      color: '#ffffff',
                      letterSpacing: '2px',
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 5px #00ff00',
                      whiteSpace: 'nowrap',
                      opacity: hoveredPet === pet.type ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    [ CLICK TO SELECT ]
                    </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Naming Phase */}
        {phase === 'naming' && selectedPet && (
          <div
            className="flex flex-col items-center gap-10"
            style={{
              animation: 'smoothFadeIn 0.8s ease-out forwards',
            }}
          >
            {/* Title */}
            <PixelStyleText
              style={{
                fontSize: '38px',
                letterSpacing: '3px',
                color: '#ffffff',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.5), 0 0 12px #00ff00',
              }}
            >
              You selected: {selectedPet.displayName.toUpperCase()}
            </PixelStyleText>

            {/* Selected Pet Display - 电子宠物机样式 */}
            <div
              style={{
                width: '280px',
                height: '320px',
                background: `
                  linear-gradient(135deg, 
                    rgba(0, 26, 0, 0.95) 0%, 
                    rgba(0, 51, 0, 1) 20%,
                    rgba(0, 51, 0, 1) 80%,
                    rgba(0, 26, 0, 0.95) 100%
                  )
                `,
                border: '4px solid #00ff00',
                borderRadius: '50px 50px 30px 30px',
                position: 'relative',
                boxShadow: `
                  inset 3px 3px 8px rgba(0, 255, 0, 0.25),
                  inset -3px -3px 8px rgba(0, 80, 0, 0.6),
                  0 2px 0 rgba(0, 180, 0, 0.4),
                  0 8px 0 rgba(0, 100, 0, 0.6),
                  0 12px 25px rgba(0, 0, 0, 0.6)
                `,
              }}
            >
              {/* 顶部挂绳孔 */}
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '24px',
                  background: 'radial-gradient(circle at 35% 35%, #002200, #000800)',
                  border: '3px solid #00ff00',
                  borderRadius: '50%',
                  boxShadow: `
                    inset 0 3px 6px rgba(0, 0, 0, 0.9),
                    inset 0 -1px 2px rgba(0, 255, 0, 0.2),
                    0 2px 4px rgba(0, 0, 0, 0.5)
                  `,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    background: '#000',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 1)',
                  }}
                />
              </div>

              {/* 品牌标识 */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#00ff00',
                  letterSpacing: '0.5px',
                  opacity: 0.7,
                  textShadow: '0 0 3px #00ff00',
                  whiteSpace: 'nowrap',
                }}
              >
                DIGITAL-PET™
              </div>

              {/* LCD屏幕 */}
              <div
                style={{
                  position: 'absolute',
                  top: '45px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '220px',
                  height: '200px',
                  background: `
                    linear-gradient(180deg, 
                      #8B9B7D 0%, 
                      #A8B89C 15%,
                      #B5C5A8 50%,
                      #A8B89C 85%,
                      #8B9B7D 100%
                    )
                  `,
                  border: '3px solid #00ff00',
                  borderRadius: '8px',
                  boxShadow: `
                    inset 3px 3px 6px rgba(0, 0, 0, 0.4),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.15),
                    0 0 12px rgba(0, 255, 0, 0.25)
                  `,
                  overflow: 'hidden',
                }}
              >
                {/* LCD扫描线 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.08) 2px, transparent 2px, transparent 4px)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />

                {/* 宠物类型 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '22px',
                    color: '#1a1a1a',
                    letterSpacing: '2px',
                    fontWeight: '700',
                    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.3)',
                    zIndex: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedPet.displayName.toUpperCase()}
                </div>

                {/* 宠物GIF */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <img
                    src={selectedPet.gifPath}
                    alt={selectedPet.displayName}
                    style={{
                      width: '140px',
                      height: '140px',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      filter: 'brightness(0.85) contrast(1.1)',
                    }}
                  />
                </div>
              </div>

              {/* 装饰按键 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  style={{
                    width: '45px',
                    height: '45px',
                    background: 'radial-gradient(circle at 35% 35%, #004400, #001a00)',
                    border: '3px solid #00ff00',
                    borderRadius: '50%',
                    boxShadow: `
                      inset 0 3px 6px rgba(0, 0, 0, 0.7),
                      inset 0 -2px 4px rgba(0, 255, 0, 0.15),
                      0 3px 0 rgba(0, 120, 0, 0.6)
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      background: 'radial-gradient(circle at 40% 40%, #00ff00, #00aa00)',
                      borderRadius: '50%',
                      boxShadow: `
                        0 0 4px rgba(0, 255, 0, 0.6),
                        0 0 8px rgba(0, 255, 0, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Name Input Section */}
            <div className="flex flex-col items-center gap-6 mt-4">
              <PixelStyleText
                style={{
                  fontSize: '32px',
                  letterSpacing: '2px',
                  textShadow: '0 0 2px #00ff00',
                }}
              >
                Enter a name for your companion:
              </PixelStyleText>

              <div className="pixel-input-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (e.target.selectionStart !== null) {
                      setCursorPosition(e.target.selectionStart);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSubmit();
                    }
                  }}
                  onClick={(e) => {
                    if (e.target.selectionStart !== null) {
                      setCursorPosition(e.target.selectionStart);
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.target.selectionStart !== null) {
                      setCursorPosition(e.target.selectionStart);
                    }
                  }}
                  maxLength={20}
                  placeholder="Type name here..."
                  autoFocus
                  className="px-6 py-4 bg-black text-green-500 text-center focus:outline-none transition-all duration-200"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '36px',
                    letterSpacing: '3px',
                    fontWeight: '700',
                    minWidth: '450px',
                    border: '3px solid #00ff00',
                    caretColor: 'transparent',
                    boxShadow: `
                      inset 2px 2px 0 rgba(0, 100, 0, 0.5),
                      inset -2px -2px 0 rgba(0, 255, 0, 0.3),
                      0 0 20px rgba(0, 255, 0, 0.1)
                    `,
                  }}
                  onFocus={(e) => {
                    setIsInputFocused(true);
                    e.target.style.boxShadow = `
                      inset 2px 2px 0 rgba(0, 100, 0, 0.5),
                      inset -2px -2px 0 rgba(0, 255, 0, 0.3),
                      0 0 30px rgba(0, 255, 0, 0.2)
                    `;
                  }}
                  onBlur={(e) => {
                    setIsInputFocused(false);
                    e.target.style.boxShadow = `
                      inset 2px 2px 0 rgba(0, 100, 0, 0.5),
                      inset -2px -2px 0 rgba(0, 255, 0, 0.3),
                      0 0 20px rgba(0, 255, 0, 0.1)
                    `;
                  }}
                />
                {/* 像素风格光标 */}
                {isInputFocused && (
                  <div
                    className="pixel-cursor"
                    style={{
                      left: customName.length === 0 
                        ? '50%' 
                        : `calc(50% + ${(cursorPosition - customName.length / 2) * 21.6}px)`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>

              <button
                onClick={handleNameSubmit}
                disabled={!customName.trim()}
                className="px-12 py-3 text-3xl transition-all duration-200 transform disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'VT323', monospace",
                  letterSpacing: '3px',
                  fontWeight: '700',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  color: '#00ff00',
                  border: '3px solid #00ff00',
                  boxShadow: customName.trim() 
                    ? `
                      inset 2px 2px 0 rgba(0, 255, 0, 0.6),
                      inset -2px -2px 0 rgba(0, 100, 0, 0.8),
                      4px 4px 0 rgba(0, 100, 0, 0.4)
                    `
                    : 'none',
                  cursor: customName.trim() ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (customName.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `
                      inset 2px 2px 0 rgba(0, 255, 0, 0.8),
                      inset -2px -2px 0 rgba(0, 100, 0, 1),
                      6px 6px 0 rgba(0, 100, 0, 0.5),
                      0 0 25px rgba(0, 255, 0, 0.2)
                    `;
                  }
                }}
                onMouseLeave={(e) => {
                  if (customName.trim()) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `
                      inset 2px 2px 0 rgba(0, 255, 0, 0.6),
                      inset -2px -2px 0 rgba(0, 100, 0, 0.8),
                      4px 4px 0 rgba(0, 100, 0, 0.4)
                    `;
                  }
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}

        {/* Ready Phase */}
        {phase === 'ready' && !isTransitioning && showReady && (
          <div
            className="flex flex-col items-center gap-10"
            style={{
              animation: 'smoothFadeIn 0.8s ease-out forwards',
            }}
          >
            <PixelStyleText
              style={{
                fontSize: '50px',
                letterSpacing: '4px',
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px #00ff00, 0 0 35px rgba(0, 255, 0, 0.5)',
              }}
            >
              Welcome
            </PixelStyleText>

            {/* Final Pet Display - 电子宠物机样式 */}
            <div
              style={{
                width: '300px',
                height: '340px',
                background: `
                  linear-gradient(135deg, 
                    rgba(0, 26, 0, 0.95) 0%, 
                    rgba(0, 51, 0, 1) 20%,
                    rgba(0, 51, 0, 1) 80%,
                    rgba(0, 26, 0, 0.95) 100%
                  )
                `,
                border: '4px solid #00ff00',
                borderRadius: '50px 50px 30px 30px',
                position: 'relative',
                boxShadow: `
                  inset 3px 3px 8px rgba(0, 255, 0, 0.25),
                  inset -3px -3px 8px rgba(0, 80, 0, 0.6),
                  0 2px 0 rgba(0, 180, 0, 0.4),
                  0 8px 0 rgba(0, 100, 0, 0.6),
                  0 12px 25px rgba(0, 0, 0, 0.6),
                  0 0 30px rgba(0, 255, 0, 0.2)
                `,
              }}
            >
              {/* 顶部挂绳孔 */}
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '24px',
                  background: 'radial-gradient(circle at 35% 35%, #002200, #000800)',
                  border: '3px solid #00ff00',
                  borderRadius: '50%',
                  boxShadow: `
                    inset 0 3px 6px rgba(0, 0, 0, 0.9),
                    inset 0 -1px 2px rgba(0, 255, 0, 0.2),
                    0 2px 4px rgba(0, 0, 0, 0.5)
                  `,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    background: '#000',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 1)',
                  }}
                />
              </div>

              {/* 品牌标识 */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#00ff00',
                  letterSpacing: '0.5px',
                  opacity: 0.7,
                  textShadow: '0 0 3px #00ff00',
                  whiteSpace: 'nowrap',
                }}
              >
                DIGITAL-PET™
              </div>

              {/* LCD屏幕 */}
              <div
                style={{
                  position: 'absolute',
                  top: '45px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '240px',
                  height: '220px',
                  background: `
                    linear-gradient(180deg, 
                      #8B9B7D 0%, 
                      #A8B89C 15%,
                      #B5C5A8 50%,
                      #A8B89C 85%,
                      #8B9B7D 100%
                    )
                  `,
                  border: '3px solid #00ff00',
                  borderRadius: '8px',
                  boxShadow: `
                    inset 3px 3px 6px rgba(0, 0, 0, 0.4),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.15),
                    0 0 15px rgba(0, 255, 0, 0.3)
                  `,
                  overflow: 'hidden',
                }}
              >
                {/* LCD扫描线 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.08) 2px, transparent 2px, transparent 4px)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />

                {/* 宠物类型和名字 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '20px',
                    color: '#1a1a1a',
                    letterSpacing: '1px',
                    fontWeight: '700',
                    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.3)',
                    zIndex: 1,
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    padding: '0 10px',
                  }}
                >
                  {customName}
                </div>

                {/* 宠物GIF */}
                <div
                  style={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <img
                    src={selectedPet.gifPath}
                    alt={selectedPet.displayName}
                    style={{
                      width: '160px',
                      height: '160px',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      filter: 'brightness(0.85) contrast(1.1)',
                    }}
                  />
                </div>
              </div>

              {/* 装饰按键 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'radial-gradient(circle at 35% 35%, #004400, #001a00)',
                    border: '3px solid #00ff00',
                    borderRadius: '50%',
                    boxShadow: `
                      inset 0 3px 6px rgba(0, 0, 0, 0.7),
                      inset 0 -2px 4px rgba(0, 255, 0, 0.15),
                      0 3px 0 rgba(0, 120, 0, 0.6),
                      0 0 8px rgba(0, 255, 0, 0.2)
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      background: 'radial-gradient(circle at 40% 40%, #00ff00, #00aa00)',
                      borderRadius: '50%',
                      boxShadow: `
                        0 0 4px rgba(0, 255, 0, 0.6),
                        0 0 10px rgba(0, 255, 0, 0.4),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePlay}
              className="px-20 py-4 text-4xl transition-all duration-200 transform hover:scale-105 mt-6"
              style={{
                fontFamily: "'VT323', monospace",
                letterSpacing: '5px',
                fontWeight: '700',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: '#00ff00',
                border: '3px solid #00ff00',
                cursor: 'pointer',
                boxShadow: `
                  inset 2px 2px 0 rgba(0, 255, 0, 0.6),
                  inset -2px -2px 0 rgba(0, 100, 0, 0.8),
                  5px 5px 0 rgba(0, 100, 0, 0.4),
                  0 0 30px rgba(0, 255, 0, 0.2)
                `,
                animation: 'buttonPulse 2s ease-in-out infinite',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `
                  inset 2px 2px 0 rgba(0, 255, 0, 0.8),
                  inset -2px -2px 0 rgba(0, 100, 0, 1),
                  7px 7px 0 rgba(0, 100, 0, 0.5),
                  0 0 45px rgba(0, 255, 0, 0.35)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                  inset 2px 2px 0 rgba(0, 255, 0, 0.6),
                  inset -2px -2px 0 rgba(0, 100, 0, 0.8),
                  5px 5px 0 rgba(0, 100, 0, 0.4),
                  0 0 30px rgba(0, 255, 0, 0.2)
                `;
              }}
            >
              START
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`

        @keyframes smoothFadeIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes buttonPulse {
          0%, 100% {
            box-shadow: 
              inset 2px 2px 0 rgba(0, 255, 0, 0.6),
              inset -2px -2px 0 rgba(0, 100, 0, 0.8),
              5px 5px 0 rgba(0, 100, 0, 0.4),
              0 0 30px rgba(0, 255, 0, 0.2);
          }
          50% {
            box-shadow: 
              inset 2px 2px 0 rgba(0, 255, 0, 0.7),
              inset -2px -2px 0 rgba(0, 100, 0, 0.9),
              5px 5px 0 rgba(0, 100, 0, 0.4),
              0 0 40px rgba(0, 255, 0, 0.3);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .cursor {
          display: inline-block;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from,
          to {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .complete {
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
          }
          to {
            text-shadow: 0 0 15px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00;
          }
        }

        .pixel-text {
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: none;
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .typewriter .typing-text {
          display: inline-block;
          overflow: visible;
          white-space: nowrap;
          font-size: 96px;
          line-height: 1;
          vertical-align: middle;
          position: relative;
          z-index: 1;
        }

        .typing-cursor {
          display: inline-block;
          width: 12px;
          height: 96px;
          margin-left: 8px;
          background-color: #00ff66;
          animation: blink 1s step-end infinite;
          position: relative;
          vertical-align: middle;
          margin-bottom: 20px;
          margin-top: -32px;
          box-shadow: 0 0 6px #00ff66;
          z-index: 1;
          transition: all 2.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .typing-cursor.fade-out {
          opacity: 0;
          filter: blur(2px);
          transform: scale(0.98);
          box-shadow: none;
        }

        .blur-sm {
          filter: blur(4px);
        }

        .ease-in-out {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom placeholder style - 更暗更柔和 */
        input::placeholder {
          color: rgba(0, 255, 0, 0.2);
          opacity: 1;
          font-weight: 400;
        }

        /* Remove default focus outline */
        input:focus {
          outline: none;
        }

        /* 像素风格光标 - 隐藏默认光标 */
        input[type="text"] {
          caret-color: transparent;
          position: relative;
        }

        /* 自定义像素光标闪烁动画 */
        @keyframes pixelCursorBlink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }

        /* 像素光标容器 */
        .pixel-input-wrapper {
          position: relative;
          display: inline-block;
        }

        /* 像素光标样式 - 更方正更像素化 */
        .pixel-cursor {
          position: absolute;
          width: 4px;
          height: 36px;
          background-color: #00ff00;
          box-shadow: 0 0 6px rgba(0, 255, 0, 0.8), 0 0 10px rgba(0, 255, 0, 0.4);
          animation: pixelCursorBlink 1s step-end infinite;
          pointer-events: none;
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: none;
        }

        /* Smooth transitions for all interactive elements */
        button, input {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default OpeningSequence;
