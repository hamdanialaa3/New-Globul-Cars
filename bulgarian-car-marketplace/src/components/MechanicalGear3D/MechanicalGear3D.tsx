import React, { useEffect, useRef } from 'react';
import * as S from './MechanicalGear3D.styles';

interface MechanicalGear3DProps {
  size?: number; // Size in pixels (default: 240)
  className?: string;
}

/**
 * Mechanical Gear 3D Component
 * 
 * Creates a professional 3D mechanical gear using Three.js
 * Lightweight, procedurally generated, no external textures
 */
export const MechanicalGear3D: React.FC<MechanicalGear3DProps> = ({ 
  size = 240,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: any;
    camera?: any;
    renderer?: any;
    gearMesh?: any;
    animationId?: number;
  }>({});

  useEffect(() => {
    // Dynamic import of Three.js to avoid blocking initial load
    const initThreeJS = async () => {
      try {
        // Check if Three.js is already loaded from CDN in index.html
        if (typeof window === 'undefined') return; // Server-side rendering
        
        if (!containerRef.current) return;
        
        // Wait for Three.js to load if not immediately available
        let THREE: any = (window as any).THREE;
        
        if (!THREE) {
          await new Promise<void>((resolve) => {
            const checkThree = setInterval(() => {
              if ((window as any).THREE) {
                THREE = (window as any).THREE;
                clearInterval(checkThree);
                resolve();
              }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
              clearInterval(checkThree);
              if (!THREE) {
                console.warn('Three.js failed to load from CDN');
              }
              resolve();
            }, 10000);
          });
        }

        if (!THREE) {
          console.warn('Three.js not available');
          return;
        }

        const container = containerRef.current;
        const width = size;
        const height = size;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = null; // Transparent background

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        container.appendChild(renderer.domElement);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // Subtle rim light for depth
        const rimLight = new THREE.PointLight(0x0044ff, 0.3);
        rimLight.position.set(-5, -5, -5);
        scene.add(rimLight);

        // --- Create Hollow Gear Shape ---
        function createHollowGearShape(teeth: number, outerRadius: number, innerRadius: number, holeRadius: number) {
          const shape = new THREE.Shape();
          const pi2 = Math.PI * 2;

          // Draw outer perimeter and teeth
          shape.moveTo(outerRadius, 0);
          for (let i = 0; i < teeth; i++) {
            const angleStep = pi2 / teeth;
            const a1 = i * angleStep;
            const a2 = a1 + angleStep * 0.25; // Start of tooth
            const a3 = a1 + angleStep * 0.5;  // Peak of tooth
            const a4 = a1 + angleStep * 0.75; // End of tooth

            // Draw trapezoid-like shape for tooth
            shape.lineTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);
            shape.lineTo(Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius);
            shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
            shape.lineTo(Math.cos(a4) * innerRadius, Math.sin(a4) * innerRadius);
          }
          shape.closePath();

          // --- Make gear hollow ---
          const holePath = new THREE.Path();
          holePath.absarc(0, 0, holeRadius, 0, pi2, true);
          shape.holes.push(holePath);

          return shape;
        }

        // --- Gear Parameters ---
        const gearParams = {
          teeth: 24,
          outerRadius: 3,
          innerRadius: 2.4,
          holeRadius: 1.5,
          thickness: 0.8
        };

        const gearShape = createHollowGearShape(
          gearParams.teeth,
          gearParams.outerRadius,
          gearParams.innerRadius,
          gearParams.holeRadius
        );

        const extrudeSettings = {
          depth: gearParams.thickness,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
        geometry.center();

        // --- Material ---
        const material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa, // Silver gray
          metalness: 0.7,
          roughness: 0.3,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9 // Subtle transparency
        });

        const gearMesh = new THREE.Mesh(geometry, material);
        scene.add(gearMesh);

        // --- Camera Position ---
        camera.position.z = 8;
        camera.position.y = 2;
        camera.lookAt(0, 0, 0);

        // Store references
        sceneRef.current = {
          scene,
          camera,
          renderer,
          gearMesh
        };

        // --- Animation Loop ---
        let animationId: number;
        function animate() {
          animationId = requestAnimationFrame(animate);

          if (gearMesh) {
            // Slow rotation for elegant effect
            gearMesh.rotation.z -= 0.003;
            gearMesh.rotation.x += 0.0005;
            gearMesh.rotation.y += 0.0005;
          }

          renderer.render(scene, camera);
        }

        sceneRef.current.animationId = animationId;
        animate();

      } catch (error) {
        console.error('Error initializing Three.js gear:', error);
      }
    };

    initThreeJS();

    // Cleanup
    return () => {
      if (sceneRef.current.renderer && containerRef.current) {
        containerRef.current.removeChild(sceneRef.current.renderer.domElement);
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
    };
  }, [size]);

  return <S.GearContainer ref={containerRef} className={className} $size={size} />;
};
