class AGITakeoffVisualizer {
    constructor() {
        this.counter = document.getElementById('counter');
        this.particlesContainer = document.getElementById('particles');
        this.visualizeBtn = document.getElementById('runSimulation');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.currentCount = 0;
        this.isVisualizing = false;
        this.particles = [];
        this.animationId = null;
        
        // AGI Parameters
        this.params = {
            agiTrainingRequirement: 1e36,
            effectiveFlopGap: 1e4,
            trainingGoodsVsRD: 3,
            agiRuntimeRequirement: 1.6667e16,
            maximumTradeOff: 30,
            labourSubstitutionRD: -0.5,
            returnsToHardware: 5.2,
            returnsToSoftware: 1.25,
            rdParallelizationPenalty: 0.7,
            growthRateFractionGWPCompute: 0.19,
            growthRateFractionComputeTraining: 0.5475,
            wakeupGrowthRateFractionGWPBuyingCompute: 0.19,
            wakeupGrowthRateFractionComputeTraining: 1.1,
            maxFractionComputeTraining: 0.1,
            initialBiggestTrainingRun: 3e24,
            wakeupTrigger: 0.06
        };
        
        this.charts = {};
        this.currentYear = 2024;
        
        this.init();
    }
    
    init() {
        this.visualizeBtn.addEventListener('click', () => this.toggleVisualization());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.initializeControls();
        this.createCharts();
        this.updateTimeline();
        this.updateRiskAnalysis();
        
        // Start with some ambient particles
        this.createAmbientParticles();
    }
    
    initializeControls() {
        const controls = ['returnsHardware', 'returnsSoftware', 'wakeupGrowth', 'maxTrainingFraction'];
        
        controls.forEach(controlId => {
            const slider = document.getElementById(controlId);
            const valueDisplay = slider.nextElementSibling;
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value;
                
                // Update parameters
                switch(controlId) {
                    case 'returnsHardware':
                        this.params.returnsToHardware = value;
                        break;
                    case 'returnsSoftware':
                        this.params.returnsToSoftware = value;
                        break;
                    case 'wakeupGrowth':
                        this.params.wakeupGrowthRateFractionComputeTraining = value;
                        break;
                    case 'maxTrainingFraction':
                        this.params.maxFractionComputeTraining = value;
                        break;
                }
                
                this.updateCharts();
                this.updateTimeline();
                this.updateRiskAnalysis();
            });
        });
        
        document.getElementById('runSimulation').addEventListener('click', () => this.runTakeoffSimulation());
    }
    
    createCharts() {
        this.createTrainingChart();
        this.createTakeoffChart();
    }
    
    createTrainingChart() {
        const ctx = document.getElementById('trainingChart').getContext('2d');
        const data = this.generateTrainingData();
        
        this.charts.training = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Training Compute (FLOP)',
                    data: data,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    tension: 0.4,
                    pointRadius: 0
                }, {
                    label: 'AGI Threshold',
                    data: data.map(point => ({x: point.x, y: this.params.agiTrainingRequirement})),
                    borderColor: '#ff0066',
                    borderDash: [5, 5],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Year', color: '#ffffff' },
                        ticks: { color: '#cccccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        type: 'logarithmic',
                        title: { display: true, text: 'FLOP', color: '#ffffff' },
                        ticks: { color: '#cccccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    createTakeoffChart() {
        const ctx = document.getElementById('takeoffChart').getContext('2d');
        const scenarios = this.generateTakeoffScenarios();
        
        this.charts.takeoff = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Slow Takeoff',
                    data: scenarios.slow,
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Fast Takeoff',
                    data: scenarios.fast,
                    borderColor: '#ff0066',
                    backgroundColor: 'rgba(255, 0, 102, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Superintelligence',
                    data: scenarios.superintelligence,
                    borderColor: '#ffff00',
                    backgroundColor: 'rgba(255, 255, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Years from AGI', color: '#ffffff' },
                        ticks: { color: '#cccccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Capability Multiplier', color: '#ffffff' },
                        ticks: { color: '#cccccc' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    generateTrainingData() {
        const data = [];
        const startYear = 2020;
        const endYear = 2040;
        
        for (let year = startYear; year <= endYear; year++) {
            const yearsFromStart = year - startYear;
            const baseGrowth = this.params.growthRateFractionComputeTraining;
            const compute = this.params.initialBiggestTrainingRun * Math.pow(1 + baseGrowth, yearsFromStart);
            data.push({x: year, y: compute});
        }
        
        return data;
    }
    
    generateTakeoffScenarios() {
        const scenarios = {
            slow: [],
            fast: [],
            superintelligence: []
        };
        
        for (let years = 0; years <= 20; years++) {
            const t = years;
            
            // Slow takeoff - gradual improvement
            scenarios.slow.push({
                x: t,
                y: 1 + Math.pow(t, 1.5) * 0.2
            });
            
            // Fast takeoff - exponential improvement
            scenarios.fast.push({
                x: t,
                y: Math.pow(this.params.returnsToHardware, t * 0.5)
            });
            
            // Superintelligence - recursive self-improvement
            scenarios.superintelligence.push({
                x: t,
                y: t < 2 ? 1 : Math.pow(10, t - 1)
            });
        }
        
        return scenarios;
    }
    
    updateCharts() {
        if (this.charts.training) {
            this.charts.training.data.datasets[0].data = this.generateTrainingData();
            this.charts.training.update();
        }
        
        if (this.charts.takeoff) {
            const scenarios = this.generateTakeoffScenarios();
            this.charts.takeoff.data.datasets[0].data = scenarios.slow;
            this.charts.takeoff.data.datasets[1].data = scenarios.fast;
            this.charts.takeoff.data.datasets[2].data = scenarios.superintelligence;
            this.charts.takeoff.update();
        }
    }
    
    updateTimeline() {
        const agiYear = this.calculateAGIYear();
        const superintelligenceYear = agiYear + this.calculateSuperintelligenceDelay();
        
        document.getElementById('agiDate').textContent = `${agiYear}: AGI Threshold`;
        document.getElementById('superintelligenceDate').textContent = `${superintelligenceYear}: Superintelligence`;
    }
    
    calculateAGIYear() {
        const growthRate = this.params.growthRateFractionComputeTraining;
        const current = this.params.initialBiggestTrainingRun;
        const target = this.params.agiTrainingRequirement;
        const yearsNeeded = Math.log(target / current) / Math.log(1 + growthRate);
        return Math.round(2024 + yearsNeeded);
    }
    
    calculateSuperintelligenceDelay() {
        // Based on takeoff speed parameters
        const baseDelay = 5; // years
        const speedFactor = this.params.returnsToHardware / 5.2; // normalized
        return Math.max(1, Math.round(baseDelay / speedFactor));
    }
    
    updateRiskAnalysis() {
        const hardwareReturns = this.params.returnsToHardware;
        const softwareReturns = this.params.returnsToSoftware;
        
        // Calculate probabilities based on parameters
        const fastProb = Math.min(50, Math.max(10, (hardwareReturns - 3) * 10));
        const slowProb = Math.min(50, Math.max(10, 60 - hardwareReturns * 8));
        const moderateProb = 100 - fastProb - slowProb;
        
        document.getElementById('fastProb').textContent = `${Math.round(fastProb)}%`;
        document.getElementById('slowProb').textContent = `${Math.round(slowProb)}%`;
        document.getElementById('moderateProb').textContent = `${Math.round(moderateProb)}%`;
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
        this.visualizeBtn.textContent = 'Run Takeoff Simulation';
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
    
    runTakeoffSimulation() {
        this.isVisualizing = true;
        this.visualizeBtn = document.getElementById('runSimulation');
        this.visualizeBtn.textContent = 'Simulating...';
        this.visualizeBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff0066)';
        
        // Create dramatic visual effects
        this.createSimulationEffects();
        
        setTimeout(() => {
            this.visualizeBtn.textContent = 'Run Takeoff Simulation';
            this.visualizeBtn.style.background = 'linear-gradient(45deg, #00ffff, #ff00ff)';
            this.isVisualizing = false;
        }, 5000);
    }
    
    createSimulationEffects() {
        // Enhanced particle effects for simulation
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 100);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AGITakeoffVisualizer();
    
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