import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Globe3DLogoProps {
  width?: number;
  height?: number;
}

const Globe3DLogo: React.FC<Globe3DLogoProps> = ({ width = 120, height = 120 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let globeGroup: THREE.Group;
    let starsGroup: THREE.Group;

    const init = () => {
      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 15;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // شفاف تماماً
      mountRef.current?.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);

      // --- The Core Object: Deconstructed Flag Segments ---
      globeGroup = new THREE.Group();
      scene.add(globeGroup);

      const radius = 4;
      const segmentAngle = Math.PI / 3; // Each band is 1/3 of the hemisphere's height
      const gap = 0.1; // The gap between color bands

      // Darker, richer color palette
      const GERMANY_COLORS = ['#000000', '#AE0000', '#D4A100'];
      const BULGARIA_COLORS = ['#E0E0E0', '#007A58', '#A91F0E'];

      // Function to create a colored band of a hemisphere
      function createHemiBand(color: string, verticalSegment: number) {
        const thetaStart = verticalSegment * segmentAngle;
        const geometry = new THREE.SphereGeometry(radius, 64, 32, 0, Math.PI, thetaStart, segmentAngle);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.2,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
        return new THREE.Mesh(geometry, material);
      }

      // 1. Create German Flag Group
      const germanGroup = new THREE.Group();
      GERMANY_COLORS.forEach((color, i) => {
        const band = createHemiBand(color, i);
        germanGroup.add(band);
      });
      germanGroup.rotation.y = -Math.PI / 2;
      germanGroup.position.x = - (radius * 0.05 + gap); // Position with a gap
      globeGroup.add(germanGroup);

      // 2. Create Bulgarian Flag Group
      const bulgarianGroup = new THREE.Group();
      BULGARIA_COLORS.forEach((color, i) => {
        const band = createHemiBand(color, i);
        bulgarianGroup.add(band);
      });
      bulgarianGroup.rotation.y = Math.PI / 2;
      bulgarianGroup.position.x = (radius * 0.05 + gap); // Position with a gap
      globeGroup.add(bulgarianGroup);

      // --- The Orbiting EU Stars ---
      starsGroup = new THREE.Group();
      const starShape = new THREE.Shape();
      const outerRadius = 1, innerRadius = 0.5, points = 5;
      starShape.moveTo(0, outerRadius);
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (points * 2)) * Math.PI * 2;
        starShape.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
      }
      const extrudeSettings = { depth: 0.2, bevelEnabled: false };
      const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      const starMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0xFFD700,
        emissiveIntensity: 0.3
      });

      const orbitRadius = 7;
      const numberOfStars = 24;
      for (let i = 0; i < numberOfStars; i++) {
        const angle = (i / numberOfStars) * Math.PI * 2;
        const star = new THREE.Mesh(starGeometry, starMaterial);

        star.scale.set(0.6, 0.6, 0.6);

        const x = orbitRadius * Math.cos(angle);
        const z = orbitRadius * Math.sin(angle);

        star.position.set(x, 0, z);
        star.lookAt(new THREE.Vector3(0,0,0));

        starsGroup.add(star);
      }
      scene.add(starsGroup);

      // Store references
      sceneRef.current = scene;
      rendererRef.current = renderer;
    };

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (globeGroup && starsGroup) {
        // Rotate the entire group of hemispheres
        globeGroup.rotation.y += 0.005;

        // Animate the separation of color bands
        const time = Date.now() * 0.001;
        const separation = Math.sin(time) * 0.1 + 0.1; // Dynamic gap

        globeGroup.children.forEach((hemiGroup: THREE.Object3D) => {
          hemiGroup.children.forEach((band: THREE.Object3D, i: number) => {
            // This creates the "breathing" effect.
            const yOffset = (1 - i) * separation;
            band.position.y = yOffset;
          });
        });

        // Rotate the star group and slowly change its tilt angle
        starsGroup.rotation.y -= 0.002;
        starsGroup.rotation.x = Math.sin(Date.now() * 0.0002) * 0.4;

        renderer.render(scene, camera);
      }
    };

    init();
    animate();

    const currentMount = mountRef.current;

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && currentMount) {
        const rendererElement = rendererRef.current.domElement;
        if (currentMount.contains(rendererElement)) {
          currentMount.removeChild(rendererElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => window.location.href = '/'}
    />
  );
};

export default Globe3DLogo;