// sections/quantum.js
// Hand-crafted quantum computing visualization
// Author: Daud Shahbaz

export function initQuantum() {
    const section = document.getElementById('quantum');
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
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ffcc, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Quantum circuit parameters
    const qubits = 5;
    const circuitLength = 8;
    const qubitSpacing = 2;
    const gateSpacing = 3;
    
    // Create qubit lines
    const qubitLines = [];
    for (let i = 0; i < qubits; i++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-circuitLength * gateSpacing / 2, i * qubitSpacing - (qubits - 1) * qubitSpacing / 2, 0),
            new THREE.Vector3(circuitLength * gateSpacing / 2, i * qubitSpacing - (qubits - 1) * qubitSpacing / 2, 0)
        ]);
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.6
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        qubitLines.push(line);
    }

    // Quantum gates
    const gates = [];
    const gateTypes = ['H', 'X', 'Y', 'Z', 'CNOT', 'RX', 'RZ'];
    
    // Create quantum gates
    for (let step = 0; step < circuitLength; step++) {
        for (let qubit = 0; qubit < qubits; qubit++) {
            // Random gate placement
            if (Math.random() > 0.4) {
                const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
                
                let gateGeometry, gateMaterial;
                
                if (gateType === 'CNOT') {
                    // CNOT gate (control-target)
                    if (qubit < qubits - 1) {
                        // Control qubit (small circle)
                        const controlGeometry = new THREE.SphereGeometry(0.2, 16, 16);
                        const controlMaterial = new THREE.MeshLambertMaterial({
                            color: 0x00ffcc,
                            emissive: 0x003333
                        });
                        
                        const control = new THREE.Mesh(controlGeometry, controlMaterial);
                        control.position.set(
                            step * gateSpacing - circuitLength * gateSpacing / 2 + gateSpacing / 2,
                            qubit * qubitSpacing - (qubits - 1) * qubitSpacing / 2,
                            0
                        );
                        
                        // Target qubit (X gate)
                        const targetGeometry = new THREE.RingGeometry(0.4, 0.6, 16);
                        const targetMaterial = new THREE.MeshLambertMaterial({
                            color: 0xffaa00,
                            emissive: 0x332200
                        });
                        
                        const target = new THREE.Mesh(targetGeometry, targetMaterial);
                        target.position.set(
                            step * gateSpacing - circuitLength * gateSpacing / 2 + gateSpacing / 2,
                            (qubit + 1) * qubitSpacing - (qubits - 1) * qubitSpacing / 2,
                            0
                        );
                        
                        // Connection line
                        const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
                            control.position,
                            target.position
                        ]);
                        const connectionMaterial = new THREE.LineBasicMaterial({
                            color: 0x00ffcc,
                            transparent: true,
                            opacity: 0.8
                        });
                        const connection = new THREE.Line(connectionGeometry, connectionMaterial);
                        
                        const gateGroup = {
                            type: 'CNOT',
                            control,
                            target,
                            connection,
                            step,
                            qubit,
                            active: false
                        };
                        
                        scene.add(control);
                        scene.add(target);
                        scene.add(connection);
                        gates.push(gateGroup);
                        
                        // Skip next qubit
                        qubit++;
                    }
                } else {
                    // Single qubit gates
                    gateGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
                    
                    let gateColor;
                    switch (gateType) {
                        case 'H': gateColor = 0xff6600; break;
                        case 'X': gateColor = 0xff0066; break;
                        case 'Y': gateColor = 0x66ff00; break;
                        case 'Z': gateColor = 0x0066ff; break;
                        case 'RX': gateColor = 0xffcc00; break;
                        case 'RZ': gateColor = 0xcc00ff; break;
                        default: gateColor = 0xffffff;
                    }
                    
                    gateMaterial = new THREE.MeshLambertMaterial({
                        color: gateColor,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
                    gate.position.set(
                        step * gateSpacing - circuitLength * gateSpacing / 2 + gateSpacing / 2,
                        qubit * qubitSpacing - (qubits - 1) * qubitSpacing / 2,
                        0
                    );
                    
                    const gateObj = {
                        type: gateType,
                        mesh: gate,
                        step,
                        qubit,
                        active: false,
                        originalColor: gateColor
                    };
                    
                    scene.add(gate);
                    gates.push(gateObj);
                }
            }
        }
    }

    // Floating qubits (|0⟩ and |1⟩ states)
    const floatingQubits = [];
    for (let i = 0; i < 20; i++) {
        const qubitGeometry = new THREE.OctahedronGeometry(0.3);
        const qubitMaterial = new THREE.MeshLambertMaterial({
            color: Math.random() > 0.5 ? 0x00ffcc : 0xffcc00,
            transparent: true,
            opacity: 0.7,
            wireframe: Math.random() > 0.5
        });
        
        const qubit = new THREE.Mesh(qubitGeometry, qubitMaterial);
        qubit.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15
        );
        
        qubit.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            rotationSpeed: new THREE.Vector3(
                Math.random() * 0.02,
                Math.random() * 0.02,
                Math.random() * 0.02
            )
        };
        
        scene.add(qubit);
        floatingQubits.push(qubit);
    }

    // Entanglement visualization
    const entanglementLines = [];
    for (let i = 0; i < 5; i++) {
        const qubit1 = floatingQubits[Math.floor(Math.random() * floatingQubits.length)];
        const qubit2 = floatingQubits[Math.floor(Math.random() * floatingQubits.length)];
        
        if (qubit1 !== qubit2) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                qubit1.position,
                qubit2.position
            ]);
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.3
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.userData = { qubit1, qubit2 };
            
            scene.add(line);
            entanglementLines.push(line);
        }
    }

    // Quantum circuit execution simulation
    let executionStep = 0;
    let isExecuting = false;
    
    function executeCircuit() {
        if (isExecuting) return;
        isExecuting = true;
        executionStep = 0;
        
        function executeStep() {
            // Reset previous step
            gates.forEach(gate => {
                gate.active = false;
                if (gate.mesh) {
                    gate.mesh.material.emissive.setHex(0x000000);
                } else if (gate.control) {
                    gate.control.material.emissive.setHex(0x003333);
                    gate.target.material.emissive.setHex(0x332200);
                }
            });
            
            // Activate current step
            gates.forEach(gate => {
                if (gate.step === executionStep) {
                    gate.active = true;
                    
                    if (gate.mesh) {
                        gsap.to(gate.mesh.material.emissive, {
                            duration: 0.5,
                            r: 0.5, g: 0.5, b: 0.5
                        });
                        
                        gsap.to(gate.mesh.scale, {
                            duration: 0.3,
                            x: 1.2, y: 1.2, z: 1.2,
                            yoyo: true,
                            repeat: 1
                        });
                    } else if (gate.control) {
                        gsap.to(gate.control.material.emissive, {
                            duration: 0.5,
                            r: 0, g: 0.8, b: 0.8
                        });
                        gsap.to(gate.target.material.emissive, {
                            duration: 0.5,
                            r: 0.8, g: 0.6, b: 0
                        });
                    }
                }
            });
            
            executionStep++;
            if (executionStep < circuitLength) {
                setTimeout(executeStep, 800);
            } else {
                setTimeout(() => {
                    isExecuting = false;
                }, 1000);
            }
        }
        
        executeStep();
    }

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const gateObjects = gates.map(g => g.mesh || g.control).filter(Boolean);
        const intersects = raycaster.intersectObjects(gateObjects);
        
        if (intersects.length > 0 && !isExecuting) {
            executeCircuit();
        }
    }

    window.addEventListener('mousemove', onMouseMove);

    // Auto-execute every 8 seconds
    setInterval(() => {
        if (!isExecuting) executeCircuit();
    }, 8000);

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        
        // Animate floating qubits
        floatingQubits.forEach(qubit => {
            qubit.position.add(qubit.userData.velocity);
            qubit.rotation.x += qubit.userData.rotationSpeed.x;
            qubit.rotation.y += qubit.userData.rotationSpeed.y;
            qubit.rotation.z += qubit.userData.rotationSpeed.z;
            
            // Boundary bouncing
            if (Math.abs(qubit.position.x) > 15) qubit.userData.velocity.x *= -1;
            if (Math.abs(qubit.position.y) > 10) qubit.userData.velocity.y *= -1;
            if (Math.abs(qubit.position.z) > 7) qubit.userData.velocity.z *= -1;
        });
        
        // Update entanglement lines
        entanglementLines.forEach(line => {
            const positions = line.geometry.attributes.position.array;
            positions[0] = line.userData.qubit1.position.x;
            positions[1] = line.userData.qubit1.position.y;
            positions[2] = line.userData.qubit1.position.z;
            positions[3] = line.userData.qubit2.position.x;
            positions[4] = line.userData.qubit2.position.y;
            positions[5] = line.userData.qubit2.position.z;
            line.geometry.attributes.position.needsUpdate = true;
            
            // Pulse opacity
            line.material.opacity = 0.2 + Math.sin(frameCount * 0.05) * 0.1;
        });
        
        renderer.render(scene, camera);
    }

    // GSAP scroll trigger
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
            // Animate circuit in
            gates.forEach((gate, index) => {
                const target = gate.mesh || gate.control;
                if (target) {
                    gsap.from(target.scale, {
                        duration: 1,
                        x: 0, y: 0, z: 0,
                        delay: index * 0.1,
                        ease: "back.out(1.7)"
                    });
                }
            });
            
            // Start execution after animation
            setTimeout(executeCircuit, 2000);
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
        right: 5%;
        z-index: 10;
        color: white;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        text-align: right;
    `;
    
    overlay.innerHTML = `
        <h2 style="font-size: 3em; margin-bottom: 0.5em; color: #00ffcc;">
            QUANTUM COMPUTING
        </h2>
        <p style="font-size: 1.2em; max-width: 400px; line-height: 1.5;">
            Harnessing quantum mechanics for revolutionary computational
            approaches to cryptography, optimization, and financial modeling.
        </p>
        <div style="margin-top: 2em; font-size: 0.9em; opacity: 0.7;">
            Quantum algorithms • Cryptographic protocols • Portfolio optimization
        </div>
        <div style="margin-top: 1em; font-size: 0.8em; opacity: 0.5;">
            Hover to trigger quantum circuit execution
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
