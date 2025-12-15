/**
 * LoadingOverlay Component
 * Full-screen loading overlay with 3D gear animation
 * Integrates with Gemini AI for facts
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { logger } from '../../services/logger-service';

interface LoadingOverlayProps {
  isVisible: boolean;
  apiKey: string;
}

// ============================================
// Styled Components
// ============================================

const LoaderContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  background: rgba(5, 5, 10, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: opacity 0.8s ease, visibility 0.8s;
  opacity: ${props => (props.isVisible ? 1 : 0)};
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')};
`;

const GearWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  canvas {
    display: block;
  }
`;

const CenterText = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
`;

const Percentage = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
`;

const Label = styled.span`
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 2px;
  color: #00ccff;
  margin-top: 5px;
  text-transform: uppercase;
`;

const AIFactContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: -100px;
  width: 80%;
  max-width: 600px;
  text-align: center;
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.5s, transform 0.5s;
`;

const AIFactLabel = styled.span`
  font-size: 0.8rem;
  color: #00ccff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 5px;
  display: block;
`;

const AIFactText = styled.div`
  font-size: 1.1rem;
  font-weight: 300;
  color: #e0e0e0;
  line-height: 1.5;
  background: linear-gradient(90deg, transparent, rgba(0, 204, 255, 0.1), transparent);
  padding: 10px;
  border-radius: 8px;
`;

// ============================================
// Component
// ============================================

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, apiKey }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [percent, setPercent] = useState(0);
  const [showAIFact, setShowAIFact] = useState(false);
  const [aiFact, setAIFact] = useState('Calibrating engines for peak performance...');

  // Initialize Three.js scene
  useEffect(() => {
    if (!isVisible || !canvasContainerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    canvasContainerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.8);
    mainLight.position.set(5, 5, 10);
    scene.add(mainLight);

    // Create gear
    const createGearShape = (outerRadius: number, innerRadius: number, teeth: number, toothDepth: number) => {
      const shape = new THREE.Shape();
      const pi2 = Math.PI * 2;
      const step = pi2 / (teeth * 2);
      shape.moveTo(outerRadius, 0);

      for (let i = 0; i < teeth; i++) {
        const angle = i * 2 * step;
        shape.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        shape.lineTo(
          Math.cos(angle + step * 0.5) * (outerRadius + toothDepth),
          Math.sin(angle + step * 0.5) * (outerRadius + toothDepth)
        );
        shape.lineTo(
          Math.cos(angle + step * 1.5) * (outerRadius + toothDepth),
          Math.sin(angle + step * 1.5) * (outerRadius + toothDepth)
        );
        shape.lineTo(Math.cos(angle + step * 2) * outerRadius, Math.sin(angle + step * 2) * outerRadius);
      }

      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      return shape;
    };

    const gearShape = createGearShape(4.2, 3.5, 16, 0.6);
    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3,
    };
    const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0x99aacc, metalness: 0.9, roughness: 0.2 });
    const gear = new THREE.Mesh(geometry, material);
    geometry.center();
    scene.add(gear);

    // Inner ring
    const innerRingGeo = new THREE.TorusGeometry(3.3, 0.02, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x004455, transparent: true, opacity: 0.5 });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    scene.add(innerRing);

    // Flash group
    const flashGroup = new THREE.Group();
    scene.add(flashGroup);
    const flashLight = new THREE.PointLight(0x00ffff, 5, 10);
    flashLight.position.set(3.3, 0, 0.5);
    flashGroup.add(flashLight);

    const flashSphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const flashSphereMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const flashSphere = new THREE.Mesh(flashSphereGeo, flashSphereMat);
    flashSphere.position.set(3.3, 0, 0);
    flashGroup.add(flashSphere);

    // Animation loop
    let gearSpeed = 0.01;
    let flashSpeed = 0.08;

    const animate = () => {
      requestAnimationFrame(animate);
      gear.rotation.z -= gearSpeed;
      flashGroup.rotation.z += flashSpeed;

      const tiltX = Math.sin(Date.now() * 0.001) * 0.15;
      const tiltY = Math.cos(Date.now() * 0.001) * 0.15;
      gear.rotation.x = tiltX;
      gear.rotation.y = tiltY;
      innerRing.rotation.x = tiltX;
      innerRing.rotation.y = tiltY;
      flashGroup.position.z = gear.position.z;
      flashGroup.rotation.x = tiltX;
      flashGroup.rotation.y = tiltY;

      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Cleanup
    return () => {
      if (canvasContainerRef.current && renderer.domElement.parentElement === canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isVisible]);

  // Fetch AI fact
  useEffect(() => {
    const fetchAIFact = async () => {
      if (!apiKey || !isVisible) return;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Tell me one short, fascinating fact about automotive engineering or car history. Max 20 words.',
                    },
                  ],
                },
              ],
              systemInstruction: { parts: [{ text: 'You are a car expert.' }] },
            }),
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          setAIFact(data.candidates[0].content.parts[0].text);
        }
      } catch (error) {
        logger.error('AI Fact fetch failed:', error as Error, {
          context: 'LoadingOverlay',
          action: 'fetchAIFact'
        });
      }
    };

    fetchAIFact();
  }, [isVisible, apiKey]);

  // Simulate loading progress
  useEffect(() => {
    if (!isVisible) {
      setPercent(0);
      setShowAIFact(false);
      return;
    }

    let currentPercent = 0;
    const loadInterval = setInterval(() => {
      currentPercent = Math.min(currentPercent + Math.random() * 30, 99);
      setPercent(Math.floor(currentPercent));

      if (currentPercent > 50 && !showAIFact) {
        setShowAIFact(true);
      }
    }, 300);

    return () => clearInterval(loadInterval);
  }, [isVisible, showAIFact]);

  return (
    <LoaderContainer isVisible={isVisible}>
      <GearWrapper>
        <CanvasContainer ref={canvasContainerRef} />
        <CenterText>
          <Percentage>{percent}%</Percentage>
          <Label>LOADING</Label>
        </CenterText>
        <AIFactContainer isVisible={showAIFact}>
          <AIFactLabel>✨ AI Did You Know?</AIFactLabel>
          <AIFactText>{aiFact}</AIFactText>
        </AIFactContainer>
      </GearWrapper>
    </LoaderContainer>
  );
};

export default LoadingOverlay;
