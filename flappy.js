// Grab the canvas and set up drawing
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// Initially hide the restart button
restartButton.style.display = "none";

// Game state variables
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0; // Load from localStorage

// === Bird setup ===
const bird = {
  x: 80,
  y: 150,
  radius: 15,
  color: "yellow",
  gravity: 0.5,
  lift: -10,
  velocity: 0
};

// === Ground setup ===
const ground = {
  height: 30,
  color: "green"
};
ground.y = canvas.height - ground.height;

// === Pipes setup ===
const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
let pipeSpawnTimer = 0;

// === Event listeners ===
document.addEventListener("keydown", () => {
  if (!gameOver) {
    bird.velocity = bird.lift;
  }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// === Game functions ===
function spawnPipe() {
  const topHeight = Math.random() * (canvas.height - ground.height - pipeGap - 100) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - ground.height - topHeight - pipeGap,
    scored: false
  });
}

function checkCollision() {
  // Hit the ground
  if (bird.y + bird.radius >= ground.y) {
    return true;
  }

  // Hit the ceiling
  if (bird.y - bird.radius <= 0) {
    return true;
  }

  // Check each pipe
  for (let pipe of pipes) {
    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipeWidth
    ) {
      if (
        bird.y - bird.radius < pipe.top ||
        bird.y + bird.radius > pipe.top + pipeGap
      ) {
        return true;
      }
    }
  }

  return false;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappyHighScore', highScore); // Save to localStorage
  }
}

function update() {
  if (gameOver) return;

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  pipeSpawnTimer++;
  if (pipeSpawnTimer > 90) {
    spawnPipe();
    pipeSpawnTimer = 0;
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= 2;

    if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
      score++;
      pipes[i].scored = true;
    }

    if (pipes[i].x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }

  if (checkCollision()) {
    updateHighScore(); // Check and update high score when game ends
    gameOver = true;
    startButton.style.display = "none";
    restartButton.style.display = "block";
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw pipes
  ctx.fillStyle = "green";
  for (let pipe of pipes) {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, pipe.bottom);
  }

  // Draw bird
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = bird.color;
  ctx.fill();
  ctx.closePath();

  // Draw ground
  ctx.fillStyle = ground.color;
  ctx.fillRect(0, ground.y, canvas.width, ground.height);

  // Draw scores
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("High Score: " + highScore, 10, 60);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "48px Arial";
    ctx.fillText("Game Over", canvas.width/2 - 140, canvas.height/2);
    
    // Show "New High Score!" message if applicable
    if (score === highScore && score > 0) {
      ctx.fillStyle = "gold";
      ctx.font = "36px Arial";
      ctx.fillText("New High Score!", canvas.width/2 - 140, canvas.height/2 + 50);
    }
  }
}

function gameLoop() {
  update();
  draw();

  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  // Reset game state
  gameOver = false;
  score = 0;
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  pipeSpawnTimer = 0;
  
  // Toggle buttons
  startButton.style.display = "none";
  restartButton.style.display = "none";
  
  // Start game
  gameLoop();
}

// Initial setup - show only start button
startButton.style.display = "block";
restartButton.style.display = "none";
