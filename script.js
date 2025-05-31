class FLOPSVisualizer {
    constructor() {
        this.counter = document.getElementById('counter');
        this.particlesContainer = document.getElementById('particles');
        this.visualizeBtn = document.getElementById('visualizeBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.currentCount = 0;
        this.isVisualizing = false;
        this.particles = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.visualizeBtn.addEventListener('click', () => this.toggleVisualization());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Start with some ambient particles
        this.createAmbientParticles();
    }
    
    toggleVisualization() {
        if (this.isVisualizing) {
            this.stopVisualization();
        } else {
            this.startVisualization();
        }
    }
    
    startVisualization() {
        this.isVisualizing = true;
        this.visualizeBtn.textContent = 'Stop Visualization';
        this.visualizeBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff0066)';
        
        this.animate();
    }
    
    stopVisualization() {
        this.isVisualizing = false;
        this.visualizeBtn.textContent = 'Visualize Operations';
        this.visualizeBtn.style.background = 'linear-gradient(45deg, #00ffff, #ff00ff)';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isVisualizing) return;
        
        // Increment counter (simulating operations)
        this.currentCount += Math.floor(Math.random() * 1000000) + 100000;
        this.updateCounter();
        
        // Create particles
        if (Math.random() < 0.7) {
            this.createParticle();
        }
        
        // Clean up old particles
        this.cleanupParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateCounter() {
        // Format large numbers
        const formatted = this.formatNumber(this.currentCount);
        this.counter.textContent = formatted;
        
        // Add pulse effect
        this.counter.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.counter.style.transform = 'scale(1)';
        }, 100);
    }
    
    formatNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        return (num / 1000000000000).toFixed(1) + 'T';
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 10;
        
        // Random color
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff4444'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.background = color;
        particle.style.boxShadow = `0 0 6px ${color}`;
        
        // Random animation duration
        const duration = (Math.random() * 2 + 1) + 's';
        particle.style.animationDuration = duration;
        
        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 200;
        particle.style.setProperty('--drift', drift + 'px');
        
        this.particlesContainer.appendChild(particle);
        this.particles.push({
            element: particle,
            createdAt: Date.now()
        });
    }
    
    createAmbientParticles() {
        // Create some initial particles for ambiance
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                if (!this.isVisualizing) {
                    this.createParticle();
                }
            }, i * 200);
        }
        
        // Continue creating ambient particles
        if (!this.isVisualizing) {
            setTimeout(() => this.createAmbientParticles(), 3000);
        }
    }
    
    cleanupParticles() {
        const now = Date.now();
        this.particles = this.particles.filter(particle => {
            if (now - particle.createdAt > 3000) {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                return false;
            }
            return true;
        });
    }
    
    reset() {
        this.stopVisualization();
        this.currentCount = 0;
        this.counter.textContent = '0';
        
        // Clear all particles
        this.particles.forEach(particle => {
            if (particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];
        
        // Restart ambient particles
        setTimeout(() => this.createAmbientParticles(), 500);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FLOPSVisualizer();
    
    // Add some interactive effects to comparison cards
    const comparisonCards = document.querySelectorAll('.comparison-card');
    comparisonCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const bar = card.querySelector('.bar-fill');
            if (bar && !bar.classList.contains('full')) {
                bar.style.transform = 'scaleX(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const bar = card.querySelector('.bar-fill');
            if (bar && !bar.classList.contains('full')) {
                bar.style.transform = 'scaleX(1)';
            }
        });
    });
    
    // Animate comparison bars on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-50px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.bar-fill');
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.opacity = '1';
                        bar.style.transform = 'scaleX(1)';
                    }, index * 200);
                });
            }
        });
    }, observerOptions);
    
    const comparisonGrid = document.querySelector('.comparison-grid');
    if (comparisonGrid) {
        observer.observe(comparisonGrid);
    }
});

// Add some dynamic background effects
function createBackgroundEffect() {
    const body = document.body;
    const rect = document.createElement('div');
    rect.style.position = 'fixed';
    rect.style.width = '2px';
    rect.style.height = '2px';
    rect.style.background = '#00ffff';
    rect.style.borderRadius = '50%';
    rect.style.pointerEvents = 'none';
    rect.style.zIndex = '0';
    rect.style.opacity = '0.3';
    rect.style.left = Math.random() * window.innerWidth + 'px';
    rect.style.top = Math.random() * window.innerHeight + 'px';
    rect.style.boxShadow = '0 0 4px #00ffff';
    
    body.appendChild(rect);
    
    // Animate the background effect
    let opacity = 0.3;
    let scale = 1;
    const animate = () => {
        opacity -= 0.01;
        scale += 0.02;
        rect.style.opacity = opacity;
        rect.style.transform = `scale(${scale})`;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            body.removeChild(rect);
        }
    };
    
    requestAnimationFrame(animate);
}

// Create background effects periodically
setInterval(createBackgroundEffect, 2000);

