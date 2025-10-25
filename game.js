// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -13;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;

// Game State
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;
let score = 0;
let lives = 3;
let highScore = localStorage.getItem('vangoghHighScore') || 0;

// Player (Van Gogh)
let player = {
    x: 100,
    y: 100,
    width: 40,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    direction: 1, // 1 = right, -1 = left
    isMoving: false
};

// Input state
let keys = {};

// Platforms
let platforms = [];

// Collectibles (Paint Stars)
let stars = [];

// Enemies (Art Critics)
let enemies = [];

// Particles
let particles = [];

// Animation frame counter
let frameCount = 0;

// Colors
const colors = {
    player: '#ff6b35',
    playerHat: '#2d3142',
    playerBeard: '#8b4513',
    platform: '#4a5568',
    platformTop: '#718096',
    star: '#ffd700',
    enemy: '#8b0000',
    sky: '#0f172a',
    ground: '#2d5016'
};

// Initialize Game
function init() {
    // Reset player
    player.x = 100;
    player.y = 100;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.direction = 1;

    score = 0;
    lives = 3;
    particles = [];
    frameCount = 0;

    // Create platforms
    createPlatforms();

    // Create stars
    createStars();

    // Create enemies
    createEnemies();

    updateUI();
}

// Create Platforms
function createPlatforms() {
    platforms = [
        // Ground
        { x: 0, y: canvas.height - 40, width: canvas.width, height: 40 },

        // First level platforms
        { x: 150, y: canvas.height - 140, width: 150, height: 20 },
        { x: 400, y: canvas.height - 140, width: 150, height: 20 },
        { x: 650, y: canvas.height - 140, width: 150, height: 20 },

        // Second level platforms
        { x: 100, y: canvas.height - 240, width: 120, height: 20 },
        { x: 300, y: canvas.height - 240, width: 200, height: 20 },
        { x: 580, y: canvas.height - 240, width: 120, height: 20 },

        // Third level platforms
        { x: 200, y: canvas.height - 340, width: 150, height: 20 },
        { x: 450, y: canvas.height - 340, width: 150, height: 20 },

        // Top platform
        { x: 325, y: canvas.height - 440, width: 150, height: 20 }
    ];
}

// Create Stars
function createStars() {
    stars = [
        { x: 200, y: canvas.height - 180, collected: false },
        { x: 475, y: canvas.height - 180, collected: false },
        { x: 725, y: canvas.height - 180, collected: false },
        { x: 160, y: canvas.height - 280, collected: false },
        { x: 400, y: canvas.height - 280, collected: false },
        { x: 630, y: canvas.height - 280, collected: false },
        { x: 275, y: canvas.height - 380, collected: false },
        { x: 525, y: canvas.height - 380, collected: false },
        { x: 400, y: canvas.height - 480, collected: false }
    ];
}

// Create Enemies
function createEnemies() {
    enemies = [
        { x: 400, y: canvas.height - 160, width: 35, height: 35, velocityX: ENEMY_SPEED, minX: 400, maxX: 530 },
        { x: 300, y: canvas.height - 260, width: 35, height: 35, velocityX: ENEMY_SPEED, minX: 300, maxX: 480 },
        { x: 200, y: canvas.height - 360, width: 35, height: 35, velocityX: ENEMY_SPEED, minX: 200, maxX: 330 },
        { x: 450, y: canvas.height - 360, width: 35, height: 35, velocityX: -ENEMY_SPEED, minX: 450, maxX: 580 }
    ];
}

// Create Particle Effect
function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8 - 2,
            life: 40,
            maxLife: 40,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

// Update Particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityY += 0.3; // Gravity on particles
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
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Draw Van Gogh Character
function drawPlayer() {
    const offsetX = player.isMoving ? Math.sin(frameCount * 0.3) * 2 : 0;

    ctx.save();

    // Body
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(player.x + 10, player.y + 20, 20, 25);

    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 15, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    ctx.fillStyle = colors.playerHat;
    ctx.beginPath();
    ctx.ellipse(player.x + 20, player.y + 8, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(player.x + 10, player.y + 8, 20, 5);

    // Beard
    ctx.fillStyle = colors.playerBeard;
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 20, 7, 0, Math.PI);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    if (player.direction === 1) {
        ctx.fillRect(player.x + 23, player.y + 13, 3, 3);
    } else {
        ctx.fillRect(player.x + 14, player.y + 13, 3, 3);
    }

    // Legs
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x + 12, player.y + 45, 6, 5);
    ctx.fillRect(player.x + 22, player.y + 45, 6, 5);

    // Arms (swinging when moving)
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    if (player.isMoving) {
        ctx.beginPath();
        ctx.moveTo(player.x + 12, player.y + 25);
        ctx.lineTo(player.x + 8 + offsetX, player.y + 35);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(player.x + 28, player.y + 25);
        ctx.lineTo(player.x + 32 - offsetX, player.y + 35);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(player.x + 12, player.y + 25);
        ctx.lineTo(player.x + 8, player.y + 35);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(player.x + 28, player.y + 25);
        ctx.lineTo(player.x + 32, player.y + 35);
        ctx.stroke();
    }

    ctx.restore();
}

// Draw Platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(platform.x + 2, platform.y + 2, platform.width, platform.height);

        // Platform body
        ctx.fillStyle = colors.platform;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Platform top highlight
        ctx.fillStyle = colors.platformTop;
        ctx.fillRect(platform.x, platform.y, platform.width, 4);

        // Platform texture
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < platform.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y);
            ctx.lineTo(platform.x + i, platform.y + platform.height);
            ctx.stroke();
        }
    });
}

// Draw Stars
function drawStars() {
    stars.forEach(star => {
        if (star.collected) return;

        const starSize = 10;
        const glow = Math.sin(frameCount * 0.1) * 3 + 7;

        // Glow effect
        ctx.save();
        ctx.shadowBlur = glow;
        ctx.shadowColor = colors.star;

        // Draw 5-pointed star
        ctx.fillStyle = colors.star;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = star.x + Math.cos(angle) * starSize;
            const y = star.y + Math.sin(angle) * starSize;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            const innerAngle = angle + Math.PI / 5;
            const innerX = star.x + Math.cos(innerAngle) * (starSize * 0.5);
            const innerY = star.y + Math.sin(innerAngle) * (starSize * 0.5);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    });
}

// Draw Enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height + 2, enemy.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enemy body (dark blob)
        ctx.fillStyle = colors.enemy;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        const eyeOffset = enemy.velocityX > 0 ? 5 : -5;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2 - 7 + eyeOffset, enemy.y + enemy.height / 2 - 5, 4, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width / 2 + 7 + eyeOffset, enemy.y + enemy.height / 2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2 - 7 + eyeOffset, enemy.y + enemy.height / 2 - 5, 2, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width / 2 + 7 + eyeOffset, enemy.y + enemy.height / 2 - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Angry mouth
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2 - 8, enemy.y + enemy.height / 2 + 8);
        ctx.lineTo(enemy.x + enemy.width / 2 + 8, enemy.y + enemy.height / 2 + 8);
        ctx.stroke();
    });
}

// Update Player
function updatePlayer() {
    // Horizontal movement
    player.isMoving = false;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -MOVE_SPEED;
        player.direction = -1;
        player.isMoving = true;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = MOVE_SPEED;
        player.direction = 1;
        player.isMoving = true;
    } else {
        player.velocityX = 0;
    }

    // Apply gravity
    player.velocityY += GRAVITY;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Horizontal bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Platform collision
    player.isJumping = true;
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY > 0) {

            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    });

    // Check if fallen off screen
    if (player.y > canvas.height) {
        loseLife();
    }
}

// Update Enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;

        // Bounce at boundaries
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.velocityX *= -1;
        }
    });
}

// Check Collisions
function checkCollisions() {
    // Star collection
    stars.forEach(star => {
        if (star.collected) return;

        const dx = player.x + player.width / 2 - star.x;
        const dy = player.y + player.height / 2 - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
            star.collected = true;
            score += 10;
            updateScore();
            createParticles(star.x, star.y, colors.star);

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('vangoghHighScore', highScore);
                updateHighScore();
            }
        }
    });

    // Enemy collision
    enemies.forEach(enemy => {
        if (player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {

            // Check if jumping on enemy
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
                // Defeat enemy
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, colors.enemy);
                score += 20;
                updateScore();
                player.velocityY = JUMP_STRENGTH * 0.6; // Small bounce

                // Respawn enemy at random position
                enemy.x = Math.random() > 0.5 ? enemy.minX : enemy.maxX;
            } else {
                // Take damage
                loseLife();
            }
        }
    });
}

// Lose Life
function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = 100;
        player.y = 100;
        player.velocityX = 0;
        player.velocityY = 0;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff0000');
    }
}

// Game Loop
function gameLoopFunction() {
    if (isPaused) {
        drawPauseScreen();
        return;
    }

    frameCount++;

    // Update
    updatePlayer();
    updateEnemies();
    checkCollisions();
    updateParticles();

    // Draw
    draw();
}

// Draw Game
function draw() {
    // Clear canvas
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw starry background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % canvas.height;
        const size = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw game objects
    drawPlatforms();
    drawStars();
    drawEnemies();
    drawPlayer();
    drawParticles();
}

// Draw Pause Screen
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px Arial';
    ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 50);
}

// Start Game
function startGame() {
    if (isGameRunning) return;

    init();
    isGameRunning = true;
    isPaused = false;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');

    gameLoop = setInterval(gameLoopFunction, 1000 / 60); // 60 FPS
}

// Game Over
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Update UI
function updateUI() {
    updateScore();
    updateLives();
    updateHighScore();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function updateHighScore() {
    document.getElementById('highScore').textContent = highScore;
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Jump
    if ((e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && !player.isJumping && isGameRunning && !isPaused) {
        player.velocityY = JUMP_STRENGTH;
        player.isJumping = true;
        e.preventDefault();
    }

    // Pause
    if ((e.key === 'p' || e.key === 'P') && isGameRunning) {
        isPaused = !isPaused;
        if (!isPaused) {
            gameLoopFunction();
        }
        e.preventDefault();
    }

    // Prevent arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initial setup
updateHighScore();
draw();
