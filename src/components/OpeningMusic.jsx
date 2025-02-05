import React, { useEffect, useRef } from 'react';

const OpeningMusic = ({ isPlaying, onPlayComplete }) => {
  const audioRef = useRef(new Audio('/opening.mp3'));

  useEffect(() => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      // 设置音频属性
      audio.volume = 0.5;
      audio.loop = true; // 循环播放直到点击 Play
      
      // 尝试播放
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay prevented:", error);
          // 添加一个一次性点击事件来启动音频
          const startAudio = () => {
            audio.play();
            document.removeEventListener('click', startAudio);
          };
          document.addEventListener('click', startAudio);
        });
      }
    } else {
      // 如果 isPlaying 为 false，停止播放
      audio.pause();
      audio.currentTime = 0;
    }

    // 监听音频播放结束
    const handleEnded = () => {
      onPlayComplete && onPlayComplete();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, onPlayComplete]);

  return null;
};

export default OpeningMusic; 