// main.js
// Portfolio initialization and section management
// Author: Daud Shahbaz

// Import section modules
import { initIntro } from './sections/intro.js';
import { initFinance } from './sections/finance.js';
import { initNeuroscience } from './sections/neuroscience.js';
import { initAI } from './sections/ai.js';
import { initQuantum } from './sections/quantum.js';
import { initPlasma } from './sections/plasma.js';

// Global state management
const portfolioState = {
    sectionsInitialized: [],
    cleanupFunctions: [],
    currentSection: null
};

// Section configuration
const sectionConfig = [
    { id: 'intro', initFunction: initIntro, name: 'Introduction' },
    { id: 'finance', initFunction: initFinance, name: 'Financial Analytics' },
    { id: 'neuroscience', initFunction: initNeuroscience, name: 'Neuroscience Research' },
    { id: 'ai', initFunction: initAI, name: 'Artificial Intelligence' },
    { id: 'quantum', initFunction: initQuantum, name: 'Quantum Computing' },
    { id: 'plasma', initFunction: initPlasma, name: 'Plasma Physics' }
];

// Initialize portfolio
function initPortfolio() {
    console.log('Initializing 3D Portfolio...');
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize sections sequentially
    sectionConfig.forEach((config, index) => {
        try {
            console.log(`Initializing ${config.name}...`);
            const cleanup = config.initFunction();
            
            if (cleanup && typeof cleanup === 'function') {
                portfolioState.cleanupFunctions.push(cleanup);
            }
            
            portfolioState.sectionsInitialized.push(config.id);
            console.log(`✓ ${config.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize ${config.name}:`, error);
        }
    });
    
    // Setup section navigation
    setupSectionNavigation();
    
    // Setup scroll monitoring
    setupScrollMonitoring();
    
    console.log('Portfolio initialization complete');
    console.log(`Initialized sections: ${portfolioState.sectionsInitialized.join(', ')}`);
}

// Section navigation setup
function setupSectionNavigation() {
    const navContainer = document.createElement('nav');
    navContainer.style.cssText = `
        position: fixed;
        top: 50%;
        right: 30px;
        transform: translateY(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    sectionConfig.forEach(config => {
        const navDot = document.createElement('div');
        navDot.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.5);
        `;
        
        navDot.addEventListener('click', () => {
            const section = document.getElementById(config.id);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        navDot.addEventListener('mouseenter', () => {
            navDot.style.background = 'rgba(255, 255, 255, 0.8)';
            navDot.style.transform = 'scale(1.2)';
        });
        
        navDot.addEventListener('mouseleave', () => {
            navDot.style.background = 'rgba(255, 255, 255, 0.3)';
            navDot.style.transform = 'scale(1)';
        });
        
        navContainer.appendChild(navDot);
    });
    
    document.body.appendChild(navContainer);
}

// Scroll monitoring for section detection
function setupScrollMonitoring() {
    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            const currentScrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Determine current section
            sectionConfig.forEach(config => {
                const section = document.getElementById(config.id);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                        if (portfolioState.currentSection !== config.id) {
                            portfolioState.currentSection = config.id;
                            console.log(`Now viewing: ${config.name}`);
                        }
                    }
                }
            });
        }
    });
}

// Cleanup function
function cleanupPortfolio() {
    console.log('Cleaning up portfolio...');
    
    portfolioState.cleanupFunctions.forEach(cleanup => {
        try {
            cleanup();
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    });
    
    portfolioState.cleanupFunctions = [];
    portfolioState.sectionsInitialized = [];
    
    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}

// Performance monitoring
function logPerformanceMetrics() {
    if (performance.mark) {
        performance.mark('portfolio-init-complete');
        
        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
            const navigation = entries[0];
            console.log(`Page load time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    performance.mark('portfolio-init-start');
    
    try {
        initPortfolio();
        logPerformanceMetrics();
    } catch (error) {
        console.error('Failed to initialize portfolio:', error);
    }
});

// Handle page unload cleanup
window.addEventListener('beforeunload', cleanupPortfolio);

// Export for debugging
window.portfolioDebug = {
    state: portfolioState,
    cleanup: cleanupPortfolio,
    reinit: initPortfolio
};
