import React, { useEffect } from 'react';
import DigitalPet from './DigitalPet';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function GameScreen() {
  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    );
    camera.position.set(0, 4, 21);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('background-canvas');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    // 创建点的材质和几何体
    const pts = [];
    const sizes = [];
    const shift = [];

    // 生成更多但更小的星空点
    for (let i = 0; i < 10000; i++) {
      pts.push(
        new THREE.Vector3()
          .randomDirection()
          .multiplyScalar(Math.random() * 0.5 + 9.5),
      );
      sizes.push(Math.random() * 0.8 + 0.3);
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 0.05,
        Math.random() * 0.5 + 0.2,
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    geometry.setAttribute('sizes', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('shift', new THREE.Float32BufferAttribute(shift, 4));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      color: 0x80ff99,
      opacity: 0.3,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 添加鼠标位置追踪
    const mouse = new THREE.Vector2();

    // 存储原始位置
    const originalPositions = new Float32Array(pts.length * 3);
    const positionAttribute = geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.array.length; i++) {
      originalPositions[i] = positionAttribute.array[i];
    }

    // 监听鼠标移动
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 添加代码雨
    const rainCount = 1500;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = new Float32Array(rainCount);
    const rainDropSize = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = Math.random() * 60 - 30;
      rainPositions[i * 3 + 1] = Math.random() * 50 - 25;
      rainPositions[i * 3 + 2] = Math.random() * 60 - 30;
      rainVelocities[i] = 0.03 + Math.random() * 0.08;
      rainDropSize[i] = Math.random() * 0.3 + 0.2;
    }

    rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainPositions, 3));
    rainGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(rainVelocities, 1));
    rainGeometry.setAttribute('size', new THREE.Float32BufferAttribute(rainDropSize, 1));

    const rainMaterial = new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x00ff00,
      opacity: 0.3,
    });

    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(rain);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0003;

      const mousePosition = new THREE.Vector3(
        (mouse.x * window.innerWidth) / 80,
        (mouse.y * window.innerHeight) / 80,
        camera.position.z / 3
      );

      const positions = geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const px = originalPositions[i * 3];
        const py = originalPositions[i * 3 + 1];
        const pz = originalPositions[i * 3 + 2];

        const particlePosition = new THREE.Vector3(px, py, pz);
        const distance = mousePosition.distanceTo(particlePosition);
        
        if (distance < 6) {
          const time = Date.now() * 0.001;
          const wave = Math.sin(distance * 2 - time) * 0.8;
          const amplitude = (1 - distance / 6) * wave;
          
          const timeEffect = Math.sin(time);
          const timeEffect2 = Math.cos(time * 1.2);
          positions.array[i * 3] = px + timeEffect * amplitude;
          positions.array[i * 3 + 1] = py + timeEffect2 * amplitude;
          positions.array[i * 3 + 2] = pz + timeEffect * amplitude;
        } else {
          positions.array[i * 3] = px;
          positions.array[i * 3 + 1] = py;
          positions.array[i * 3 + 2] = pz;
        }
      }
      positions.needsUpdate = true;

      // 更新代码雨
      const rainPos = rain.geometry.attributes.position;
      const velocities = rain.geometry.attributes.velocity;
      
      for (let i = 0; i < rainCount; i++) {
        const yPos = i * 3 + 1;
        rainPos.array[yPos] -= velocities.array[i] * 0.4;

        if (rainPos.array[yPos] < -25) {
          rainPos.array[yPos] = 25;
          rainPos.array[i * 3] = Math.random() * 60 - 30;
          rainPos.array[i * 3 + 2] = Math.random() * 60 - 30;
        }
      }

      rainPos.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex relative justify-center items-center p-4 min-h-screen game-screen-container">
      <style jsx global>{`
        /* 全局自定义光标 - 强制应用 */
        /* 光标样式已移至 CustomCursor 组件 */
        
        /* 移动端适配 */
        @media (max-width: 768px) {
          .game-screen-container {
            padding: 0 !important;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            overflow-x: hidden;
            overflow-y: auto;
          }
          
          /* 保留3D背景但降低复杂度 */
          #background-canvas {
            display: block !important;
            opacity: 0.5 !important;
            pointer-events: none;
          }

          #background-canvas canvas {
            width: 100vw !important;
            height: 100vh !important;
          }
        }
        
        @media (max-width: 480px) {
          .game-screen-container {
            padding: 0 !important;
          }

          /* 进一步降低背景透明度 */
          #background-canvas {
            opacity: 0.3 !important;
          }
        }
      `}</style>
      <div
        id="background-canvas"
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      />
      <DigitalPet />
    </div>
  );
}

export default GameScreen; 