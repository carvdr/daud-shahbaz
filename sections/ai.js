// sections/ai.js
// Hand-crafted AI and data science visualization
// Author: Daud Shahbaz

export function initAI() {
    const section = document.getElementById('ai');
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
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xff00aa, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Data points for clustering
    const dataPoints = [];
    const clusters = [
        { center: { x: -5, y: 3, z: -3 }, color: 0xff0080, points: [] },
        { center: { x: 5, y: -2, z: 4 }, color: 0x00ff80, points: [] },
        { center: { x: 0, y: 5, z: 0 }, color: 0x8000ff, points: [] },
        { center: { x: -3, y: -4, z: 5 }, color: 0x80ff00, points: [] }
    ];

    // Create random data points
    for (let i = 0; i < 200; i++) {
        const pointGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const pointMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        
        // Random initial position
        point.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 20
        );
        
        point.userData = {
            originalPosition: point.position.clone(),
            targetPosition: point.position.clone(),
            clusterId: -1,
            speed: Math.random() * 0.02 + 0.01
        };
        
        scene.add(point);
        dataPoints.push(point);
    }

    // Assign points to clusters
    function assignClusters() {
        clusters.forEach(cluster => cluster.points = []);
        
        dataPoints.forEach(point => {
            let minDistance = Infinity;
            let closestCluster = 0;
            
            clusters.forEach((cluster, index) => {
                const distance = point.position.distanceTo(
                    new THREE.Vector3(cluster.center.x, cluster.center.y, cluster.center.z)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = index;
                }
            });
            
            point.userData.clusterId = closestCluster;
            clusters[closestCluster].points.push(point);
            
            // Set target position near cluster center
            const cluster = clusters[closestCluster];
            point.userData.targetPosition.set(
                cluster.center.x + (Math.random() - 0.5) * 4,
                cluster.center.y + (Math.random() - 0.5) * 4,
                cluster.center.z + (Math.random() - 0.5) * 4
            );
            
            // Animate to cluster color
            gsap.to(point.material.color, {
                duration: 2,
                r: ((cluster.color >> 16) & 255) / 255,
                g: ((cluster.color >> 8) & 255) / 255,
                b: (cluster.color & 255) / 255,
                ease: "power2.inOut"
            });
        });
    }

    // Scatter points randomly
    function scatterPoints() {
        dataPoints.forEach(point => {
            point.userData.targetPosition.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 20
            );
            
            // Reset to white
            gsap.to(point.material.color, {
                duration: 1.5,
                r: 1, g: 1, b: 1,
                ease: "power2.inOut"
            });
        });
    }

    // Create cluster center indicators
    const clusterCenters = [];
    clusters.forEach(cluster => {
        const centerGeometry = new THREE.OctahedronGeometry(0.5);
        const centerMaterial = new THREE.MeshLambertMaterial({
            color: cluster.color,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(cluster.center.x, cluster.center.y, cluster.center.z);
        center.userData = { cluster };
        
        scene.add(center);
        clusterCenters.push(center);
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedPoint = null;
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(dataPoints);
        
        // Reset previous selection
        if (selectedPoint) {
            selectedPoint.scale.setScalar(1);
            selectedPoint.material.opacity = 0.8;
        }
        
        // Highlight new selection
        if (intersects.length > 0) {
            selectedPoint = intersects[0].object;
            selectedPoint.scale.setScalar(2);
            selectedPoint.material.opacity = 1;
            
            // Show data insight tooltip (simulate)
            showDataInsight(selectedPoint);
        } else {
            selectedPoint = null;
            hideDataInsight();
        }
    }
    
    let tooltip = null;
    function showDataInsight(point) {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                pointer-events: none;
                z-index: 20;
                border: 1px solid #ff00aa;
            `;
            section.appendChild(tooltip);
        }
        
        const cluster = clusters[point.userData.clusterId];
        tooltip.innerHTML = `
            Data Point #${dataPoints.indexOf(point)}<br>
            Cluster: ${point.userData.clusterId >= 0 ? point.userData.clusterId + 1 : 'Unassigned'}<br>
            Position: (${point.position.x.toFixed(1)}, ${point.position.y.toFixed(1)}, ${point.position.z.toFixed(1)})<br>
            Confidence: ${(Math.random() * 100).toFixed(1)}%
        `;
        
        tooltip.style.left = (mouse.x * 0.5 + 0.5) * window.innerWidth + 'px';
        tooltip.style.top = (-mouse.y * 0.5 + 0.5) * window.innerHeight + 'px';
        tooltip.style.display = 'block';
    }
    
    function hideDataInsight() {
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    window.addEventListener('mousemove', onMouseMove);

    // Animation state
    let isClusterMode = false;
    let lastToggle = 0;
    
    function toggleVisualization() {
        const now = Date.now();
        if (now - lastToggle < 3000) return; // Prevent rapid toggling
        
        lastToggle = now;
        isClusterMode = !isClusterMode;
        
        if (isClusterMode) {
            assignClusters();
        } else {
            scatterPoints();
        }
    }

    // Auto-toggle every 6 seconds
    setInterval(toggleVisualization, 6000);

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        
        // Move points toward their targets
        dataPoints.forEach(point => {
            point.position.lerp(point.userData.targetPosition, point.userData.speed);
        });
        
        // Rotate cluster centers
        clusterCenters.forEach((center, index) => {
            center.rotation.x += 0.01;
            center.rotation.y += 0.005;
            center.scale.setScalar(1 + Math.sin(frameCount * 0.02 + index) * 0.1);
        });
        
        // Rotate camera slightly
        camera.position.x = Math.cos(frameCount * 0.001) * 16;
        camera.position.z = Math.sin(frameCount * 0.001) * 16;
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
            // Animate points in with stagger
            dataPoints.forEach((point, index) => {
                gsap.from(point.scale, {
                    duration: 1,
                    x: 0, y: 0, z: 0,
                    delay: index * 0.01,
                    ease: "back.out(1.7)"
                });
            });
            
            // Start with clustering after 2 seconds
            setTimeout(() => {
                isClusterMode = true;
                assignClusters();
            }, 2000);
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
        <h2 style="font-size: 3em; margin-bottom: 0.5em; color: #ff00aa;">
            DATA SCIENCE & AI
        </h2>
        <p style="font-size: 1.2em; max-width: 400px; line-height: 1.5;">
            Extracting insights from complex datasets using machine learning,
            statistical analysis, and advanced visualization techniques.
        </p>
        <div style="margin-top: 2em; font-size: 0.9em; opacity: 0.7;">
            Clustering algorithms • Pattern recognition • Predictive modeling
        </div>
        <div style="margin-top: 1em; font-size: 0.8em; opacity: 0.5;">
            Hover over data points for insights
        </div>
    `;
    
    section.appendChild(overlay);

    // Return cleanup function
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        if (tooltip) tooltip.remove();
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === section) trigger.kill();
        });
    };
}
