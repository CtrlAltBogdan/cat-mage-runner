const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const menuContainer = document.getElementById("menu-container");
const playButton = document.getElementById("play-button");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");
const highScoreDisplay = document.getElementById("high-score");
const playAgainButton = document.getElementById("play-again-button");

let gameInterval, difficultyIncreaseInterval;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;

let obstacles = [];
let itemsToCollect = [];

const playerSettings = {
  speed: 5,
  x: 180,
  movingLeft: false,
  movingRight: false,
  isTouchActive: false,
  touchStartX: 0,
};

const gameSettings = {
  obstacleSpeed: 2,
  itemSpeed: 2,
  spawnDelayRange: { min: 500, max: 2000 },
  obstacleCreationChance: 0.2,
  itemCreationChance: 0.2,
  difficultyLevel: 1,
  maxObjects: 30,
};

const deathAnimationFrames = [
  "img/bomb-1.svg",
  "img/bomb-2.svg",
  "img/bomb-3.svg",
];
let currentFrame = 0;

// --- Функции ---
function startGame() {
  score = 0;
  obstacles = [];
  itemsToCollect = [];
  resetPlayerPosition();
  resetGameSettings();
  currentFrame = 0;

  gameContainer.style.display = "block";
  menuContainer.style.top = "-100%";
  gameOverScreen.style.top = "100%";

  gameInterval = setInterval(gameLoop, 20);
  difficultyIncreaseInterval = setInterval(increaseDifficulty, 10000);

  spawnObstacles();
  spawnItems();
}

function gameLoop() {
  moveObjects();
  updatePlayerPosition();
}

function resetGame() {
  clearInterval(gameInterval);
  clearInterval(difficultyIncreaseInterval);

  obstacles.forEach((obstacle) => obstacle.remove());
  itemsToCollect.forEach((item) => item.remove());
  obstacles = [];
  itemsToCollect = [];

  const explosionImages = gameContainer.querySelectorAll("img");
  explosionImages.forEach((img) => gameContainer.removeChild(img));

  gameOverScreen.style.display = "none";
  player.style.display = "block";

  gameContainer.style.opacity = 0;
  setTimeout(() => {
    startGame();
    gameContainer.style.opacity = 1;
  }, 500);
}

function updatePlayerPosition() {
  if (playerSettings.movingLeft && playerSettings.x > 0) {
    playerSettings.x -= playerSettings.speed;
  }
  if (
    playerSettings.movingRight &&
    playerSettings.x < gameContainer.offsetWidth - player.offsetWidth
  ) {
    playerSettings.x += playerSettings.speed;
  }
  player.style.left = `${playerSettings.x}px`;
}

function isPositionValid(newX, newY, buffer = 60) {
  for (const object of [...obstacles, ...itemsToCollect]) {
    const objX = parseInt(object.style.left);
    const objY = parseInt(object.style.top);
    if (Math.abs(newX - objX) < buffer && Math.abs(newY - objY) < buffer) {
      return false;
    }
  }
  return true;
}

function createObstacle() {
  if (obstacles.length >= gameSettings.maxObjects / 2) return;

  let obstacleX,
    obstacleY = -30;

  do {
    obstacleX = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
  } while (!isPositionValid(obstacleX, obstacleY));

  const obstacle = document.createElement("div");
  obstacle.classList.add("asteroid");
  obstacle.style.left = `${obstacleX}px`;
  obstacle.style.top = `${obstacleY}px`;
  gameContainer.appendChild(obstacle);
  obstacles.push(obstacle);
}

function createItem() {
  if (itemsToCollect.length >= gameSettings.maxObjects / 2) return;
  let itemX,
    itemY = -30;

  do {
    itemX = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
  } while (!isPositionValid(itemX, itemY));

  const item = document.createElement("div");
  item.classList.add("cosmonavt");
  item.style.left = `${itemX}px`;
  item.style.top = `${itemY}px`;
  gameContainer.appendChild(item);
  itemsToCollect.push(item);
}

function moveObjects() {
  const containerHeight = gameContainer.offsetHeight;
  obstacles.forEach((obstacle, index) => {
    let obstacleTop = parseFloat(obstacle.style.top);
    if (obstacleTop > containerHeight) {
      obstacle.remove();
      obstacles.splice(index, 1);
    } else {
      obstacleTop += gameSettings.obstacleSpeed;
      obstacle.style.top = `${obstacleTop}px`;
      checkCollision(obstacle, "obstacle");
    }
  });

  itemsToCollect.forEach((item, index) => {
    let itemTop = parseFloat(item.style.top);

    if (itemTop > containerHeight) {
      item.remove();
      itemsToCollect.splice(index, 1);
    } else {
      itemTop += gameSettings.itemSpeed;
      item.style.top = `${itemTop}px`;
      checkCollision(item, "item");
    }
  });
}

function checkCollision(object, type) {
  const playerRect = player.getBoundingClientRect();
  const objectRect = object.getBoundingClientRect();

  if (
    playerRect.left < objectRect.left + objectRect.width &&
    playerRect.left + playerRect.width > objectRect.left &&
    playerRect.top < objectRect.top + objectRect.height &&
    playerRect.height + playerRect.top > objectRect.top
  ) {
    if (type === "obstacle") {
      endGame();
    } else if (type === "item") {
      score++;
      object.remove();
      itemsToCollect = itemsToCollect.filter((item) => item !== object);
    }
  }
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(difficultyIncreaseInterval);
  playDeathAnimation();
}

function showGameOverScreen() {
  gameOverScreen.style.display = "flex";
  setTimeout(() => {
    gameOverScreen.style.top = "0%";
    finalScoreDisplay.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreDisplay.textContent = highScore;
    }
  }, 100);
}

function playDeathAnimation() {
  const playerX = player.offsetLeft;
  const playerY = player.offsetTop;
  player.style.display = "none";

  let animationInterval;

  function animateExplosion() {
    let animationImage = document.createElement("img");
    animationImage.src = deathAnimationFrames[currentFrame];
    animationImage.style.position = "absolute";
    animationImage.style.width = "70px";
    animationImage.style.height = "70px";
    animationImage.style.left = `${playerX}px`;
    animationImage.style.top = `${playerY}px`;
    gameContainer.appendChild(animationImage);

    if (currentFrame > 0) {
      const previousFrameImage = gameContainer.querySelector(
        `img[src="${deathAnimationFrames[currentFrame - 1]}"]`
      );
      if (previousFrameImage) {
        gameContainer.removeChild(previousFrameImage);
      }
    }

    currentFrame++;
    if (currentFrame >= deathAnimationFrames.length) {
      clearInterval(animationInterval);
      currentFrame = 0;

      const explosionImages = gameContainer.querySelectorAll("img");
      explosionImages.forEach((img) => gameContainer.removeChild(img));

      setTimeout(showGameOverScreen, 500);
    }
  }

  animateExplosion();
  animationInterval = setInterval(animateExplosion, 500);
}

function resetPlayerPosition() {
  playerSettings.x = 180;
  player.style.left = "180px";
  player.style.display = "block";
}

function resetGameSettings() {
  gameSettings.obstacleSpeed = 2;
  gameSettings.itemSpeed = 2;
  gameSettings.spawnDelayRange = { min: 500, max: 2000 };
  gameSettings.obstacleCreationChance = 0.2;
  gameSettings.itemCreationChance = 0.2;
  gameSettings.difficultyLevel = 1;
}

function increaseDifficulty() {
  gameSettings.difficultyLevel++;
  gameSettings.obstacleSpeed += 0.5;
  gameSettings.itemSpeed += 0.5;

  gameSettings.obstacleCreationChance = Math.min(
    0.5,
    gameSettings.obstacleCreationChance + 0.05
  );
  gameSettings.itemCreationChance = Math.min(
    0.5,
    gameSettings.itemCreationChance + 0.05
  );

  gameSettings.spawnDelayRange.max = Math.max(
    500,
    gameSettings.spawnDelayRange.max - 100
  );
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnObstacles() {
  if (Math.random() < gameSettings.obstacleCreationChance) {
    createObstacle();
  }
  setTimeout(
    spawnObstacles,
    getRandomDelay(
      gameSettings.spawnDelayRange.min,
      gameSettings.spawnDelayRange.max
    )
  );
}

function spawnItems() {
  if (Math.random() < gameSettings.itemCreationChance) {
    createItem();
  }
  setTimeout(
    spawnItems,
    getRandomDelay(
      gameSettings.spawnDelayRange.min,
      gameSettings.spawnDelayRange.max
    )
  );
}

// --- Обработчики событий ---
playButton.addEventListener("click", startGame);
playButton.addEventListener("touchstart", startGame);

playAgainButton.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  resetGame();
});

playAgainButton.addEventListener("touchstart", () => {
  // Добавлен обработчик touchstart
  gameOverScreen.style.display = "none";
  resetGame();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") playerSettings.movingLeft = true;
  if (e.key === "ArrowRight") playerSettings.movingRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") playerSettings.movingLeft = false;
  if (e.key === "ArrowRight") playerSettings.movingRight = false;
});

player.addEventListener("touchstart", (e) => {
  playerSettings.isTouchActive = true;
  playerSettings.touchStartX = e.touches[0].clientX;
});

player.addEventListener("touchmove", (e) => {
  if (playerSettings.isTouchActive) {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - playerSettings.touchStartX;
    playerSettings.x += deltaX;
    playerSettings.x = Math.max(
      0,
      Math.min(playerSettings.x, gameContainer.offsetWidth - player.offsetWidth)
    );
    player.style.left = `${playerSettings.x}px`;
    playerSettings.touchStartX = touchX;
  }
});

player.addEventListener("touchend", () => {
  playerSettings.isTouchActive = false;
});
