let gameLoopId;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
const totalMeteors = 3;

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }

  clear() {
    this.listeners = {};
  }
}

// Creating templates for game objects
class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = '';
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }

  tick(frameId) { }
}

const HERO = "Hero";

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 99), (this.height = 75);
    this.type = HERO;
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
  }

  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 500;
  }

  tick(frameId) {
    var RATE = 3;

    if (frameId % RATE) return;

    if (this.cooldown > 0) {
      this.cooldown -= 100;
    }
  }

  canFire() {
    return this.cooldown === 0;
  }

  decrementLife() {
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }

  incrementPoints() {
    this.points += 100;
  }
}

const ENEMY = "Enemy"

class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 98), (this.height = 50);
    this.type = ENEMY;
  }

  tick(frameId) {
    var RATE = 15
    if (frameId % RATE) return;

    if (!this.dead) {
      this.y = this.y < canvasHeight - this.height ? this.y += 5 : this.y;
      if (this.y >= canvasHeight - this.height) {
        this.dead = true;
        eventEmitter.emit(Messages.ENEMY_OUT_OF_BOUNDS);
      }
    }
  }
}

const METEOR = "Meteor"

class Meteor extends GameObject {
  constructor(x, y, img, angle, speed) {
    super(x, y);
    this.img = img
    this.width = img.width
    this.height = img.height
    this.type = METEOR;
    this.angle = angle;
    this.speed = speed
  }

  tick(frameId) {
    var RATE = 30;

    if (frameId % RATE) return;

    if (!this.dead) {
      this.y += Math.abs(Math.cos(this.angle)) * this.speed;
      this.x += Math.sin(this.angle) * this.speed;

      if (this.y >= canvasHeight ||
        this.x >= canvasWidth ||
        this.x < 0) {
        this.dead = true;
      }
    }
  }
}

const LASER = "Laser"

class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 9), (this.height = 33);
    this.type = LASER;
    this.img = laserImg;
  }

  tick(frameId) {
    var RATE = 5;

    if (frameId % RATE) return;

    if (this.y > 0) {
      this.y -= 15;
    } else {
      this.dead = true;
    };
  }
}

const EXPLOSION = "Explosion"

class Explosion extends GameObject {
  constructor(x, y, shotImg) {
    super(x, y);
    this.img = shotImg;
    (this.width = 56 * 2), (this.height = 54 * 2);
    this.type = EXPLOSION;
  }

  tick(frameId) {
    var RATE = 10;

    if (frameId % RATE) return;

    this.dead = true;
  }
}

const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_HERO_FIRE: "KEY_EVENT_HERO_FIRE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  COLLISION_HERO_METEOR: "COLLISION_HERO_METEOR",
  COLLISION_METEOR_LASER: "COLLISION_METEOR_LASER",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_RUNGAME: "KEY_EVENT_RUNGAME",
  ENEMY_OUT_OF_BOUNDS: "ENEMY_OUT_OF_BOUNDS",
  KEY_EVENT_RESTARTGAME: "KEY_EVENT_RESTARTGAME"
};

let
  eventEmitter = new EventEmitter(),
  gameObjects = [],
  heroImg,
  heroDamagedImg,
  enemyImg,
  laserImg,
  laserRedShotImg,
  meteorBigImg,
  meteorSmallImg,
  hero,
  meteor,
  greenShotImg,
  lifeImg,
  meteorImages;

let onKeyDown = function (e) {
  switch (e.code) {
    case "Space":
    case "ArrowLeft":
    case "ArrowUp":
    case "ArrowRight":
    case "ArrowDown":
    case "Enter":
      e.preventDefault();
      break;
    default: break;
  }
}

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}

function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
  const START_POS = canvasWidth - 180;
  for (let i = 0; i < hero.life; i++) {
    ctx.drawImage(
      lifeImg,
      START_POS + (45 * (i + 1)),
      canvasHeight - 37);
  }
}

function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvasHeight - 20);
}

function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);
}

function pickRandom(arr) {
  let size = arr.length
  let index = Math.round(Math.random() * (size - 1))

  return arr[index]
}

// Checking the collision
function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function isHeroDead() {
  return hero.life <= 0;
}

function isEnemiesDead() {
  const enemies = gameObjects.filter(go => go.type === ENEMY && !go.dead);
  return enemies.length === 0;
}

function endGame(win) {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();

    //  set a delay so we are sure any paints have finished
    setTimeout(() => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (win) {
        displayMessage(
          "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
          "green"
        );
      } else {
        displayMessage(
          "You died !!! Press [Enter] to start a new game Captain Pew Pew"
        );
      }

      initGame();

    }, 200)
  }
};

function createEnemies() {
  const ENEMY_TOTAL = 5;
  const ENEMY_WIDTH = ENEMY_TOTAL * 98;
  const START_X = (canvasWidth - ENEMY_WIDTH) / 2;
  const STOP_X = START_X + ENEMY_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
}

function createHero() {
  hero = new Hero(
    canvasWidth / 2 - 45,
    canvasHeight - canvasHeight / 4
  );
  hero.img = heroImg;
  gameObjects.push(hero);
}


function createMeteors() {
  let addMeteors = 0;
  let liveMeteors = gameObjects.filter(go => go.type === METEOR && !go.dead).length;
  addMeteors = liveMeteors < totalMeteors ? totalMeteors - liveMeteors : addMeteors;

  for (let i = 0; i < addMeteors; i++) {
    gameObjects.push(createMeteor());
  }
}

function createMeteor() {
  let x = Math.floor(Math.random() * canvasWidth)
  let y = 0

  let multiplier = (x <= canvasWidth / 2) ? 1 : -1
  let angle = Math.random() * 30 * multiplier
  let speed = Math.random() * 100 + 15
  let img = pickRandom(meteorImages)
  let created = new Meteor(x, y, img, angle, speed)

  return created
}

function initGame() {
  gameObjects = [];

  createEnemies();
  createHero();

  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5;
  })

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_HERO_FIRE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.GAME_END_WIN, () => {
    endGame(true);
  });

  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    endGame(false);
  });

  eventEmitter.on(Messages.KEY_EVENT_RESTARTGAME, () => {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    runGame();
  })

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first: laser, second: enemy }) => {
    laser.dead = true;
    enemy.dead = true;
    hero.incrementPoints();

    gameObjects.push(new Explosion(enemy.x, enemy.y, laserRedShotImg))

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }

  });

  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
    hero.img = heroDamagedImg;

    gameObjects.push(new Explosion(enemy.x, enemy.y, laserRedShotImg))

    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return;
    }
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }

  });

  eventEmitter.on(Messages.COLLISION_HERO_METEOR, (_, { first: meteor }) => {
    meteor.dead = true;
    hero.decrementLife();
    hero.img = heroDamagedImg;

    gameObjects.push(new Explosion(meteor.x, meteor.y, greenShotImg))

    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return;
    }

  });

  eventEmitter.on(Messages.COLLISION_METEOR_LASER, (_, { first: laser, second: meteor }) => {
    laser.dead = true;
    meteor.dead = true;
    hero.incrementPoints();

    gameObjects.push(new Explosion(meteor.x, meteor.y, laserRedShotImg));
  });

  eventEmitter.on(Messages.KEY_EVENT_RUNGAME, () => {
    runGame();
  });

  eventEmitter.on(Messages.ENEMY_OUT_OF_BOUNDS, () => {
    hero.dead = true;

    eventEmitter.emit(Messages.GAME_END_LOSS);
    return;
  })
}


// colliding objects for hits
function updateGameObjects() {

  const heroRect = hero.rectFromGameObject();
  const enemies = gameObjects.filter(go => go.type === ENEMY);
  const lasers = gameObjects.filter((go) => go.type === LASER);
  const meteors = gameObjects.filter(go => go.type === METEOR)

  //Meteor hit the hero
  meteors.forEach((k) => {
    if (intersectRect(k.rectFromGameObject(), heroRect)) {
      eventEmitter.emit(Messages.COLLISION_HERO_METEOR, {
        first: k,
      });
    };
  });

  // laser hit meteor
  lasers.forEach((l) => {
    meteors.forEach((k) => {
      if (intersectRect(l.rectFromGameObject(), k.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_METEOR_LASER, {
          first: l,
          second: k
        });
      }
    });
  });

  // laser hit enemy
  lasers.forEach((l) => {
    enemies.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });

  // monster hits hero
  enemies.forEach(enemy => {
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, {
        enemy
      });
    }
  })

  gameObjects = gameObjects.filter(go => !go.dead);
}


function runGame() {

  let currentFrameId = 0

  gameLoopId = setInterval(() => {

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawPoints();
    drawLife();

    currentFrameId += 1
    gameObjects.forEach((go) => go.tick(currentFrameId))
    createMeteors()
    updateGameObjects();
    drawGameObjects(ctx);

  }, 20);
}

window.addEventListener("keydown", onKeyDown);

window.addEventListener("keydown", (evt) => {
  if (evt.code === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.code === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.code === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.code === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (evt.code === "Space") {
    eventEmitter.emit(Messages.KEY_EVENT_HERO_FIRE);
  } else if (evt.code === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_RUNGAME);
  } else if (evt.code === "KeyR") {
    eventEmitter.emit(Messages.KEY_EVENT_RESTARTGAME);
  }
});

window.onload = async () => {

  heroImg = await loadTexture('assets/player.png');
  enemyImg = await loadTexture('assets/enemyShip.png');
  laserImg = await loadTexture('assets/laserRed.png');
  laserRedShotImg = await loadTexture('assets/laserRedShot.png');
  meteorBigImg = await loadTexture('./assets/meteorBig.png');
  meteorSmallImg = await loadTexture('./assets/meteorSmall.png');
  greenShotImg = await loadTexture('assets/laserGreenShot.png');
  lifeImg = await loadTexture('assets/life.png')
  heroDamagedImg = await loadTexture('assets/playerDamaged.png')

  meteorImages = [meteorBigImg, meteorSmallImg]

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  initGame();

  displayMessage('Press [Enter] to start the game Captain Pew Pew', 'blue');
};
