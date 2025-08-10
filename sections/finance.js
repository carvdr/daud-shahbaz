// sections/finance.js
// Hand-crafted financial data visualization
// Author: Daud Shahbaz

export function initFinance() {
    const section = document.getElementById('finance');
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
    camera.position.set(0, 5, 15);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ffaa, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Stock ticker data (mock)
    const stocks = [
        { symbol: 'AAPL', price: 185.42, change: +2.34 },
        { symbol: 'TSLA', price: 242.68, change: -5.12 },
        { symbol: 'NVDA', price: 476.89, change: +12.45 },
        { symbol: 'MSFT', price: 378.91, change: +0.89 },
        { symbol: 'GOOGL', price: 142.56, change: -1.23 }
    ];

    // Create floating holographic ticker displays
    const tickers = [];
    stocks.forEach((stock, index) => {
        // Ticker background plane
        const tickerGeometry = new THREE.PlaneGeometry(3, 0.8);
        const tickerMaterial = new THREE.MeshLambertMaterial({
            color: stock.change > 0 ? 0x00ff88 : 0xff4444,
            transparent: true,
            opacity: 0.7
        });
        
        const ticker = new THREE.Mesh(tickerGeometry, tickerMaterial);
        ticker.position.set(
            (index - 2) * 4,
            Math.sin(index * 0.5) * 2 + 3,
            Math.cos(index * 0.3) * 3
        );
        ticker.userData = { stock, index, originalY: ticker.position.y };
        
        scene.add(ticker);
        tickers.push(ticker);
    });

    // Create 3D candlestick chart
    const candlesticks = [];
    const chartData = [
        { open: 180, high: 185, low: 178, close: 183 },
        { open: 183, high: 188, low: 181, close: 186 },
        { open: 186, high: 189, low: 184, close: 187 },
        { open: 187, high: 192, low: 185, close: 190 },
        { open: 190, high: 194, low: 188, close: 192 }
    ];

    chartData.forEach((candle, index) => {
        const bodyHeight = Math.abs(candle.close - candle.open) * 0.1;
        const wickHeight = (candle.high - candle.low) * 0.1;
        
        // Candle body
        const bodyGeometry = new THREE.BoxGeometry(0.3, bodyHeight, 0.3);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: candle.close > candle.open ? 0x00ff88 : 0xff4444
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(index * 1.5 - 3, bodyHeight / 2, -5);
        
        // Wick (high-low line)
        const wickGeometry = new THREE.BoxGeometry(0.05, wickHeight, 0.05);
        const wickMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const wick = new THREE.Mesh(wickGeometry, wickMaterial);
        wick.position.set(index * 1.5 - 3, wickHeight / 2, -5);
        
        scene.add(body);
        scene.add(wick);
        candlesticks.push({ body, wick });
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredTicker = null;

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tickers);
        
        // Reset previous hover
        if (hoveredTicker) {
            hoveredTicker.material.opacity = 0.7;
            hoveredTicker.scale.setScalar(1);
        }
        
        // Highlight new hover
        if (intersects.length > 0) {
            hoveredTicker = intersects[0].object;
            hoveredTicker.material.opacity = 1;
            hoveredTicker.scale.setScalar(1.1);
        } else {
            hoveredTicker = null;
        }
    }

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        
        // Floating animation for tickers
        tickers.forEach((ticker, index) => {
            ticker.position.y = ticker.userData.originalY + 
                Math.sin(frameCount * 0.01 + index * 0.5) * 0.3;
            ticker.rotation.y = Math.sin(frameCount * 0.005 + index) * 0.1;
        });
        
        // Rotate chart slightly
        candlesticks.forEach((candle, index) => {
            candle.body.rotation.y = Math.sin(frameCount * 0.003 + index * 0.2) * 0.05;
            candle.wick.rotation.y = candle.body.rotation.y;
        });
        
        // Scroll-based camera movement
        const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 2;
        
        renderer.render(scene, camera);
    }

    // GSAP scroll trigger
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
            // Animate tickers in
            tickers.forEach((ticker, index) => {
                gsap.from(ticker.position, {
                    duration: 1,
                    x: ticker.position.x + 10,
                    y: ticker.position.y - 5,
                    z: ticker.position.z + 5,
                    delay: index * 0.2,
                    ease: "back.out(1.7)"
                });
            });
            
            // Animate candlesticks
            candlesticks.forEach((candle, index) => {
                gsap.from(candle.body.scale, {
                    duration: 0.8,
                    y: 0,
                    delay: index * 0.1,
                    ease: "elastic.out(1, 0.5)"
                });
                gsap.from(candle.wick.scale, {
                    duration: 0.8,
                    y: 0,
                    delay: index * 0.1 + 0.2,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        },
        onLeave: () => {
            // Optional: animate out when leaving section
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
        <h2 style="font-size: 3em; margin-bottom: 0.5em; color: #00ffaa;">
            QUANTITATIVE FINANCE
        </h2>
        <p style="font-size: 1.2em; max-width: 400px; line-height: 1.5;">
            Building algorithmic trading systems and risk models 
            using advanced mathematical frameworks and machine learning.
        </p>
        <div style="margin-top: 2em; font-size: 0.9em; opacity: 0.7;">
            Real-time market data visualization • Portfolio optimization • Risk analysis
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
