import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import * as THREE from 'three';

// --- ANIMATIONS ---

// 1. Fade In and Flash
const fadeInFlash = keyframes`
  0% {
    opacity: 0;
    text-shadow: none;
    transform: translateY(10px);
  }
  50% {
    opacity: 0.5;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
  }
`;

// 2. Continuous Pulse (White)
const pulseGlow = keyframes`
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
  }
  to {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

// 3. Continuous Pulse (Cyan)
const pulseCyan = keyframes`
  from {
    text-shadow: 0 0 15px rgba(0, 204, 255, 0.8), 0 0 30px rgba(0, 204, 255, 0.4);
  }
  to {
    text-shadow: 0 0 5px rgba(0, 204, 255, 0.5), 0 0 10px rgba(0, 204, 255, 0.2);
  }
`;

const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(5, 5, 10, 0.4); /* More transparent */
  backdrop-filter: blur(12px); /* Blur effect */
  -webkit-backdrop-filter: blur(12px); /* Safari support */
  z-index: 9999;
  font-family: 'Exo 2', sans-serif;
  color: white;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CanvasContainer = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
  z-index: 1;
`;

const BrandNameContainer = styled.div`
  margin-top: -40px;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const BrandTextBg = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  opacity: 0;
  animation: ${fadeInFlash} 3s ease-in-out forwards, ${pulseGlow} 2s ease-in-out 3s infinite alternate;

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
`;

const BrandTextEn = styled.div`
  font-family: 'Exo 2', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #00ccff;
  opacity: 0;
  animation: ${fadeInFlash} 3s ease-in-out 0.5s forwards, ${pulseCyan} 2s ease-in-out 3.5s infinite alternate;

  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;600;800&display=swap');
`;

const SmartLoader: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- THREE.JS SETUP ---
    const width = 300;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clear previous canvas if any
    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0xffffff, 2);
    mainLight.position.set(5, 5, 10);
    scene.add(mainLight);
    const rimLight = new THREE.PointLight(0x00ccff, 3); // Cyan rim light
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

    // Gear Geometry
    const createGearShape = (outerRadius: number, innerRadius: number, teeth: number, toothDepth: number) => {
      const shape = new THREE.Shape();
      const pi2 = Math.PI * 2;
      const step = pi2 / (teeth * 2);
      shape.moveTo(outerRadius, 0);
      for (let i = 0; i < teeth; i++) {
        const angle = (i * 2) * step;
        shape.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        shape.lineTo(Math.cos(angle + step * 0.5) * (outerRadius + toothDepth), Math.sin(angle + step * 0.5) * (outerRadius + toothDepth));
        shape.lineTo(Math.cos(angle + step * 1.5) * (outerRadius + toothDepth), Math.sin(angle + step * 1.5) * (outerRadius + toothDepth));
        shape.lineTo(Math.cos(angle + step * 2) * outerRadius, Math.sin(angle + step * 2) * outerRadius);
      }
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      return shape;
    };

    const gearShape = createGearShape(4.2, 3.2, 12, 0.6);
    const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 };
    const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0x99aacc, metalness: 0.9, roughness: 0.2 });
    const gear = new THREE.Mesh(geometry, material);
    geometry.center();
    scene.add(gear);

    // Rotating Flash
    const flashGroup = new THREE.Group();
    scene.add(flashGroup);
    const flashLight = new THREE.PointLight(0x00ffff, 8, 12);
    flashLight.position.set(3.3, 0, 1);
    flashGroup.add(flashLight);
    const flashSphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xccffff }));
    flashSphere.position.set(3.3, 0, 0);
    flashGroup.add(flashSphere);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      gear.rotation.z -= 0.01;
      flashGroup.rotation.z += 0.05;

      // Subtle tilt
      const now = Date.now();
      const tilt = Math.sin(now * 0.001) * 0.1;
      gear.rotation.x = tilt;
      gear.rotation.y = tilt;
      flashGroup.position.z = gear.position.z;
      flashGroup.rotation.x = tilt;
      flashGroup.rotation.y = tilt;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (canvasRef.current && canvasRef.current.firstChild) {
        // Safe to leave as React will unmount the div
        // But Three.js resources should be disposed
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <LoaderContainer>
      <ContentWrapper>
        {/* 3D Gear Canvas */}
        <CanvasContainer ref={canvasRef} />

        {/* Brand Names with Flash Animation */}
        <BrandNameContainer>
          <BrandTextBg>Български мобили</BrandTextBg>
          <BrandTextEn>Bulgarski Mobili</BrandTextEn>
        </BrandNameContainer>
      </ContentWrapper>
    </LoaderContainer>
  );
};

export default SmartLoader;
