// sections/intro.js
// Main hero section with chromatic floating geometry
// Author: Daud Shahbaz

export function initIntro() {
    const section = document.getElementById('intro');
    if (!section) return;

    // Canvas setup
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    section.appendChild(canvas);

    // Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    camera.position.set(0, 0, 10);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create floating geometric shapes
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.DodecahedronGeometry(1),
        new THREE.OctahedronGeometry(1),
        new THREE.TetrahedronGeometry(1),
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.ConeGeometry(0.8, 1.5, 8)
    ];

    const floatingShapes = [];
    const shapeCount = 15;

    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        
        // Chromatic material with rainbow effect
        const hue = (i / shapeCount) * 360;
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(hue / 360, 0.8, 0.6),
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            wireframe: Math.random() > 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Random positioning
        mesh.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10
        );

        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        mesh.scale.setScalar(scale);

        // Store animation properties
        mesh.userData = {
            initialPosition: mesh.position.clone(),
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatRadius: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2
        };

        scene.add(mesh);
        floatingShapes.push(mesh);
    }

    // Create particle field
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a large sphere
        const radius = Math.random() * 50 + 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);

        // Rainbow colors
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
        particleColors[i3] = color.r;
        particleColors[i3 + 1] = color.g;
        particleColors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update shapes based on mouse position
        floatingShapes.forEach((shape, index) => {
            const mouseInfluence = 0.5;
            const distance = shape.position.distanceTo(new THREE.Vector3(mouse.x * 10, mouse.y * 5, 0));
            
            if (distance < 5) {
                const intensity = (5 - distance) / 5;
                shape.material.emissive.setHSL((index / floatingShapes.length), 1, intensity * 0.3);
                shape.scale.setScalar((shape.userData.scale || 1) * (1 + intensity * 0.5));
            } else {
                shape.material.emissive.setHSL(0, 0, 0);
                shape.scale.setScalar(shape.userData.scale || 1);
            }
        });
    }

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Animate floating shapes
        floatingShapes.forEach((shape, index) => {
            const userData = shape.userData;
            
            // Floating motion
            shape.position.x = userData.initialPosition.x + 
                Math.sin(frameCount * userData.floatSpeed + userData.phase) * userData.floatRadius;
            shape.position.y = userData.initialPosition.y + 
                Math.cos(frameCount * userData.floatSpeed * 0.7 + userData.phase) * userData.floatRadius * 0.5;
            shape.position.z = userData.initialPosition.z + 
                Math.sin(frameCount * userData.floatSpeed * 0.5 + userData.phase) * userData.floatRadius * 0.3;

            // Rotation
            shape.rotation.x += userData.rotationSpeed.x;
            shape.rotation.y += userData.rotationSpeed.y;
            shape.rotation.z += userData.rotationSpeed.z;

            // Color cycling
            const hue = ((frameCount * 0.5 + index * 50) % 360) / 360;
            shape.material.color.setHSL(hue, 0.8, 0.6);
        });

        // Animate particles
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;

        // Camera subtle movement
        camera.position.x = Math.sin(frameCount * 0.001) * 2;
        camera.position.y = Math.cos(frameCount * 0.0015) * 1;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    // GSAP animations
    gsap.registerPlugin(ScrollTrigger);

    // Initial entrance animation
    gsap.from(floatingShapes.map(shape => shape.scale), {
        duration: 2,
        x: 0, y: 0, z: 0,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
    });

    gsap.from(particleMaterial, {
        duration: 3,
        opacity: 0,
        delay: 1
    });

    // Text entrance animation
    const textElements = section.querySelectorAll('h1, p, .subtitle');
    gsap.from(textElements, {
        duration: 1.5,
        y: 100,
        opacity: 0,
        stagger: 0.3,
        ease: "power3.out",
        delay: 1.5
    });

    // Start animation
    animate();

    // Handle resize
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    // Add text content
    const textOverlay = document.createElement('div');
    textOverlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
        color: white;
        font-family: 'Courier New', monospace;
        pointer-events: none;
    `;

    textOverlay.innerHTML = `
        <h1 style="font-size: 4em; margin-bottom: 0.2em; font-weight: bold; 
                   text-shadow: 0 0 20px rgba(255,255,255,0.5);">
            DAUD SHAHBAZ
        </h1>
        <p class="subtitle" style="font-size: 1.5em; margin-bottom: 1em; opacity: 0.8;">
            Computational Scientist & Creative Technologist
        </p>
        <p style="font-size: 1em; max-width: 600px; line-height: 1.6; opacity: 0.7;">
            Exploring the intersection of mathematics, physics, and technology
            through innovative computational approaches and data visualization.
        </p>
    `;

    section.appendChild(textOverlay);

    // Return cleanup function
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === section) trigger.kill();
        });
    };
}
