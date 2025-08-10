// sections/plasma.js
// Hand-crafted plasma physics simulation
// Author: Daud Shahbaz

export function initPlasma() {
    const section = document.getElementById('plasma');
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
    camera.position.set(0, 0, 30);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    // Plasma parameters
    const particleCount = 2000;
    const magneticFieldStrength = 0.1;
    const electricFieldStrength = 0.05;
    
    // Create plasma particles
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const charges = new Float32Array(particleCount); // +1 for ions, -1 for electrons
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions within a sphere
        const radius = Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Random initial velocities
        velocities[i3] = (Math.random() - 0.5) * 0.1;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Assign charge (50% ions, 50% electrons)
        charges[i] = Math.random() > 0.5 ? 1 : -1;
        
        // Color based on charge (red for ions, blue for electrons)
        if (charges[i] > 0) {
            colors[i3] = 1;     // R
            colors[i3 + 1] = 0.3; // G
            colors[i3 + 2] = 0;   // B
        } else {
            colors[i3] = 0;     // R
            colors[i3 + 1] = 0.3; // G
            colors[i3 + 2] = 1;   // B
        }
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Magnetic field lines visualization
    const fieldLines = [];
    const fieldLineCount = 12;
    
    for (let i = 0; i < fieldLineCount; i++) {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-20, -10 + (i / fieldLineCount) * 20, 0),
            new THREE.Vector3(-10, -8 + (i / fieldLineCount) * 16, 0),
            new THREE.Vector3(0, -6 + (i / fieldLineCount) * 12, 0),
            new THREE.Vector3(10, -8 + (i / fieldLineCount) * 16, 0),
            new THREE.Vector3(20, -10 + (i / fieldLineCount) * 20, 0)
        ]);
        
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        fieldLines.push(line);
    }
    
    // Confinement vessel (tokamak-like torus)
    const torusGeometry = new THREE.TorusGeometry(12, 3, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);
    
    // Mouse interaction for field distortion
    const mouse = new THREE.Vector2();
    let mouseInfluence = new THREE.Vector3();
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Convert mouse to 3D world coordinates
        mouseInfluence.set(mouse.x * 20, mouse.y * 15, 0);
    }
    
    window.addEventListener('mousemove', onMouseMove);
    
    // Plasma physics simulation
    function updatePlasma() {
        const positionsArray = particles.attributes.position.array;
        const colorsArray = particles.attributes.color.array;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Current position and velocity
            const x = positionsArray[i3];
            const y = positionsArray[i3 + 1];
            const z = positionsArray[i3 + 2];
            
            const vx = velocities[i3];
            const vy = velocities[i3 + 1];
            const vz = velocities[i3 + 2];
            
            const charge = charges[i];
            
            // Magnetic field (pointing in Z direction)
            const Bx = 0;
            const By = 0;
            const Bz = magneticFieldStrength;
            
            // Electric field (radial confinement + mouse influence)
            const distance = Math.sqrt(x * x + y * y + z * z);
            const mouseDistance = Math.sqrt(
                (x - mouseInfluence.x) ** 2 + 
                (y - mouseInfluence.y) ** 2 + 
                (z - mouseInfluence.z) ** 2
            );
            
            let Ex = -x * electricFieldStrength / Math.max(distance, 1);
            let Ey = -y * electricFieldStrength / Math.max(distance, 1);
            let Ez = -z * electricFieldStrength / Math.max(distance, 1);
            
            // Mouse influence
            if (mouseDistance < 5) {
                const influence = (5 - mouseDistance) / 5;
                Ex += (x - mouseInfluence.x) * influence * 0.01;
                Ey += (y - mouseInfluence.y) * influence * 0.01;
                Ez += (z - mouseInfluence.z) * influence * 0.01;
            }
            
            // Lorentz force: F = q(E + v × B)
            const forceX = charge * (Ex + vy * Bz - vz * By);
            const forceY = charge * (Ey + vz * Bx - vx * Bz);
            const forceZ = charge * (Ez + vx * By - vy * Bx);
            
            // Update velocity (simple Euler integration)
            const dt = 0.01;
            velocities[i3] += forceX * dt;
            velocities[i3 + 1] += forceY * dt;
            velocities[i3 + 2] += forceZ * dt;
            
            // Damping to prevent runaway particles
            velocities[i3] *= 0.995;
            velocities[i3 + 1] *= 0.995;
            velocities[i3 + 2] *= 0.995;
            
            // Update position
            positionsArray[i3] += velocities[i3];
            positionsArray[i3 + 1] += velocities[i3 + 1];
            positionsArray[i3 + 2] += velocities[i3 + 2];
            
            // Confinement within torus
            const particleDistance = Math.sqrt(x * x + y * y + z * z);
            if (particleDistance > 18) {
                // Reflect particle back
                const norm = 1 / particleDistance;
                positionsArray[i3] = x * norm * 18;
                positionsArray[i3 + 1] = y * norm * 18;
                positionsArray[i3 + 2] = z * norm * 18;
                
                // Reverse velocity component
                velocities[i3] *= -0.5;
                velocities[i3 + 1] *= -0.5;
                velocities[i3 + 2] *= -0.5;
            }
            
            // Color intensity based on velocity
            const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
            const intensity = Math.min(speed * 20 + 0.3, 1);
            
            if (charge > 0) {
                colorsArray[i3] = intensity;     // R
                colorsArray[i3 + 1] = intensity * 0.3; // G
                colorsArray[i3 + 2] = 0;         // B
            } else {
                colorsArray[i3] = 0;             // R
                colorsArray[i3 + 1] = intensity * 0.3; // G
                colorsArray[i3 + 2] = intensity; // B
            }
        }
        
        particles.attributes.position.needsUpdate = true;
        particles.attributes.color.needsUpdate = true;
    }
    
    // Instability injection
    function injectInstability() {
        const centerX = (Math.random() - 0.5) * 20;
        const centerY = (Math.random() - 0.5) * 15;
        const centerZ = (Math.random() - 0.5) * 10;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const x = particles.attributes.position.array[i3];
            const y = particles.attributes.position.array[i3 + 1];
            const z = particles.attributes.position.array[i3 + 2];
            
            const distance = Math.sqrt(
                (x - centerX) ** 2 + 
                (y - centerY) ** 2 + 
                (z - centerZ) ** 2
            );
            
            if (distance < 3) {
                velocities[i3] += (Math.random() - 0.5) * 0.2;
                velocities[i3 + 1] += (Math.random() - 0.5) * 0.2;
                velocities[i3 + 2] += (Math.random() - 0.5) * 0.2;
            }
        }
    }
    
    // Random instabilities
    setInterval(injectInstability, 5000);
    
    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        
        // Update plasma physics
        updatePlasma();
        
        // Rotate torus slowly
        torus.rotation.y += 0.002;
        torus.rotation.x += 0.001;
        
        // Pulse field lines
        fieldLines.forEach((line, index) => {
            line.material.opacity = 0.2 + Math.sin(frameCount * 0.02 + index * 0.5) * 0.1;
        });
        
        // Camera orbit
        camera.position.x = Math.cos(frameCount * 0.002) * 30;
        camera.position.z = Math.sin(frameCount * 0.002) * 30;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    }
    
    // GSAP scroll trigger
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
            // Animate torus in
            gsap.from(torus.scale, {
                duration: 2,
                x: 0, y: 0, z: 0,
                ease: "back.out(1.7)"
            });
            
            // Animate particles
            gsap.from(particleMaterial, {
                duration: 1.5,
                opacity: 0,
                delay: 0.5
            });
            
            // Initial instability
            setTimeout(injectInstability, 3000);
        }
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
    
    // Add content overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 20%;
        left: 5%;
        z-index: 10;
        color: white;
        font-family: 'Courier New', monospace;
        pointer-events: none;
    `;
    
    overlay.innerHTML = `
        <h2 style="font-size: 3em; margin-bottom: 0.5em; color: #ff6600;">
            PLASMA PHYSICS
        </h2>
        <p style="font-size: 1.2em; max-width: 400px; line-height: 1.5;">
            Simulating the fourth state of matter for fusion energy research
            and understanding stellar phenomena through computational models.
        </p>
        <div style="margin-top: 2em; font-size: 0.9em; opacity: 0.7;">
            Magnetohydrodynamics • Fusion confinement • Particle dynamics
        </div>
        <div style="margin-top: 1em; font-size: 0.8em; opacity: 0.5;">
            Move cursor to distort the plasma field
        </div>
    `;
    
    section.appendChild(overlay);
    
    // Return cleanup function
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === section) trigger.kill();
        });
    };
}
