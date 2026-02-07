/**
 * Koli One - 3D Loader Animation
 * Bulgarian Flag Gear + Glass Sphere
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

try {
    // Setup Scene
    const container = document.getElementById('canvas-container');
    if (!container) throw new Error('Canvas container not found');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 15);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x00ccff, 5, 20);
    rimLight.position.set(-5, -5, 5);
    scene.add(rimLight);

    // Gear Shape Function
    function createGearShape(outerRadius, innerRadius, teeth, toothDepth) {
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
    }

    // Create Gear (Outer Ring)
    const gearShape = createGearShape(5.5, 4.5, 16, 0.8);
    const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
    };
    const gearGeometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
    const gearMaterial = new THREE.MeshStandardMaterial({
        color: 0x8899aa,
        metalness: 0.9,
        roughness: 0.2
    });
    const gear = new THREE.Mesh(gearGeometry, gearMaterial);
    gearGeometry.center();
    scene.add(gear);

    // Flash Light on Gear
    const flashGroup = new THREE.Group();
    scene.add(flashGroup);
    const flashLight = new THREE.PointLight(0x00ffff, 8, 10);
    flashLight.position.set(4.8, 0, 1);
    flashGroup.add(flashLight);

    // Bulgarian Flag Glass Sphere (White, Green, Red)
    const sphereGeo = new THREE.SphereGeometry(3.5, 64, 64);

    // Create canvas for flag gradient
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Draw Bulgarian flag colors (horizontal stripes)
    // White (top)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 170);

    // Green (middle)
    ctx.fillStyle = '#00966E';
    ctx.fillRect(0, 170, 512, 171);

    // Red (bottom)
    ctx.fillStyle = '#D62612';
    ctx.fillRect(0, 341, 512, 171);

    // Create texture from canvas
    const flagTexture = new THREE.CanvasTexture(canvas);
    flagTexture.needsUpdate = true;

    const sphereMat = new THREE.MeshPhysicalMaterial({
        map: flagTexture,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.7,
        thickness: 1.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const glassSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(glassSphere);

    // Orbits around sphere
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const ring1Geo = new THREE.TorusGeometry(3.8, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 2 + 0.5;
    orbitGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(4.2, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.6
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2 - 0.5;
    orbitGroup.add(ring2);

    // Animation Loop
    function animate() {
        if (!document.getElementById('loader-container')) return;
        requestAnimationFrame(animate);

        // Rotate gear slowly
        gear.rotation.z -= 0.005;

        // Rotate flash fast
        flashGroup.rotation.z += 0.03;

        // Rotate Bulgarian flag sphere slowly
        glassSphere.rotation.y += 0.008;
        glassSphere.rotation.x += 0.003;

        // Rotate orbits independently
        orbitGroup.rotation.y += 0.005;
        orbitGroup.rotation.z += 0.002;

        // Float effect
        const floatY = Math.sin(Date.now() * 0.001) * 0.2;
        scene.position.y = floatY;

        renderer.render(scene, camera);
    }

    animate();

} catch (error) {
    console.error('Loader animation error:', error);
}
