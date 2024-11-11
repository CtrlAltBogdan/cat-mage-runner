const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
let score = 0;
let gameInterval;
let obstacles = [];
let itemsToCollect = [];
const maxObjects = 30; // Максимальное количество объектов на экране одновременно

// Изначальные параметры
let obstacleSpeed = 2;
let itemSpeed = 2;
let spawnDelayRange = { min: 0, max: 2000 }; // Диапазон времени появления (0-2 секунды)
let obstacleCreationChance = 0.2; // Начальная вероятность создания красных препятствий (20%)
let itemCreationChance = 0.2; // Начальная вероятность создания синих объектов (20%)
let difficultyLevel = 1; // Уровень сложности

// Настройки корабля
const playerSettings = {
  speed: 5,
  x: 180,
  movingLeft: false,
  movingRight: false,
  isTouchActive: false, // Активен ли тач-управление
  touchStartX: 0, // Начальная точка касания по оси X
};

// Обновление позиции корабля
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

// Обработчики нажатия и отпускания клавиш для управления с клавиатуры
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") playerSettings.movingLeft = true;
  if (e.key === "ArrowRight") playerSettings.movingRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") playerSettings.movingLeft = false;
  if (e.key === "ArrowRight") playerSettings.movingRight = false;
});

// Обработка touch-событий для управления пальцем
player.addEventListener("touchstart", (e) => {
  playerSettings.isTouchActive = true;
  playerSettings.touchStartX = e.touches[0].clientX;
});

player.addEventListener("touchmove", (e) => {
  if (playerSettings.isTouchActive) {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - playerSettings.touchStartX;

    playerSettings.x += deltaX; // Перемещение в соответствии с изменением касания
    playerSettings.x = Math.max(
      0,
      Math.min(playerSettings.x, gameContainer.offsetWidth - player.offsetWidth)
    );
    player.style.left = `${playerSettings.x}px`;
    playerSettings.touchStartX = touchX; // Обновляем позицию касания для плавного перемещения
  }
});

player.addEventListener("touchend", () => {
  playerSettings.isTouchActive = false;
});

// Проверка перекрытия объектов с учетом расстояния между ними
function isPositionValid(newX, newY, buffer = 60) {
  return ![...obstacles, ...itemsToCollect].some((object) => {
    const objX = parseInt(object.style.left);
    const objY = parseInt(object.style.top);
    return Math.abs(newX - objX) < buffer && Math.abs(newY - objY) < buffer;
  });
}

// Создание препятствия (красный объект)
function createObstacle() {
  if (obstacles.length >= maxObjects / 2) return;

  let obstacleX,
    obstacleY = -30;

  do {
    obstacleX = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
  } while (!isPositionValid(obstacleX, obstacleY));

  const obstacle = document.createElement("div");
  obstacle.classList.add("red-box");
  obstacle.style.left = `${obstacleX}px`;
  obstacle.style.top = `${obstacleY}px`;
  gameContainer.appendChild(obstacle);
  obstacles.push(obstacle);
}

// Создание объекта для сбора (синий объект)
function createItem() {
  if (itemsToCollect.length >= maxObjects / 2) return;

  let itemX,
    itemY = -30;

  do {
    itemX = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
  } while (!isPositionValid(itemX, itemY));

  const item = document.createElement("div");
  item.classList.add("blue-box");
  item.style.left = `${itemX}px`;
  item.style.top = `${itemY}px`;
  gameContainer.appendChild(item);
  itemsToCollect.push(item);
}

// Движение препятствий и предметов вниз по экрану с разными скоростями
function moveObjects() {
  const containerHeight = gameContainer.offsetHeight; // Определяем высоту контейнера игры

  obstacles.forEach((obstacle, index) => {
    let obstacleTop = parseFloat(obstacle.style.top);
    if (obstacleTop > containerHeight) {
      // Удаляем, когда объект выходит за высоту контейнера
      obstacle.remove();
      obstacles.splice(index, 1);
    } else {
      obstacleTop += obstacleSpeed;
      obstacle.style.top = `${obstacleTop}px`;
      checkCollision(obstacle, "obstacle");
    }
  });

  itemsToCollect.forEach((item, index) => {
    let itemTop = parseFloat(item.style.top);
    if (itemTop > containerHeight) {
      // Удаляем, когда объект выходит за высоту контейнера
      item.remove();
      itemsToCollect.splice(index, 1);
    } else {
      itemTop += itemSpeed;
      item.style.top = `${itemTop}px`;
      checkCollision(item, "item");
    }
  });
}

// Проверка на столкновение
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
      console.log(`Счёт: ${score}`);
    }
  }
}

// Конец игры
function endGame() {
  clearInterval(gameInterval);
  alert(`Игра окончена! Ваш счёт: ${score}`);
}

// Функция для задания случайной задержки
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Повышение сложности игры
function increaseDifficulty() {
  difficultyLevel++;
  obstacleSpeed += 0.5;
  itemSpeed += 0.5;

  obstacleCreationChance = Math.min(0.5, obstacleCreationChance + 0.05); // Максимум 50%
  itemCreationChance = Math.min(0.5, itemCreationChance + 0.05); // Максимум 50%

  spawnDelayRange.max = Math.max(500, spawnDelayRange.max - 100); // Уменьшаем задержку создания
  console.log(`Уровень сложности: ${difficultyLevel}`);
}

// Запуск игры
function startGame() {
  function spawnObstacles() {
    if (Math.random() < obstacleCreationChance) createObstacle();
    setTimeout(
      spawnObstacles,
      getRandomDelay(spawnDelayRange.min, spawnDelayRange.max)
    );
  }

  function spawnItems() {
    if (Math.random() < itemCreationChance) createItem();
    setTimeout(
      spawnItems,
      getRandomDelay(spawnDelayRange.min, spawnDelayRange.max)
    );
  }

  spawnObstacles();
  spawnItems();

  gameInterval = setInterval(() => {
    moveObjects();
    updatePlayerPosition();
  }, 20);

  setInterval(increaseDifficulty, 10000); // Каждые 10 секунд увеличивается сложность
}

startGame();
