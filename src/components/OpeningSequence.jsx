import React, { useState, useEffect, useRef } from 'react';
import { setPetName } from '../utils/petState';
import { useNavigate } from 'react-router-dom';

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
        
        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px monospace`;
        
        for(let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i*fontSize, rainDrops[i]*fontSize);
          
          if(rainDrops[i]*fontSize > canvas.height && Math.random() > 0.975) {
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
        willChange: 'transform' // 优化渲染性能
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
      ...style
    }}
  >
    {children}
  </div>
);

const TypewriterText = ({ text, onComplete, delay = 100, className = '', showCursor = true, fadeOut = false }) => {
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
          : '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00'
      }}
    >
      <span className="typing-text">{displayText}</span>
      {showCursor && <span className={`typing-cursor ${fadeOut ? 'fade-out' : ''}`}></span>}
    </PixelStyleText>
  );
};

const OpeningSequence = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('title');
  const [showTitle, setShowTitle] = useState(true);
  const [petName, setPetNameState] = useState('');
  const [fadeOutTitle, setFadeOutTitle] = useState(false);
  const [fadeOutPrompt, setFadeOutPrompt] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleTitleComplete = () => {
    setFadeOutTitle(true);
    setTimeout(() => {
      setShowTitle(false);
      setPhase('naming');
      setShowPrompt(true);
      setPhase('input');
    }, 2000);
  };

  const handleSubmit = () => {
    if (petName.trim()) {
      setPetName(petName.trim());
      setFadeOutPrompt(true);
      setTimeout(() => {
        setPhase('play');
      }, 1000);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      <FontLoader />
      <MatrixRain />
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {showTitle && (
          <div 
            style={{
              padding: '20px 0',
              marginTop: '20px'
            }}
          >
            <TypewriterText 
              text="REALITYEATER"
              onComplete={handleTitleComplete}
              delay={200}
              className="font-bold"
              fadeOut={fadeOutTitle}
              style={{
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}
            />
          </div>
        )}

        {showPrompt && (
          <div className={`text-2xl mt-4 transition-opacity duration-1000 ${fadeOutPrompt ? 'opacity-0' : 'opacity-100'}`}>
            <PixelStyleText style={{
              textShadow: '0 0 2px #00ff00, 0 0 4px #00ff00',
              fontSize: '24px'
            }}>
              Please name your virtual pet...
            </PixelStyleText>
          </div>
        )}

        {phase === 'input' && (
          <div 
            className="flex flex-col items-center gap-6 mt-8"
            style={{
              animation: 'fadeIn 1s ease-out forwards',
            }}
          >
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetNameState(e.target.value)}
              placeholder="REALITYEATER"
              className="bg-black border-2 border-green-500 text-green-500 px-6 py-3 w-72 focus:outline-none"
              style={{
                fontFamily: "'VT323', monospace",
                boxShadow: '0 0 4px #00ff00',
                textShadow: '0 0 2px #00ff00',
                fontSize: '24px',
                letterSpacing: '2px',
                fontWeight: '700'
              }}
            />
            <button
              onClick={handleSubmit}
              className="mt-4 px-8 py-3 bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300"
              style={{
                fontFamily: "'VT323', monospace",
                boxShadow: '0 0 4px #00ff00',
                textShadow: '0 0 2px #00ff00',
                fontSize: '24px',
                letterSpacing: '2px',
                fontWeight: '700'
              }}
            >
              INITIALIZE
            </button>
          </div>
        )}

        {phase === 'play' && (
          <div style={{
            animation: 'fadeIn 1.5s ease-out forwards',
          }}>
            <button
              onClick={() => navigate('/game')}
              className="text-3xl px-12 py-4 bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 transform hover:scale-105"
              style={{
                fontFamily: "'VT323', monospace",
                boxShadow: '0 0 15px #00ff00',
                textShadow: '0 0 8px #00ff00',
                letterSpacing: '2px',
                fontWeight: '700'
              }}
            >
              PLAY
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .cursor {
          display: inline-block;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
        }
        
        @keyframes blink {
          from, to {
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

        /* 优化淡出动画曲线 */
        @keyframes fadeOut {
          from {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
            text-shadow: 0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00;
          }
          to {
            opacity: 0;
            filter: blur(2px);
            transform: scale(0.98);
            text-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default OpeningSequence; 