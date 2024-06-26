const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// Image assets with paths (replace with your actual paths)

/*

  Change the following variables to make the game more challenging

*/

const maxMissiles = 2;    // Max missiles in air at once.
const maxBombs = 8;       // Max bombs in air at once.
const maxInvaders = 40;   // Total invaders
const invaderSpeed = 8;   // Speed of invaders
const defenderSpeed = 20; // Defender speed

const imagePaths = [
  "invader.png",
  "defender.png",
  "bomb.png",
  "missile.png",
];

// Image objects (initialize as empty objects)
const invaderImage = new Image();
const defenderImage = new Image();
const bombImage = new Image();
const missileImage = new Image();



// Game variables
let invaders = [];
let defender = {};
let missiles = [];
let bombs = [];
let score = 0;
let gameOver = false;

// Function to check for collision between two objects with bounding boxes
function checkCollision(object1, object2) {
  return (
    object1.x < object2.x + object2.width &&
    object1.x + object1.width > object2.x &&
    object1.y < object2.y + object2.height &&
    object1.y + object1.height > object2.y
  );
}

// Function to draw an image on the canvas
function drawImage(image, x, y) {
  ctx.drawImage(image, x, y);
}

// Function to update invader positions and handle collisions
function updateInvaders() {
  for (let i = 0; i < invaders.length; i++) {
    invaders[i].x += invaders[i].direction * invaderSpeed;

    if (invaders[i].x < 0 || invaders[i].x > canvas.width - 20) {
      invaders[i].y += 40;
      invaders[i].direction *= -1;
    }

    if (invaders[i].y + 20 >= canvas.height) {
      gameOver = true;
      return;
    }

    if (bombs.length <= maxBombs) {
      invaders[i].bombCounter -= 0.01; // Decrease bomb counter each loop

      if (invaders[i].bombCounter <= 0 && Math.random() < 0.05) { // Check for bomb spawn condition
        spawnBomb(invaders[i]);
        invaders[i].bombCounter = setInvaderBombCounter(); // Reset bomb counter
      }
    }

    // Check for collision with defender
    if (checkCollision(invaders[i], defender)) {
      gameOver = true;
      return;
    }

  }
}

// Function to update bomb positions and handle collisions
function updateBombs() {
  for (let i = 0; i < bombs.length; i++) {
    bombs[i].y += 5;

    if (bombs[i].y + 20 >= canvas.height) {
      bombs.splice(i, 1);
      continue;
    }

    if (checkCollision(bombs[i], defender)) {
      gameOver = true;
      bombs.splice(i, 1);
      return;
    }
  }
}

// Function to update missile positions and handle collisions
function updateMissiles() {
  for (let i = 0; i < missiles.length; i++) {
    missiles[i].y -= 10;

    if (missiles[i].y < 0) {
      missiles.splice(i, 1);
      continue;
    }
    for (let j = 0; j < invaders.length; j++) {
      if (checkCollision(missiles[i], invaders[j])) {
        invaders.splice(j, 1);
        missiles.splice(i, 1);
        score++;
        break;
      }
    }

  }
}

function handleInput(event) {
  if (gameOver) return;

  switch (event.key) {
    case "ArrowRight":
      defender.x += defenderSpeed;
      if (defender.x + 20 > canvas.width) {
        defender.x = canvas.width - 20;
      }
      break;
    case "ArrowLeft":
      defender.x -= defenderSpeed;
      if (defender.x < 0) {
        defender.x = 0;
      }
      break;
    case " ":
      if (missiles.length < maxMissiles) {
        missiles.push(
          {
            x: defender.x + 5,
            y: defender.y - 10,
            height: missileImage.height,
            width: missileImage.width
          });
      }
      break;
  }
}
function setInvaderBombCounter() {
  return Math.random() * 0.05 + 0.8; // Set random bomb counter between 0.8 and 0.85
}

let totalInvadersCreated = 0;

function spawnInvaders() {
  const numInvaders = Math.min(4, maxInvaders - totalInvadersCreated);
  const invaderWidth = invaderImage.width || 30; // Replace with actual invader width if image not loaded
  const invaderSpacing = 10;

  for (let i = 0; i < numInvaders; i++) {
    const xPosition = invaderWidth * i + invaderSpacing * i; // Add spacing between invaders
    invaders.push({
      x: xPosition,
      y: 0,
      direction: 1,
      height: invaderImage.height,
      width: invaderImage.width,
      bombCounter: setInvaderBombCounter()
    });
  }
  totalInvadersCreated += numInvaders;
}

// Function to spawn a bomb from an invader
function spawnBomb(invader) {
  bombs.push(
    {
      x: invader.x + 10,
      y: invader.y + 20,
      height: bombImage.height,
      width: bombImage.width
    });
}

// Function to draw game objects
function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black'; // Adjust for desired teal shade (e.g., '#008080')
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let invader of invaders) {
    drawImage(invaderImage, invader.x, invader.y);
  }

  drawImage(defenderImage, defender.x, defender.y);

  for (let bomb of bombs) {
    drawImage(bombImage, bomb.x, bomb.y);
  }

  for (let missile of missiles) {
    drawImage(missileImage, missile.x, missile.y);
  }

  // Draw score (optional)
  ctx.font = "40px Arial";

  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 10, 50);

  if (gameOver) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "#f00";
    ctx.fillText("Game Over!", canvas.width / 2 - 150, canvas.height / 2);
  } else if (invaders.length === 0) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "#0f0";
    ctx.fillText("You Win!", canvas.width / 2 - 100, canvas.height / 2);
  }
}

// Game loop
function gameLoop() {
  if (!gameOver) {
    let anyInvaderAtTop = false;
    for (const invader of invaders) {
      if (invader.y === 0) {
        anyInvaderAtTop = true;
        break; // Exit the loop if any is found at the top
      }
    }

    if (!anyInvaderAtTop) {
      spawnInvaders();
    }
  }

  updateInvaders();
  updateBombs();
  updateMissiles();

  draw();

  requestAnimationFrame(gameLoop);
}

// Function to preload all images
function loadAllImages(paths, images) {
  const promises = [];
  for (let i = 0; i < paths.length; i++) {
    promises.push(
      new Promise((resolve) => {
        images[i].src = paths[i];
        images[i].onload = resolve;
      })
    );
  }
  return Promise.all(promises);
}

async function startGame() {
  // Load all images before starting the game
  await loadAllImages(imagePaths, [invaderImage, defenderImage, bombImage, missileImage]);
  defender = {
    x: canvas.width / 2 - 10,
    y: canvas.height - defenderImage.height,
    height: defenderImage.height,
    width: defenderImage.width
  };
  gameLoop();
}

startGame();


document.addEventListener("keydown", handleInput);
