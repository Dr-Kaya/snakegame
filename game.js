// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 25;
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
let gameSpeed = 150; // Slower starting speed (was 100)
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;
let inputBuffer = null; // For smoother controls

// Visual Effects
let foodPulse = 0;

// Color Schemes - Clean, high contrast colors
const colors = {
    background: '#0a0e27',
    grid: '#1a1f3a',
    snake: '#00ff88',
    snakeHead: '#00ffaa',
    snakeBorder: '#00cc66',
    food: '#ff3366',
    foodBorder: '#cc0033',
    text: '#ffffff',
    score: '#ffd700'
};

// Initialize Game
function init() {
    snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 }
    ];
    velocityX = 1;
    velocityY = 0;
    score = 0;
    level = 1;
    gameSpeed = 150; // Start slower
    inputBuffer = null;
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

// Simple visual feedback when eating food
function flashScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 200);
}

// Game Update Logic
function update() {
    if (isPaused) return;

    // Apply buffered input for smoother controls
    if (inputBuffer) {
        const [newVX, newVY] = inputBuffer;
        velocityX = newVX;
        velocityY = newVY;
        inputBuffer = null;
    }

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
        flashScore();
        generateFood();

        // Increase difficulty more gradually - every 10 points, decrease by 8ms
        if (score % 10 === 0 && score > 0) {
            level++;
            updateLevel();
            gameSpeed = Math.max(80, gameSpeed - 8);
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
    // Clear canvas with solid background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food with subtle pulse
    foodPulse += 0.1;
    const pulseSize = Math.sin(foodPulse) * 2;

    const foodSize = gridSize - 6 + pulseSize;
    const foodOffset = (gridSize - foodSize) / 2;

    // Food border
    ctx.fillStyle = colors.foodBorder;
    ctx.fillRect(
        foodX * gridSize + foodOffset - 1,
        foodY * gridSize + foodOffset - 1,
        foodSize + 2,
        foodSize + 2
    );

    // Food fill
    ctx.fillStyle = colors.food;
    ctx.fillRect(
        foodX * gridSize + foodOffset,
        foodY * gridSize + foodOffset,
        foodSize,
        foodSize
    );

    // Draw snake
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize + 2;
        const y = segment.y * gridSize + 2;
        const size = gridSize - 4;

        if (index === 0) {
            // Draw head with border
            ctx.fillStyle = colors.snakeBorder;
            ctx.fillRect(x - 1, y - 1, size + 2, size + 2);

            ctx.fillStyle = colors.snakeHead;
            ctx.fillRect(x, y, size, size);

            // Draw simple eyes
            ctx.fillStyle = colors.background;
            const eyeSize = 4;
            const eyeOffset = 6;

            if (velocityX === 1) { // Right
                ctx.fillRect(x + size - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + size - eyeOffset - eyeSize, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (velocityX === -1) { // Left
                ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + eyeOffset, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (velocityY === 1) { // Down
                ctx.fillRect(x + eyeOffset, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(x + size - eyeOffset - eyeSize, y + size - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (velocityY === -1) { // Up
                ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + size - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            }
        } else {
            // Draw body segments
            ctx.fillStyle = colors.snakeBorder;
            ctx.fillRect(x - 1, y - 1, size + 2, size + 2);

            ctx.fillStyle = colors.snake;
            ctx.fillRect(x, y, size, size);
        }
    });

    // Draw pause indicator
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to continue', canvas.width / 2, canvas.height / 2 + 40);
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

// Keyboard Controls with input buffering for smoother gameplay
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
            if (velocityY !== 1 && velocityY !== -1) {
                inputBuffer = [0, -1];
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (velocityY !== -1 && velocityY !== 1) {
                inputBuffer = [0, 1];
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (velocityX !== 1 && velocityX !== -1) {
                inputBuffer = [-1, 0];
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (velocityX !== -1 && velocityX !== 1) {
                inputBuffer = [1, 0];
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
