// Happy Flappie Bird Game
class HappyFlappieBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        
        // Game state
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        
        // Bird properties
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 30,
            height: 25,
            velocity: 0,
            gravity: 0.4,
            jumpStrength: -7,
            color: '#FFD700'
        };
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 180;
        this.pipeSpeed = 1.5;
        this.pipeSpawnRate = 160; // frames between pipes
        this.frameCount = 0;
        
        // Clouds for background
        this.clouds = [];
        this.initClouds();
        
        // Ralph properties
        this.ralph = {
            x: this.canvas.width + 50,
            y: this.canvas.height / 2,
            width: 80,
            height: 100,
            speed: 1.2,
            shootTimer: 0,
            shootInterval: 90, // frames between shots
            isActive: false
        };
        
        // Cheeseburger bullets
        this.cheeseburgers = [];
        
        // Bind events
        this.bindEvents();
        this.bindControls();
        
        // Start game loop
        this.gameLoop();
    }
    
    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                size: Math.random() * 30 + 20,
                speed: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.flap();
            }
        });
        
        // Keyup to prevent multiple rapid fires
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            this.flap();
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.flap();
        });
    }
    
    bindControls() {
        // Gravity control
        const gravityControl = document.getElementById('gravityControl');
        const gravityValue = document.getElementById('gravityValue');
        gravityControl.addEventListener('input', (e) => {
            this.bird.gravity = parseFloat(e.target.value);
            gravityValue.textContent = e.target.value;
        });
        
        // Jump strength control
        const jumpControl = document.getElementById('jumpControl');
        const jumpValue = document.getElementById('jumpValue');
        jumpControl.addEventListener('input', (e) => {
            this.bird.jumpStrength = parseFloat(e.target.value);
            jumpValue.textContent = e.target.value;
        });
        
        // Pipe speed control
        const pipeSpeedControl = document.getElementById('pipeSpeedControl');
        const pipeSpeedValue = document.getElementById('pipeSpeedValue');
        pipeSpeedControl.addEventListener('input', (e) => {
            this.pipeSpeed = parseFloat(e.target.value);
            pipeSpeedValue.textContent = e.target.value;
        });
        
        // Pipe gap control
        const pipeGapControl = document.getElementById('pipeGapControl');
        const pipeGapValue = document.getElementById('pipeGapValue');
        pipeGapControl.addEventListener('input', (e) => {
            this.pipeGap = parseInt(e.target.value);
            pipeGapValue.textContent = e.target.value;
        });
        
        // Spawn rate control
        const spawnRateControl = document.getElementById('spawnRateControl');
        const spawnRateValue = document.getElementById('spawnRateValue');
        spawnRateControl.addEventListener('input', (e) => {
            this.pipeSpawnRate = parseInt(e.target.value);
            spawnRateValue.textContent = e.target.value;
        });
    }
    
    flap() {
        if (this.gameState === 'start') {
            this.gameState = 'playing';
        }
        
        if (this.gameState === 'playing') {
            this.bird.velocity = this.bird.jumpStrength;
        }
        
        if (this.gameState === 'gameOver') {
            this.resetGame();
        }
    }
    
    resetGame() {
        this.gameState = 'start';
        this.score = 0;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.cheeseburgers = [];
        this.ralph.isActive = false;
        this.ralph.shootTimer = 0;
        this.frameCount = 0;
        this.updateScore();
    }
    
    updateBird() {
        if (this.gameState === 'playing') {
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
        }
        
        // Keep bird on screen during start state
        if (this.gameState === 'start') {
            this.bird.y = this.canvas.height / 2 + Math.sin(this.frameCount * 0.05) * 10;
        }
    }
    
    updatePipes() {
        if (this.gameState !== 'playing') return;
        
        // Spawn new pipes
        if (this.frameCount % this.pipeSpawnRate === 0) {
            const pipeHeight = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                topHeight: pipeHeight,
                bottomY: pipeHeight + this.pipeGap,
                bottomHeight: this.canvas.height - (pipeHeight + this.pipeGap),
                passed: false
            });
        }
        
        // Update pipe positions
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Score when bird passes pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * this.canvas.height * 0.3;
            }
        });
    }
    
    updateRalph() {
        if (this.gameState !== 'playing') return;
        
        // Activate Ralph after score reaches 3
        if (this.score >= 3) {
            this.ralph.isActive = true;
        }
        
        if (!this.ralph.isActive) return;
        
        // Ralph follows the bird but stays behind
        const targetY = this.bird.y - this.ralph.height / 2 + this.bird.height / 2;
        const yDiff = targetY - this.ralph.y;
        this.ralph.y += yDiff * 0.02; // Smooth following
        
        // Keep Ralph on screen
        this.ralph.y = Math.max(0, Math.min(this.canvas.height - this.ralph.height, this.ralph.y));
        
        // Ralph stays at the right side of screen
        this.ralph.x = this.canvas.width - this.ralph.width - 20;
        
        // Shooting logic
        this.ralph.shootTimer++;
        if (this.ralph.shootTimer >= this.ralph.shootInterval) {
            this.shootCheeseburger();
            this.ralph.shootTimer = 0;
        }
    }
    
    shootCheeseburger() {
        // Calculate angle to bird
        const dx = this.bird.x - (this.ralph.x + this.ralph.width / 2);
        const dy = this.bird.y - (this.ralph.y + this.ralph.height / 2);
        const angle = Math.atan2(dy, dx);
        
        this.cheeseburgers.push({
            x: this.ralph.x + this.ralph.width / 2,
            y: this.ralph.y + this.ralph.height / 2,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            size: 20,
            rotation: 0
        });
    }
    
    updateCheeseburgers() {
        if (this.gameState !== 'playing') return;
        
        for (let i = this.cheeseburgers.length - 1; i >= 0; i--) {
            const burger = this.cheeseburgers[i];
            burger.x += burger.vx;
            burger.y += burger.vy;
            burger.rotation += 0.2;
            
            // Remove burgers that are off screen
            if (burger.x < -50 || burger.x > this.canvas.width + 50 || 
                burger.y < -50 || burger.y > this.canvas.height + 50) {
                this.cheeseburgers.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        if (this.gameState !== 'playing') return;
        
        // Ground and ceiling collision
        if (this.bird.y <= 0 || this.bird.y + this.bird.height >= this.canvas.height) {
            this.gameState = 'gameOver';
            return;
        }
        
        // Pipe collision
        for (const pipe of this.pipes) {
            // Check if bird is in pipe's x range
            if (this.bird.x < pipe.x + this.pipeWidth && 
                this.bird.x + this.bird.width > pipe.x) {
                
                // Check if bird hits top or bottom pipe
                if (this.bird.y < pipe.topHeight || 
                    this.bird.y + this.bird.height > pipe.bottomY) {
                    this.gameState = 'gameOver';
                    return;
                }
            }
        }
        
        // Cheeseburger collision
        for (let i = this.cheeseburgers.length - 1; i >= 0; i--) {
            const burger = this.cheeseburgers[i];
            const dx = (this.bird.x + this.bird.width / 2) - burger.x;
            const dy = (this.bird.y + this.bird.height / 2) - burger.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < burger.size + 10) { // Bird radius + burger radius
                this.gameState = 'gameOver';
                return;
            }
        }
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBird() {
        this.ctx.save();
        
        // Rotate bird based on velocity
        const rotation = Math.min(Math.max(this.bird.velocity * 0.1, -0.5), 0.5);
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(rotation);
        
        // Bird body
        this.ctx.fillStyle = this.bird.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, -3, 8, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.width / 2 - 5, -2);
        this.ctx.lineTo(this.bird.width / 2 + 5, 0);
        this.ctx.lineTo(this.bird.width / 2 - 5, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(3, -3, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(4, -3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 3;
        
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Pipe caps
            this.ctx.fillStyle = '#45B7B8';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            
            this.ctx.fillStyle = '#4ECDC4';
        });
    }
    
    drawRalph() {
        if (!this.ralph.isActive) return;
        
        this.ctx.save();
        
        // Ralph's proportions - he's very wide and stocky
        const centerX = this.ralph.x + this.ralph.width / 2;
        const centerY = this.ralph.y + this.ralph.height / 2;
        
        // Ralph's legs (dark blue overalls)
        this.ctx.fillStyle = '#1a237e';
        this.ctx.fillRect(this.ralph.x + 15, this.ralph.y + 75, 15, 25);
        this.ctx.fillRect(this.ralph.x + 50, this.ralph.y + 75, 15, 25);
        
        // Ralph's feet (brown boots)
        this.ctx.fillStyle = '#5d4037';
        this.ctx.fillRect(this.ralph.x + 10, this.ralph.y + 95, 25, 8);
        this.ctx.fillRect(this.ralph.x + 45, this.ralph.y + 95, 25, 8);
        
        // Ralph's torso (red plaid shirt)
        this.ctx.fillStyle = '#c62828';
        this.ctx.fillRect(this.ralph.x + 10, this.ralph.y + 45, 60, 35);
        
        // Plaid pattern on shirt
        this.ctx.strokeStyle = '#8b0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            this.ctx.moveTo(this.ralph.x + 10 + i * 15, this.ralph.y + 45);
            this.ctx.lineTo(this.ralph.x + 10 + i * 15, this.ralph.y + 80);
        }
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(this.ralph.x + 10, this.ralph.y + 45 + i * 12);
            this.ctx.lineTo(this.ralph.x + 70, this.ralph.y + 45 + i * 12);
        }
        this.ctx.stroke();
        
        // Ralph's overalls straps (blue)
        this.ctx.fillStyle = '#1a237e';
        this.ctx.fillRect(this.ralph.x + 20, this.ralph.y + 45, 8, 25);
        this.ctx.fillRect(this.ralph.x + 52, this.ralph.y + 45, 8, 25);
        
        // Overalls main part
        this.ctx.fillStyle = '#1a237e';
        this.ctx.fillRect(this.ralph.x + 15, this.ralph.y + 65, 50, 15);
        
        // Overall buttons (yellow/gold)
        this.ctx.fillStyle = '#ffc107';
        this.ctx.beginPath();
        this.ctx.arc(this.ralph.x + 24, this.ralph.y + 52, 3, 0, Math.PI * 2);
        this.ctx.arc(this.ralph.x + 56, this.ralph.y + 52, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ralph's massive arms
        this.ctx.fillStyle = '#ffb74d'; // Skin tone
        // Left arm
        this.ctx.fillRect(this.ralph.x - 5, this.ralph.y + 50, 20, 12);
        // Right arm  
        this.ctx.fillRect(this.ralph.x + 65, this.ralph.y + 50, 20, 12);
        
        // Ralph's giant fists (much bigger and more detailed)
        this.ctx.fillStyle = '#ffb74d';
        // Left fist
        this.ctx.beginPath();
        this.ctx.ellipse(this.ralph.x - 8, this.ralph.y + 56, 12, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Right fist
        this.ctx.beginPath();
        this.ctx.ellipse(this.ralph.x + 88, this.ralph.y + 56, 12, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fist details (knuckles)
        this.ctx.strokeStyle = '#ff8f00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        // Left fist knuckles
        this.ctx.moveTo(this.ralph.x - 12, this.ralph.y + 52);
        this.ctx.lineTo(this.ralph.x - 4, this.ralph.y + 52);
        this.ctx.moveTo(this.ralph.x - 12, this.ralph.y + 60);
        this.ctx.lineTo(this.ralph.x - 4, this.ralph.y + 60);
        // Right fist knuckles
        this.ctx.moveTo(this.ralph.x + 84, this.ralph.y + 52);
        this.ctx.lineTo(this.ralph.x + 92, this.ralph.y + 52);
        this.ctx.moveTo(this.ralph.x + 84, this.ralph.y + 60);
        this.ctx.lineTo(this.ralph.x + 92, this.ralph.y + 60);
        this.ctx.stroke();
        
        // Ralph's head (proper movie proportions - wide and square)
        this.ctx.fillStyle = '#ffb74d';
        this.ctx.fillRect(this.ralph.x + 20, this.ralph.y + 8, 40, 42);
        
        // Ralph's iconic messy hair (reddish-brown and spiky)
        this.ctx.fillStyle = '#6d4c41';
        // Hair spikes
        this.ctx.beginPath();
        this.ctx.moveTo(this.ralph.x + 20, this.ralph.y + 12);
        this.ctx.lineTo(this.ralph.x + 15, this.ralph.y + 3);
        this.ctx.lineTo(this.ralph.x + 25, this.ralph.y + 8);
        this.ctx.lineTo(this.ralph.x + 22, this.ralph.y + 2);
        this.ctx.lineTo(this.ralph.x + 32, this.ralph.y + 8);
        this.ctx.lineTo(this.ralph.x + 35, this.ralph.y + 1);
        this.ctx.lineTo(this.ralph.x + 42, this.ralph.y + 8);
        this.ctx.lineTo(this.ralph.x + 48, this.ralph.y + 0);
        this.ctx.lineTo(this.ralph.x + 55, this.ralph.y + 8);
        this.ctx.lineTo(this.ralph.x + 65, this.ralph.y + 3);
        this.ctx.lineTo(this.ralph.x + 60, this.ralph.y + 12);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Ralph's distinctive unibrow and angry eyes
        this.ctx.fillStyle = '#6d4c41';
        this.ctx.fillRect(this.ralph.x + 28, this.ralph.y + 20, 24, 4);
        
        // Eye whites
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.ellipse(this.ralph.x + 32, this.ralph.y + 28, 4, 5, 0, 0, Math.PI * 2);
        this.ctx.ellipse(this.ralph.x + 48, this.ralph.y + 28, 4, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils (looking at the bird)
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.ralph.x + 30, this.ralph.y + 28, 2.5, 0, Math.PI * 2);
        this.ctx.arc(this.ralph.x + 46, this.ralph.y + 28, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ralph's big nose
        this.ctx.fillStyle = '#ff8f00';
        this.ctx.beginPath();
        this.ctx.ellipse(this.ralph.x + 40, this.ralph.y + 35, 4, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Nostrils
        this.ctx.fillStyle = '#e65100';
        this.ctx.beginPath();
        this.ctx.arc(this.ralph.x + 38, this.ralph.y + 37, 1, 0, Math.PI * 2);
        this.ctx.arc(this.ralph.x + 42, this.ralph.y + 37, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ralph's mouth (grumpy/determined expression)
        this.ctx.strokeStyle = '#5d4037';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.ralph.x + 40, this.ralph.y + 42, 6, 0.3, Math.PI - 0.3);
        this.ctx.stroke();
        
        // Add some facial stubble
        this.ctx.fillStyle = '#8d6e63';
        for (let i = 0; i < 8; i++) {
            const stubbleX = this.ralph.x + 25 + Math.random() * 30;
            const stubbleY = this.ralph.y + 40 + Math.random() * 8;
            this.ctx.beginPath();
            this.ctx.arc(stubbleX, stubbleY, 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawCheeseburgers() {
        this.cheeseburgers.forEach(burger => {
            this.ctx.save();
            this.ctx.translate(burger.x, burger.y);
            this.ctx.rotate(burger.rotation);
            
            // Bottom bun
            this.ctx.fillStyle = '#DEB887';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, burger.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Lettuce
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(0, -3, burger.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Meat patty
            this.ctx.fillStyle = '#8B4513';
            this.ctx.beginPath();
            this.ctx.arc(0, -6, burger.size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cheese
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(0, -9, burger.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Top bun
            this.ctx.fillStyle = '#DEB887';
            this.ctx.beginPath();
            this.ctx.arc(0, -12, burger.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Sesame seeds
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const x = Math.cos(angle) * 8;
                const y = Math.sin(angle) * 8 - 12;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    drawUI() {
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.gameState === 'start') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillText('Happy Flappie Bird', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('Press SPACEBAR or Click to Start!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText('Avoid the pipes and have fun! 🐦', this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.fillText('⚠️ Wreck-It Ralph appears at score 3! ⚠️', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
        
        // Ralph warning
        if (this.gameState === 'playing' && this.score >= 2 && !this.ralph.isActive) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('⚠️ RALPH IS COMING! ⚠️', this.canvas.width / 2, 50);
        }
        
        // Ralph active warning
        if (this.ralph.isActive && this.gameState === 'playing') {
            this.ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('🍔 DODGE THE CHEESEBURGERS! 🍔', this.canvas.width / 2, 30);
        }
        
        if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('Press SPACEBAR or Click to Play Again!', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    
    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game objects
        this.updateBird();
        this.updatePipes();
        this.updateClouds();
        this.updateRalph();
        this.updateCheeseburgers();
        this.checkCollisions();
        
        // Draw everything
        this.drawBackground();
        this.drawPipes();
        this.drawRalph();
        this.drawCheeseburgers();
        this.drawBird();
        this.drawUI();
        
        this.frameCount++;
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    window.gameInstance = new HappyFlappieBird();
});

// Mode preset functions
function setEasyMode() {
    // Get the game instance
    const game = window.gameInstance;
    if (!game) return;
    
    // Easy mode settings
    game.bird.gravity = 0.25;
    game.bird.jumpStrength = -6;
    game.pipeSpeed = 1;
    game.pipeGap = 220;
    game.pipeSpawnRate = 180;
    game.ralph.shootInterval = 120; // Slower shooting
    
    // Update UI controls
    document.getElementById('gravityControl').value = 0.25;
    document.getElementById('gravityValue').textContent = '0.25';
    document.getElementById('jumpControl').value = -6;
    document.getElementById('jumpValue').textContent = '-6';
    document.getElementById('pipeSpeedControl').value = 1;
    document.getElementById('pipeSpeedValue').textContent = '1';
    document.getElementById('pipeGapControl').value = 220;
    document.getElementById('pipeGapValue').textContent = '220';
    document.getElementById('spawnRateControl').value = 180;
    document.getElementById('spawnRateValue').textContent = '180';
}

function setNormalMode() {
    const game = window.gameInstance;
    if (!game) return;
    
    // Normal mode settings (default)
    game.bird.gravity = 0.4;
    game.bird.jumpStrength = -7;
    game.pipeSpeed = 1.5;
    game.pipeGap = 180;
    game.pipeSpawnRate = 160;
    game.ralph.shootInterval = 90;
    
    // Update UI controls
    document.getElementById('gravityControl').value = 0.4;
    document.getElementById('gravityValue').textContent = '0.4';
    document.getElementById('jumpControl').value = -7;
    document.getElementById('jumpValue').textContent = '-7';
    document.getElementById('pipeSpeedControl').value = 1.5;
    document.getElementById('pipeSpeedValue').textContent = '1.5';
    document.getElementById('pipeGapControl').value = 180;
    document.getElementById('pipeGapValue').textContent = '180';
    document.getElementById('spawnRateControl').value = 160;
    document.getElementById('spawnRateValue').textContent = '160';
}

function setHardMode() {
    const game = window.gameInstance;
    if (!game) return;
    
    // Hard mode settings
    game.bird.gravity = 0.6;
    game.bird.jumpStrength = -8;
    game.pipeSpeed = 2.5;
    game.pipeGap = 140;
    game.pipeSpawnRate = 100;
    game.ralph.shootInterval = 60; // Faster shooting
    
    // Update UI controls
    document.getElementById('gravityControl').value = 0.6;
    document.getElementById('gravityValue').textContent = '0.6';
    document.getElementById('jumpControl').value = -8;
    document.getElementById('jumpValue').textContent = '-8';
    document.getElementById('pipeSpeedControl').value = 2.5;
    document.getElementById('pipeSpeedValue').textContent = '2.5';
    document.getElementById('pipeGapControl').value = 140;
    document.getElementById('pipeGapValue').textContent = '140';
    document.getElementById('spawnRateControl').value = 100;
    document.getElementById('spawnRateValue').textContent = '100';
}
