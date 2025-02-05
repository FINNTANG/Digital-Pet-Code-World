import React, { useEffect, useRef } from 'react';

const SoundEffect = {
  playClick: () => {
    const audio = new Audio('/dian.mp3');
    audio.volume = 0.5;
    audio.play();
  },
  
  playClose: () => {
    const audio = new Audio('/cha.mp3');
    audio.volume = 0.5;
    audio.play();
  }
};

export default SoundEffect; 