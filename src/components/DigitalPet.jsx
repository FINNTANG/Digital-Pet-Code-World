import React, { useState, useEffect, useRef, useCallback } from 'react';
import petState from '../utils/petState.jsx';
import { getRandomDialogue } from '../utils/dialogueSystem.jsx';
import { chat } from '../api/chat.js';
import chatMessage from '../utils/chatGenerate.js';
import '../styles/Pet.css';
import { HintWindow } from './ui/hint';
import BackgroundMusic from './BackgroundMusic';
import { getPetName, getPetType, getPetTraits } from '../utils/petState';
import SoundEffect from './SoundEffect';

// 在文件顶部添加宠物类型常量
const PET_TYPES = {
  DOG: 'dog',
  FOX: 'fox',
  SNAKE: 'snake',
};

const PET_WEIGHTS = {
  [PET_TYPES.DOG]: 0.4, // 40% 概率
  [PET_TYPES.FOX]: 0.4, // 40% 概率
  [PET_TYPES.SNAKE]: 0.2, // 20% 概率
};

// 修改随机选择宠物类型的函数，使其更可靠
const getRandomPetType = () => {
  const random = Math.random();

  if (random < 0.4) {
    return PET_TYPES.DOG; // 0-0.4 (40%)
  } else if (random < 0.8) {
    return PET_TYPES.FOX; // 0.4-0.8 (40%)
  } else {
    return PET_TYPES.SNAKE; // 0.8-1.0 (20%)
  }
};

const DigitalPet = () => {
  const [dialogue, setDialogue] = useState(null);
  const [status, setStatus] = useState(petState.state);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [currentSprite, setCurrentSprite] = useState('');
  const [dialoguePosition, setDialoguePosition] = useState(() => {
    const initialX = (window.innerWidth - 500) / 2;
    const initialY = window.innerHeight - 400;
    return { x: initialX, y: initialY };
  });
  const [activeWindow, setActiveWindow] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [windowPositions, setWindowPositions] = useState({
    camera: { x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 300 },
    chat: { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 },
    hint: { x: window.innerWidth / 2 - 225, y: window.innerHeight / 2 - 175 },
    persist: {
      x: window.innerWidth / 2 - 200, // 水平居中
      y: window.innerHeight / 2 + 50, // 在宠物窗口下方显示
    },
    analysis: {
      x: window.innerWidth / 2 - 200,
      y: window.innerHeight / 2 - 150,
    },
  });
  const dialogueRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [cameraPosition, setCameraPosition] = useState(() => ({
    x: (window.innerWidth - 800) / 2, // 800是相机窗口的最大宽度
    y: 100, // 设置一个合适的初始Y位置
  }));
  const [cameraIsDragging, setCameraIsDragging] = useState(false);
  const [cameraDragOffset, setCameraDragOffset] = useState({ x: 0, y: 0 });
  const cameraRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(new Audio('./background-music.mp3')); // 使用正确的文件路径
  const [draggedWindow, setDraggedWindow] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const [isTypingHint, setIsTypingHint] = useState(false);
  const [displayedHint, setDisplayedHint] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPersistMessage, setShowPersistMessage] = useState(false);
  const [persistMessage, setPersistMessage] = useState('');
  const [isTypingPersist, setIsTypingPersist] = useState(false);
  const [isApiCalling, setIsApiCalling] = useState(false);
  const apiTimeoutRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // 从 petState 获取用户选择的宠物类型
  const [petType, setPetType] = useState(() => {
    const selectedPetType = getPetType();
    // 如果用户已选择宠物，使用选择的类型；否则使用默认值
    return selectedPetType || PET_TYPES.DOG;
  });

  // 获取宠物属性
  const petTraits = getPetTraits() || [];

  // 修改提示信息为更简洁的版本
  const hintMessage = `[ DIGITAL PET GUIDE ]

❤️ Health & Mood
• Both stats decrease over time
• Keep them above 30% to avoid distress

🎮 Controls
• FEED - Show objects via camera
• TALK - Chat with your pet

💡 Tips
• Different items = Different reactions
• Regular chats = Happy pet
• Low stats = Sad expressions

Have fun with your new digital friend! ✨`;

  // 修改相机权限的处理
  useEffect(() => {
    // 在组件加载时就请求相机权限
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // 立即停止流，我们只是想获取权限
            stream.getTracks().forEach((track) => track.stop());
            setCameraPermission('granted');
          });
      } catch (err) {
        console.error('Camera permission denied:', err);
        setCameraPermission('denied');
      }
    };

    requestCameraPermission();
  }, []); // 只在组件挂载时执行一次

  // 清理摄像头资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 修改状态更新的 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      // 更新状态值但不低于0
      petState.health = Math.max(0, petState.health - 1);
      petState.happiness = Math.max(0, petState.happiness - 1);
      petState.updateState();
      setStatus(petState.state);

      // 根据状态更新宠物显示
      let newSprite;
      // 当任一状态为0时就触发游戏结束
      if (petState.health <= 0 || petState.happiness <= 0) {
        setIsGameOver(true);
      } else if (petState.health <= 30 || petState.happiness <= 30) {
        // 当任一状态低于30时随机显示 sick 或 sad 动画
        newSprite = {
          src: `/sprites/${petType}/${
            Math.random() < 0.5 ? 'sick' : 'sad'
          }.gif`,
          size: '200px',
        };
      } else {
        // 正常状态的宠物
        newSprite = {
          src: `/sprites/${petType}/normal.gif`,
          size: '200px',
        };
      }

      if (newSprite) {
        // 确保只在有有效的精灵时更新
        setCurrentSprite(newSprite);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [petType]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
        setShowCamera(true);
        setCapturedImage(null);

        // 修改这里：设置固定的初始位置
        const windowWidth = 1000;
        const mainContainer = document.querySelector('.pet-container');
        const mainRect = mainContainer.getBoundingClientRect();

        setCameraPosition({
          x: mainRect.left + (mainRect.width - windowWidth) / 2 + 150,
          y: 150, // 使用固定的 y 值，而不是相对于 mainRect.top 的值
        });
      }
    } catch (err) {
      console.error('摄像头启动失败:', err);
      alert('无法启动摄像头，请确保允许摄像头访问权限');
    }
  };

  const LoadingIndicator = () => (
    <div className="loading-indicator">
      <span className="thinking-emoji">🤔</span>
      <span>Thinking</span>
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    streamRef.current = null;
    setIsCameraActive(false);
    setShowCamera(false);
  };

  const captureImage = async () => {
    // 如果正在进行 API 调用，直接返回
    if (isApiCalling) {
      setPersistMessage(
        'Please wait a moment before making another request...',
      );
      setShowPersistMessage(true);
      setTimeout(() => setShowPersistMessage(false), 3000);
      return;
    }

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);

      try {
        stopCamera();
        setIsAnalyzing(true);
        setIsApiCalling(true);

        // 设置 API 超时
        apiTimeoutRef.current = setTimeout(() => {
          setIsApiCalling(false);
          setAnalysisResult({
            message:
              '<div class="text-red-500">Request timeout. Please try again.</div>',
          });
          setIsAnalyzing(false);
        }, 20000); // 改为20秒超时

        // 立即显示分析窗口
        setAnalysisResult({
          message: '<span class="loading-text">ANALYZING...</span>',
        });
        setShowAnalysis(true);

        // 保存当前状态用于计算变化量
        const currentHealth = petState.health;
        const currentHappiness = petState.happiness;

        // 使用 chat API 替换 analyzeImage
        const response = await chat({
          message: 'Analyze this image and tell me what you see',
          session_id: 'feed_session',
          pet_type: petType,
          health: currentHealth,
          happiness: currentHappiness,
          image_data: imageData,
        });

        clearTimeout(apiTimeoutRef.current);

        console.log(response, 'response');

        // 适配 chat API 的返回格式为 analyzeImage 格式
        const result = {
          result: response.status === 'success' && response.data?.result,
          name: response.data?.ai_response || 'Unknown item',
          isLike: response.data?.mood >= currentHappiness,
          reason: response.data?.ai_response || '',
          healthEffect:
            (response.data?.health || currentHealth) - currentHealth,
          moodEffect:
            (response.data?.mood || currentHappiness) - currentHappiness,
        };

        if (result.result) {
          // 更新宠物状态（使用 API 返回的新值）
          petState.health = Math.min(100, Math.max(0, response.data.health));
          petState.happiness = Math.min(100, Math.max(0, response.data.mood));
          setStatus(petState.state);

          // 构建分析结果消息
          const analysisText = [
            `<div class="text-white analysis-line">Content: ${result.name}</div>`,
            `<div class="analysis-line ${
              result.isLike ? 'text-green-500' : 'text-red-500'
            }">Status: ${
              result.isLike ? 'I like it!' : "I don't like it..."
            }</div>`,
            `<div class="analysis-line">Reason: ${result.reason}</div>`,
            `<div class="analysis-line">Effects:</div>`,
            `<div class="analysis-line ${
              result.moodEffect >= 0 ? 'text-green-500' : 'text-red-500'
            }">Mood: ${result.moodEffect >= 0 ? '+' : ''}${
              result.moodEffect
            }</div>`,
            `<div class="analysis-line ${
              result.healthEffect >= 0 ? 'text-green-500' : 'text-red-500'
            }">Health: ${result.healthEffect >= 0 ? '+' : ''}${
              result.healthEffect
            }</div>`,
          ];

          // 使用打字机效果显示内容
          const typeAnalysis = async () => {
            setAnalysisResult({ message: '' });
            for (const line of analysisText) {
              await new Promise((resolve) => setTimeout(resolve, 800)); // 增加每行之间的延迟
              setAnalysisResult((prev) => ({
                message: prev.message + line,
              }));
            }
          };

          // 开始打字效果
          typeAnalysis();
        }
      } catch (error) {
        console.error('Image analysis failed:', error);
        setAnalysisResult({
          message:
            '<div class="text-red-500">Analysis failed. Please try again.</div>',
        });
      } finally {
        setIsAnalyzing(false);
        setIsApiCalling(false);
        clearTimeout(apiTimeoutRef.current);
      }
    }
  };

  // 修改 typeMessage 函数
  const typeMessage = async (message) => {
    setIsTyping(true);
    let displayText = '';
    for (let i = 0; i < message.length; i++) {
      displayText += message[i];
      setDisplayedMessage(displayText);
      await new Promise((resolve) => setTimeout(resolve, 50)); // 控制打字速度
    }
    setIsTyping(false);
  };

  const handleChat = () => {
    setShowChat(true);

    // 根据不同宠物类型生成不同的初始对话
    let initialMessage;
    switch (petType) {
      case 'dog':
        initialMessage = `*Wags tail excitedly* Woof! I'm ${petState.happiness}% happy and ${petState.health}% healthy. Ready for fun? =)`;
        break;
      case 'fox':
        initialMessage = `*Flicks tail mischievously* Hey! ${petState.happiness}% joy and ${petState.health}% vigor here. What's the plan? =)`;
        break;
      case 'snake':
        initialMessage = `*Sways smoothly* Greetingsss! Feeling ${petState.happiness}% cheerful and ${petState.health}% vital. Shall we chat? =)`;
        break;
      default:
        initialMessage = `*Greets happily* Hey there! I'm ${petState.happiness}% happy and ${petState.health}% healthy. What's up? =)`;
    }

    const initialDialogue = {
      message: initialMessage,
      options: [
        'How are you feeling?',
        'Want to play a game?',
        'Tell me about yourself',
      ],
    };

    setDialogue(initialDialogue);
    typeMessage(initialDialogue.message);
  };

  const handleResponse = async (option) => {
    if (isWaitingResponse) return;

    setIsWaitingResponse(true);
    setDisplayedMessage('Thinking about your message');

    try {
      // 调用 chatMessage，它返回：
      // - result: 是否成功
      // - message: 宠物的回复消息
      // - options: 用户可选的回复选项
      // - health: 健康值变化量 (delta)
      // - mood: 快乐值变化量 (delta)
      const response = await chatMessage(
        petState.health,
        petState.happiness,
        option,
        petType,
      );

      console.log(response, 'response');

      if (response.result) {
        // 设置对话内容和选项
        setDialogue({
          message: response.message,
          options: response.options,
        });
        typeMessage(response.message);

        // 更新宠物状态（response.health和response.mood是变化量）
        // 确保值在 0-100 范围内
        petState.health = Math.max(0, response.health);
        petState.happiness = Math.max(0, response.mood);
        petState.updateState();
        setStatus(petState.state);
      } else {
        // API 调用失败时的备用回答
        const fallbackResponses = [
          {
            message:
              "Oh! I got a bit distracted there. But I'm always happy to chat!",
            options: [
              'Tell me about your day',
              "What's your favorite activity?",
              "Let's try something else",
            ],
            health: 5,
            mood: 5,
          },
          {
            message: 'Hmm... I was daydreaming! What were we talking about?',
            options: [
              'Want to play a game?',
              'How are you feeling?',
              'Tell me a story',
            ],
            health: 5,
            mood: 5,
          },
          {
            message: 'Sorry, I was chasing a virtual butterfly! Back now!',
            options: [
              'That sounds fun!',
              'What else do you like to do?',
              "Let's chat more",
            ],
            health: 5,
            mood: 5,
          },
        ];

        // 随机选择一个备用回答
        const fallbackResponse =
          fallbackResponses[
            Math.floor(Math.random() * fallbackResponses.length)
          ];
        setDialogue(fallbackResponse);
        typeMessage(fallbackResponse.message);

        // 使用备用回答的状态更新
        petState.health = Math.max(
          0,
          Math.min(100, petState.health + fallbackResponse.health),
        );
        petState.happiness = Math.max(
          0,
          Math.min(100, petState.happiness + fallbackResponse.mood),
        );
        petState.updateState();
        setStatus(petState.state);
      }
    } catch (error) {
      console.error('Response error:', error);
      // 发生错误时也使用备用回答系统
      const errorResponse = {
        message: "Oops! My virtual brain had a hiccup. But I'm still here!",
        options: [
          "No worries, let's continue",
          'Tell me something fun',
          'How are you doing?',
        ],
        health: 5,
        mood: 5,
      };

      setDialogue(errorResponse);
      typeMessage(errorResponse.message);

      // 使用错误回答的状态更新
      petState.health = Math.max(
        0,
        Math.min(100, petState.health + errorResponse.health),
      );
      petState.happiness = Math.max(
        0,
        Math.min(100, petState.happiness + errorResponse.mood),
      );
      petState.updateState();
      setStatus(petState.state);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  // 修改获取宠物精灵的函数
  const getPetSprite = (status) => {
    const basePath = `/pets/${petType}/`;

    // 根据宠物类型调整显示大小
    const getSize = () => {
      switch (petType) {
        case PET_TYPES.SNAKE:
          return '140px';
        case PET_TYPES.FOX:
          return '140px';
        case PET_TYPES.DOG:
        default:
          return '140px';
      }
    };

    // 所有宠物都使用相同的 happy 状态逻辑
    const getHappySprite = () => {
      const happyVariants = ['happy', 'happy2', 'happy3'];
      return `${happyVariants[Math.floor(Math.random() * 3)]}.gif`;
    };

    // 在渲染部分使用动态尺寸
    return {
      src:
        status === 'happy'
          ? `${basePath}${getHappySprite()}`
          : `${basePath}${status === 'normal' ? 'idle' : status}.gif`,
      size: getSize(),
    };
  };

  // 修改宠物窗口标题
  const getPetTitle = () => {
    const name = getPetName() || 'REALITYEATER';
    const type = petType.toUpperCase();
    return `${name}.EXE`;
  };

  useEffect(() => {
    setCurrentSprite(getPetSprite(status));
  }, [status, petState.health, petState.happiness, petType]);

  // 在组件顶部添加装饰点生成函数
  const generatePixelDots = () => {
    const dots = [];
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        '--float-duration': `${3 + Math.random() * 2}s`,
        '--float-delay': `-${Math.random() * 2}s`,
      };
      dots.push(<div key={i} className="pixel-dot" style={style} />);
    }
    return dots;
  };

  // 修改拖拽相关的状态和逻辑
  const handleMouseDown = (e, windowType) => {
    // 只有点击工具栏才能拖动
    if (e.target.closest('.window-close')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedWindow(windowType);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // 存储初始位置
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (draggedWindow && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        // 添加边界限制
        const newX = Math.max(
          0,
          Math.min(
            window.innerWidth - 400,
            dragRef.current.initialLeft + deltaX,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            window.innerHeight - 300,
            dragRef.current.initialTop + deltaY,
          ),
        );

        setWindowPositions((prev) => ({
          ...prev,
          [draggedWindow]: {
            x: newX,
            y: newY,
          },
        }));
      }
    },
    [draggedWindow],
  );

  const handleMouseUp = useCallback(() => {
    setDraggedWindow(null);
    dragRef.current = null;
  }, []);

  // 确保关闭按钮正常工作
  const handleClose = (windowType) => {
    SoundEffect.playClose(); // 播放关闭音效
    if (windowType === 'camera') {
      stopCamera();
      setShowCamera(false);
    } else if (windowType === 'chat') {
      setShowChat(false);
    } else if (windowType === 'hint') {
      setShowHint(false);
    } else if (windowType === 'analysis') {
      setShowAnalysis(false);
    } else if (windowType === 'persist') {
      setShowPersistMessage(false);
    }
    // 清除该窗口的位置信息
    setWindowPositions((prev) => ({
      ...prev,
      [windowType]: {
        x:
          window.innerWidth / 2 -
          (windowType === 'camera'
            ? 400
            : windowType === 'chat'
            ? 250
            : windowType === 'hint'
            ? 225
            : windowType === 'persist'
            ? 200
            : 150),
        y:
          window.innerHeight / 2 -
          (windowType === 'camera'
            ? 300
            : windowType === 'chat'
            ? 200
            : windowType === 'hint'
            ? 175
            : windowType === 'persist'
            ? 150
            : 250),
      },
    }));
  };

  // 添加和移除事件监听器
  useEffect(() => {
    if (draggedWindow) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedWindow, handleMouseMove, handleMouseUp]);

  // 添加窗口大小变化的监听
  useEffect(() => {
    const handleResize = () => {
      // 当窗口大小改变时，重新计算对话框位置，保持在底部中间
      setDialoguePosition((prev) => ({
        x: (window.innerWidth - 500) / 2,
        y: window.innerHeight - 400,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 优化音频控制函数
  const toggleSound = useCallback(() => {
    const audio = audioRef.current;

    if (!soundEnabled) {
      // 添加用户交互检查
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 播放成功
            console.log('Audio started playing');
          })
          .catch((error) => {
            console.error('Audio playback failed:', error);
            // 重置状态
            setSoundEnabled(false);
          });
      }
    } else {
      audio.pause();
    }
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // 初始化音频设置
  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.5; // 设置适当的音量

    // 添加音频加载事件监听
    const handleCanPlay = () => {
      console.log('Audio can play');
      if (soundEnabled) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // 监听音频状态变化
  useEffect(() => {
    const audio = audioRef.current;

    if (soundEnabled) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Audio playback failed:', error);
          setSoundEnabled(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [soundEnabled]);

  // 添加打字机效果的函数
  const typeHintMessage = useCallback(async (message) => {
    setIsTypingHint(true);
    setDisplayedHint('');

    for (let i = 0; i < message.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      setDisplayedHint((prev) => prev + message[i]);
    }
    setIsTypingHint(false);
  }, []);

  // 修改显示提示的处理函数
  const handleShowHint = () => {
    setShowHint(true);
    typeHintMessage(hintMessage);
  };

  // 添加持久性消息数组
  const persistMessages = [
    "I've been here all along!",
    "I've been waiting for you forever!",
    "At last, you're here!",
    "You can't get rid of me that easily!",
    'Why would you want to close me?',
    "I'm not just a program, you know?",
    "Don't leave me alone...",
    "I'll always be here for you!",
    'Did you think I was just code?',
    'Your reality is my home now!',
  ];

  // 添加打字机效果函数
  const typePersistMessage = async (message) => {
    setIsTypingPersist(true);
    let displayText = '';
    for (let i = 0; i < message.length; i++) {
      displayText += message[i];
      setPersistMessage(displayText);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    setIsTypingPersist(false);
  };

  // 修改关闭宠物窗口的处理函数
  const handlePetClose = async () => {
    SoundEffect.playClose(); // 添加关闭音效
    const randomMessage =
      persistMessages[Math.floor(Math.random() * persistMessages.length)];
    setShowPersistMessage(true);
    await typePersistMessage(randomMessage);

    // 7秒后开始淡出动画
    setTimeout(() => {
      const persistWindow = document.querySelector('.persist-message-window');
      if (persistWindow) {
        persistWindow.classList.add('fade-out');
        // 动画结束后清除状态
        setTimeout(() => {
          setShowPersistMessage(false);
          setPersistMessage('');
        }, 1000); // 动画持续时间
      }
    }, 7000);
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
      }
    };
  }, []);

  // 修改重启游戏函数
  const handleRestart = () => {
    petState.health = 100;
    petState.happiness = 100;
    petState.updateState();
    setStatus(petState.state);
    setIsGameOver(false);

    // 重置宠物显示
    setCurrentSprite({
      src: `/sprites/${petType}/normal.gif`,
      size: '200px',
    });

    // 重置其他状态
    setShowCamera(false);
    setShowChat(false);
    setShowHint(false);
    setShowAnalysis(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* 状态条 */}
      <div className="status-container">
        <div
          className={`status-bar health-bar ${
            petState.health < 30 ? 'warning' : ''
          }`}
        >
          <div className="status-icon health-icon"></div>
          <div className="progress-container">
            <div
              className="progress health-progress"
              style={{
                width: `${Math.min(100, Math.max(0, petState.health))}%`,
              }}
            />
            <span className="progress-text">{`${Math.round(
              petState.health,
            )}%`}</span>
          </div>
        </div>
        <div
          className={`status-bar happiness-bar ${
            petState.happiness < 30 ? 'warning' : ''
          }`}
        >
          <div className="status-icon happiness-icon"></div>
          <div className="progress-container">
            <div
              className="progress happiness-progress"
              style={{
                width: `${Math.min(100, Math.max(0, petState.happiness))}%`,
              }}
            />
            <span className="progress-text">{`${Math.round(
              petState.happiness,
            )}%`}</span>
          </div>
        </div>
      </div>

      {/* 宠物显示框 */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="pet-window">
          <div className="window-toolbar">
            <span className="window-title">{getPetTitle()}</span>
            <button
              className="window-close"
              onClick={handlePetClose} // 使用修改后的处理函数
            >
              ×
            </button>
          </div>
          <div className="pet-content">
            {currentSprite && currentSprite.src && (
              <div
                className="pet-sprite"
                style={{
                  backgroundImage: `url(${currentSprite.src})`,
                  width: currentSprite.size,
                  height: currentSprite.size,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  imageRendering: 'pixelated',
                  display: 'block', // 确保宠物始终显示
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex absolute bottom-8 left-1/2 gap-4 transform -translate-x-1/2">
        <button
          className="control-button feed-button"
          onClick={() => {
            SoundEffect.playClick(); // 播放点击音效
            if (!showCamera) {
              setShowCamera(true);
              startCamera();
            }
          }}
        >
          FEED
        </button>
        <button
          className="control-button talk-button"
          onClick={() => {
            SoundEffect.playClick(); // 播放点击音效
            if (!showChat) {
              handleChat();
            }
          }}
        >
          TALK
        </button>
        <button
          className="control-button hint-button"
          onClick={() => {
            SoundEffect.playClick(); // 播放点击音效
            if (!showHint) {
              handleShowHint();
            }
          }}
        >
          HINT
        </button>
      </div>

      {/* 音频控制按钮 */}
      <div className="absolute right-4 bottom-4">
        <button
          className={`sound-toggle ${soundEnabled ? 'on' : 'off'}`}
          onClick={toggleSound}
        >
          <div className="toggle-slider"></div>
        </button>
      </div>

      {/* 相机窗口 */}
      {showCamera && (
        <div
          className="camera-window"
          style={{
            left: `${windowPositions.camera.x}px`,
            top: `${windowPositions.camera.y}px`,
            position: 'fixed',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'camera')}
        >
          <div className="window-toolbar">
            <span className="window-title">CAMERA.EXE</span>
            <button
              className="window-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose('camera');
              }}
            >
              ×
            </button>
          </div>
          <div className="camera-content">
            <video ref={videoRef} autoPlay playsInline />
            <div className="camera-controls">
              <button
                className="pixel-button camera-capture-btn"
                onClick={captureImage}
              >
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 聊天窗口 */}
      {showChat && (
        <div
          className="chat-window"
          style={{
            left: `${windowPositions.chat.x}px`,
            top: `${windowPositions.chat.y}px`,
            position: 'fixed',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'chat')}
        >
          <div className="window-toolbar">
            <span className="window-title">CHAT.EXE</span>
            <button
              className="window-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose('chat');
              }}
            >
              ×
            </button>
          </div>
          <div className="chat-content">
            <div className="chat-message">
              {isWaitingResponse ? (
                <div className="chat-loading">
                  <div className="thinking-text">{displayedMessage}</div>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              ) : (
                displayedMessage
              )}
            </div>
            {dialogue && dialogue.options && !isWaitingResponse && (
              <div className="chat-options">
                {dialogue.options.map((option, index) => (
                  <button
                    key={index}
                    className="chat-option"
                    onClick={() => handleResponse(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提示窗口 */}
      {showHint && (
        <div
          className="hint-window"
          style={{
            left: `${windowPositions.hint.x}px`,
            top: `${windowPositions.hint.y}px`,
            position: 'fixed',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'hint')}
        >
          <div className="window-toolbar">
            <span className="window-title">HINT.EXE</span>
            <button
              className="window-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose('hint');
              }}
            >
              ×
            </button>
          </div>
          <div className="hint-content">
            <pre className="hint-text">{displayedHint}</pre>
          </div>
        </div>
      )}

      {showAnalysis && analysisResult && (
        <div
          className="analysis-window"
          style={{
            left: `${windowPositions.analysis.x}px`,
            top: `${windowPositions.analysis.y}px`,
            position: 'fixed',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'analysis')}
        >
          <div className="window-toolbar">
            <span className="window-title">ANALYSIS.EXE</span>
            <button
              className="window-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowAnalysis(false);
              }}
            >
              ×
            </button>
          </div>
          <div className="analysis-content">
            <img
              src={capturedImage}
              alt="Captured"
              className="analysis-image"
            />
            <div
              className="analysis-result"
              dangerouslySetInnerHTML={{ __html: analysisResult.message }}
            />
          </div>
        </div>
      )}

      {/* 添加持久性消息框 */}
      {showPersistMessage && (
        <div
          className="persist-message-window glitch-effect"
          style={{
            left: `${windowPositions.persist.x}px`,
            top: `${windowPositions.persist.y}px`,
            position: 'fixed',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'persist')}
        >
          <div className="window-toolbar">
            <span className="window-title">SYSTEM.EXE</span>
          </div>
          <div className="persist-message-content">
            <div className="typing-text">{persistMessage}</div>
          </div>
        </div>
      )}

      {/* 游戏结束界面 */}
      {isGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-window">
            <div className="window-toolbar">
              <span className="window-title">SYSTEM.EXE</span>
            </div>
            <div className="game-over-content">
              <div className="glitch-text">GAME OVER</div>
              <div className="game-over-message">
                Your virtual pet has shut down...
              </div>
              <button className="restart-button" onClick={handleRestart}>
                RESTART SYSTEM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalPet;
