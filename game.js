// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game State
let snake = [];
let velocityX = 0;
let velocityY = 0;
let foodX = 0;
let foodY = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameSpeed = 100;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;

// Visual Effects
let particles = [];
let foodGlow = 0;
let glowDirection = 1;

// Color Schemes
const colors = {
    snake: '#4ecca3',
    snakeGradient: '#45b393',
    food: '#ff6b6b',
    foodGlow: '#ff9999',
    grid: '#2a2a3e',
    text: '#ffffff',
    particle: '#ffd700'
};

// Initialize Game
function init() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    velocityX = 1;
    velocityY = 0;
    score = 0;
    level = 1;
    gameSpeed = 100;
    particles = [];
    generateFood();
    updateScore();
    updateHighScore();
    updateLevel();
}

// Generate Food
function generateFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);

    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === foodX && segment.y === foodY) {
            generateFood();
            return;
        }
    }
}

// Create Particle Effect
function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            size: Math.random() * 4 + 2
        });
    }
}

// Update Particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Draw Particles
function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = colors.particle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Game Update Logic
function update() {
    if (isPaused) return;

    // Move snake
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === foodX && head.y === foodY) {
        score++;
        updateScore();
        createParticles(foodX, foodY);
        generateFood();

        // Increase difficulty every 5 points
        if (score % 5 === 0) {
            level++;
            updateLevel();
            gameSpeed = Math.max(50, gameSpeed - 10);
            clearInterval(gameLoop);
            gameLoop = setInterval(gameLoopFunction, gameSpeed);
        }

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            updateHighScore();
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Draw Game
function draw() {
    // Clear canvas with fade effect
    ctx.fillStyle = colors.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food with glow effect
    foodGlow += glowDirection * 0.5;
    if (foodGlow >= 10 || foodGlow <= 0) glowDirection *= -1;

    ctx.save();
    ctx.shadowBlur = 20 + foodGlow;
    ctx.shadowColor = colors.foodGlow;
    ctx.fillStyle = colors.food;
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize / 2,
        foodY * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Draw snake with gradient
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * gridSize,
            segment.y * gridSize,
            segment.x * gridSize + gridSize,
            segment.y * gridSize + gridSize
        );

        if (index === 0) {
            // Head is brighter
            gradient.addColorStop(0, colors.snake);
            gradient.addColorStop(1, colors.snakeGradient);
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.snake;
        } else {
            // Body segments with fading opacity
            const opacity = 1 - (index / snake.length) * 0.3;
            ctx.fillStyle = colors.snake;
            ctx.globalAlpha = opacity;
            ctx.shadowBlur = 5;
            ctx.shadowColor = colors.snake;
        }

        // Draw rounded rectangle for snake segment
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        const size = gridSize - 2;
        const radius = 5;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = 3;
            let eyeX1, eyeY1, eyeX2, eyeY2;

            if (velocityX === 1) { // Moving right
                eyeX1 = x + size - 8;
                eyeY1 = y + 6;
                eyeX2 = x + size - 8;
                eyeY2 = y + size - 6;
            } else if (velocityX === -1) { // Moving left
                eyeX1 = x + 8;
                eyeY1 = y + 6;
                eyeX2 = x + 8;
                eyeY2 = y + size - 6;
            } else if (velocityY === 1) { // Moving down
                eyeX1 = x + 6;
                eyeY1 = y + size - 8;
                eyeX2 = x + size - 6;
                eyeY2 = y + size - 8;
            } else { // Moving up
                eyeX1 = x + 6;
                eyeY1 = y + 8;
                eyeX2 = x + size - 6;
                eyeY2 = y + 8;
            }

            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw particles
    updateParticles();
    drawParticles();

    // Draw pause indicator
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Game Loop
function gameLoopFunction() {
    update();
    draw();
}

// Start Game
function startGame() {
    if (isGameRunning) return;

    init();
    isGameRunning = true;
    isPaused = false;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');

    gameLoop = setInterval(gameLoopFunction, gameSpeed);
}

// Game Over
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateHighScore() {
    document.getElementById('highScore').textContent = highScore;
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    if (!isGameRunning && e.key !== ' ') return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
        case ' ':
            if (isGameRunning) {
                isPaused = !isPaused;
                draw(); // Redraw to show pause indicator
            }
            break;
    }
});

// Button Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initial setup
updateHighScore();
draw(); // Draw initial grid
