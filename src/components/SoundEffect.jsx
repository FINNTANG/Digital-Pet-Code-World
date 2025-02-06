import React, { useEffect, useRef } from 'react';

const SoundEffect = {
  // 预加载音频
  clickSound: new Audio('/dian.mp3'),
  closeSound: new Audio('/cha.mp3'),

  // 初始化
  init() {
    // 设置音量
    this.clickSound.volume = 0.5;
    this.closeSound.volume = 0.5;
    
    // 预加载
    this.clickSound.load();
    this.closeSound.load();
  },

  playClick: () => {
    // 创建新的音频实例以支持快速连续播放
    const clickSound = new Audio('/dian.mp3');
    clickSound.volume = 0.5;
    const playPromise = clickSound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Sound play failed:', error);
      });
    }
  },
  
  playClose: () => {
    // 创建新的音频实例以支持快速连续播放
    const closeSound = new Audio('/cha.mp3');
    closeSound.volume = 0.5;
    const playPromise = closeSound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Sound play failed:', error);
      });
    }
  }
};

// 初始化预加载
SoundEffect.init();

export default SoundEffect; 