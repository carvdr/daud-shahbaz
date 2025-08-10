// sections/neuroscience.js
// Hand-crafted neural network visualization
// Author: Daud Shahbaz

export function initNeuroscience() {
    const section = document.getElementById('neuro');
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
    camera.position.set(0, 0, 20);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x2a2a3a, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00aaff, 1, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Neural network structure
    const layers = [
        { nodeCount: 6, x: -12 },
        { nodeCount: 8, x: -6 },
        { nodeCount: 10, x: 0 },
        { nodeCount: 8, x: 6 },
        { nodeCount: 4, x: 12 }
    ];

    const neurons = [];
    const connections = [];
    
    // Create neurons
    layers.forEach((layer, layerIndex) => {
        const layerNeurons = [];
        
        for (let i = 0; i < layer.nodeCount; i++) {
            // Neuron geometry
            const neuronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const neuronMaterial = new THREE.MeshPhongMaterial({
                color: 0x00aaff,
                emissive: 0x001122,
                transparent: true,
                opacity: 0.8
            });
            
            const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
            neuron.position.set(
                layer.x,
                (i - (layer.nodeCount - 1) / 2) * 2,
                (Math.random() - 0.5) * 3
            );
            
            neuron.userData = {
                layerIndex,
                nodeIndex: i,
                activationLevel: 0,
                baseColor: 0x00aaff,
                fireTime: 0
            };
            
            scene.add(neuron);
            layerNeurons.push(neuron);
        }
        
        neurons.push(layerNeurons);
    });

    // Create connections between layers
    for (let l = 0; l < layers.length - 1; l++) {
        const currentLayer = neurons[l];
        const nextLayer = neurons[l + 1];
        
        currentLayer.forEach(neuron1 => {
            nextLayer.forEach(neuron2 => {
                // Only create some connections (not fully connected)
                if (Math.random() > 0.3) {
                    const points = [neuron1.position, neuron2.position];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    
                    const material = new THREE.LineBasicMaterial({
                        color: 0x004488,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const connection = new THREE.Line(geometry, material);
                    connection.userData = {
                        from: neuron1,
                        to: neuron2,
                        strength: Math.random() * 0.8 + 0.2,
                        active: false
                    };
                    
                    scene.add(connection);
                    connections.push(connection);
                }
            });
        });
    }

    // Mouse interaction for neuron firing
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const allNeurons = neurons.flat();
        const intersects = raycaster.intersectObjects(allNeurons);
        
        if (intersects.length > 0) {
            const hoveredNeuron = intersects[0].object;
            fireNeuron(hoveredNeuron);
        }
    }

    function fireNeuron(neuron) {
        if (Date.now() - neuron.userData.fireTime < 1000) return; // Prevent spam
        
        neuron.userData.fireTime = Date.now();
        neuron.userData.activationLevel = 1;
        
        // Visual firing effect
        gsap.to(neuron.material, {
            duration: 0.3,
            emissive: { r: 0.8, g: 0.4, b: 0 },
            onComplete: () => {
                gsap.to(neuron.material, {
                    duration: 0.7,
                    emissive: { r: 0, g: 0.06, b: 0.13 }
                });
            }
        });
        
        gsap.to(neuron.scale, {
            duration: 0.2,
            x: 1.5, y: 1.5, z: 1.5,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
        
        // Propagate signal to connected neurons
        setTimeout(() => {
            propagateSignal(neuron);
        }, 200);
    }

    function propagateSignal(sourceNeuron) {
        connections.forEach(connection => {
            if (connection.userData.from === sourceNeuron) {
                // Animate connection
                gsap.to(connection.material, {
                    duration: 0.5,
                    opacity: 0.8,
                    color: { r: 0, g: 0.7, b: 1 },
                    onComplete: () => {
                        gsap.to(connection.material, {
                            duration: 0.5,
                            opacity: 0.3,
                            color: { r: 0, g: 0.27, b: 0.53 }
                        });
                    }
                });
                
                // Fire target neuron with delay
                setTimeout(() => {
                    if (Math.random() < connection.userData.strength) {
                        fireNeuron(connection.userData.to);
                    }
                }, 300);
            }
        });
    }

    // Automatic random firing
    function randomFiring() {
        if (Math.random() < 0.1) { // 10% chance each cycle
            const randomLayer = Math.floor(Math.random() * neurons.length);
            const randomNeuron = Math.floor(Math.random() * neurons[randomLayer].length);
            fireNeuron(neurons[randomLayer][randomNeuron]);
        }
        
        setTimeout(randomFiring, 2000 + Math.random() * 3000);
    }

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        
        // Gentle floating motion for neurons
        neurons.forEach((layer, layerIndex) => {
            layer.forEach((neuron, nodeIndex) => {
                neuron.position.y += Math.sin(frameCount * 0.01 + layerIndex + nodeIndex) * 0.002;
                neuron.rotation.x += 0.001;
                neuron.rotation.y += 0.002;
            });
        });
        
        // Pulse ambient light
        pointLight.intensity = 1 + Math.sin(frameCount * 0.02) * 0.2;
        
        renderer.render(scene, camera);
    }

    // GSAP scroll trigger
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
            // Animate neurons in layer by layer
            neurons.forEach((layer, layerIndex) => {
                layer.forEach((neuron, nodeIndex) => {
                    gsap.from(neuron.position, {
                        duration: 1.2,
                        x: neuron.position.x + (layerIndex % 2 === 0 ? -15 : 15),
                        opacity: 0,
                        delay: layerIndex * 0.3 + nodeIndex * 0.1,
                        ease: "back.out(1.7)"
                    });
                });
            });
            
            // Start random firing after animation
            setTimeout(randomFiring, 2000);
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
        <h2 style="font-size: 3em; margin-bottom: 0.5em; color: #00aaff;">
            COMPUTATIONAL NEUROSCIENCE
        </h2>
        <p style="font-size: 1.2em; max-width: 400px; line-height: 1.5;">
            Modeling neural networks and brain dynamics using 
            computational methods and machine learning approaches.
        </p>
        <div style="margin-top: 2em; font-size: 0.9em; opacity: 0.7;">
            Neural simulation • Brain-computer interfaces • Cognitive modeling
        </div>
        <div style="margin-top: 1em; font-size: 0.8em; opacity: 0.5;">
            Hover over neurons to trigger firing patterns
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
