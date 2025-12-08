import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailerRef = useRef(null);
  const [click, setClick] = useState(false);
  const [hover, setHover] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // 使用 ref 来存储当前位置，以便在 animation frame 中使用最新的值
  const mousePosition = useRef({ x: 0, y: 0 });
  const trailerPosition = useRef({ x: 0, y: 0 });

  // 检测是否为触摸设备
  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };
    setIsTouchDevice(checkTouchDevice());
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => setClick(true);
    const onMouseUp = () => setClick(false);

    const onMouseOver = (e) => {
      if (e.target.tagName === 'A' || 
          e.target.tagName === 'BUTTON' || 
          e.target.closest('a') || 
          e.target.closest('button') ||
          e.target.getAttribute('role') === 'button' ||
          e.target.classList.contains('interactive') ||
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.tagName === 'SELECT'
         ) {
        setHover(true);
      }
    };

    const onMouseOut = (e) => {
      if (e.target.tagName === 'A' || 
          e.target.tagName === 'BUTTON' || 
          e.target.closest('a') || 
          e.target.closest('button') ||
          e.target.getAttribute('role') === 'button' ||
          e.target.classList.contains('interactive') ||
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.tagName === 'SELECT'
         ) {
        setHover(false);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const animateTrailer = () => {
      const { x: targetX, y: targetY } = mousePosition.current;
      const { x: currentX, y: currentY } = trailerPosition.current;

      // 简单的线性插值 (Lerp) 实现平滑跟随
      const lerp = (start, end, factor) => start + (end - start) * factor;
      
      const newX = lerp(currentX, targetX, 0.15);
      const newY = lerp(currentY, targetY, 0.15);

      trailerPosition.current = { x: newX, y: newY };

      if (trailerRef.current) {
        trailerRef.current.style.transform = `translate(${newX}px, ${newY}px) translate(-50%, -50%)`;
      }
      
      if (cursorRef.current) {
         // 主光标直接跟随，不延迟
        cursorRef.current.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animateTrailer);
    };

    animateTrailer();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 如果是触摸设备，不渲染自定义光标
  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      <style>{`
        body, a, button, input, select, textarea, [role="button"] {
          cursor: none !important;
        }
        
        .custom-cursor {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          mix-blend-mode: exclusion;
        }

        .cursor-main {
          width: 8px;
          height: 8px;
          background-color: #00ff00;
          border-radius: 50%;
          transition: width 0.2s, height 0.2s, background-color 0.2s;
          box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
        }

        .cursor-trailer {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(0, 255, 0, 0.5);
          border-radius: 50%;
          transition: width 0.3s, height 0.3s, border-color 0.3s, background-color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* 装饰性的十字线 */
        .cursor-trailer::before, .cursor-trailer::after {
          content: '';
          position: absolute;
          background-color: rgba(0, 255, 0, 0.3);
          transition: all 0.3s;
        }
        
        .cursor-trailer::before {
          width: 100%;
          height: 1px;
          transform: scaleX(0);
        }
        
        .cursor-trailer::after {
          width: 1px;
          height: 100%;
          transform: scaleY(0);
        }

        /* 悬停状态 */
        .hover .cursor-main {
          width: 4px;
          height: 4px;
          background-color: #00ffff;
          box-shadow: 0 0 10px #00ffff;
        }

        .hover .cursor-trailer {
          width: 60px;
          height: 60px;
          border-color: #00ffff;
          background-color: rgba(0, 255, 255, 0.05);
          animation: rotate 4s linear infinite;
        }
        
        .hover .cursor-trailer::before {
          transform: scaleX(1);
          background-color: rgba(0, 255, 255, 0.3);
        }
        
        .hover .cursor-trailer::after {
          transform: scaleY(1);
          background-color: rgba(0, 255, 255, 0.3);
        }

        /* 点击状态 */
        .click .cursor-main {
          transform: translate(-50%, -50%) scale(0.5);
        }

        .click .cursor-trailer {
          transform: translate(-50%, -50%) scale(0.8);
          background-color: rgba(0, 255, 0, 0.2);
        }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(180deg); }
        }

      `}</style>
      
      {/* 主光标点 */}
      <div 
        ref={cursorRef} 
        className={`custom-cursor cursor-main ${hover ? 'hover' : ''} ${click ? 'click' : ''}`} 
      />
      
      {/* 跟随光标圈 */}
      <div 
        ref={trailerRef} 
        className={`custom-cursor cursor-trailer ${hover ? 'hover' : ''} ${click ? 'click' : ''}`}
      />
    </>
  );
};

export default CustomCursor;

