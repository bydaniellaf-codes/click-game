// ---- Three-Round Character Click Game ----
// Round 1: 30 s, 45 clicks
// Round 2: 20 s, 55 clicks
// Round 3: 10 s, 65 clicks

let characterImg;
let playerName = "";
let nameInput = "";
let headingFont;
let bodyFont;

// gameStage: 0 = name entry, 1 = instructions, 2 = playing,
//            3 = round-end, 4 = final win
let gameStage = 0;

let round = 1;                          // current round 1–3
let roundTime   = [30, 20, 10];
let roundTarget = [45, 55, 65];
let score = 0;
let timerStart = 0;
let roundWon = false;

let chars = new Array(3);
let activeChar = null;

let clouds = [];
let numClouds = 18;

function preload() {
  // Load fonts & images
  headingFont = loadFont("https://bydaniellaf-codes.github.io/click-game-assets/Asteroid%203000.ttf");
  characterImg = loadImage("https://bydaniellaf-codes.github.io/click-game-assets/character.PNG"); // keep in same folder or /data
}

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  textSize(20);
  for (let i = 0; i < numClouds; i++) {
    clouds[i] = new Cloud(random(-100, width + 100), random(30, 160), random(60, 160));
  }
  placeCharactersRandomly();
}

function draw() {
  background(135, 206, 250);
  for (let c of clouds) c.display();

  switch (gameStage) {
    case 0: drawNameEntry(); break;
    case 1: drawInstructions(); break;
    case 2: drawGame(); break;
    case 3: drawRoundEnd(); break;
    case 4: drawFinalScreen(); break;
  }
}

// ---------- STAGES ----------
function drawNameEntry() {
  textFont(headingFont);
  fill(50);
  textSize(32);
  text("Three-Round Click Challenge", width/2, height/2 - 120);
  textSize(18);

  text("Type your name, press ENTER", width/2, height/2 - 80);
  fill(255); stroke(0);
  rectMode(CENTER);
  rect(width/2, height/2, 360, 44, 8);
  noStroke(); fill(0); textSize(20);
  let cursor = (frameCount % 60 < 30) ? "|" : "";
  text(nameInput + cursor, width/2, height/2);
}

function drawInstructions() {
  textFont(headingFont);
  fill(30);
  textSize(26);
  text("Hi " + playerName + "!", width/2, 120);
  textSize(18);
  text("Round 1: 30 s – 45 clicks\n" +
       "Round 2: 20 s – 55 clicks\n" +
       "Round 3: 10 s – 65 clicks\n\n" +
       "Click the highlighted character to score.\nPress ENTER to start Round " + round + ".", width/2, height/2);
}

function drawGame() {
  if (activeChar === null) {
    activeChar = random(chars);
    activeChar.highlight = true;
  }

  for (let c of chars) c.display();

  fill(0);
  textSize(20);
  text("Round " + round + " — Score: " + score + "/" + roundTarget[round-1], width/2, 30);

  let timeLeft = max(0, roundTime[round-1] - int((millis() - timerStart)/1000));
  text("Time left: " + timeLeft + " s", width/2, height - 24);

  if (timeLeft <= 0 || score >= roundTarget[round-1]) {
    roundWon = score >= roundTarget[round-1];
    gameStage = 3;
  }
}

function drawRoundEnd() {
  textFont(headingFont);
  fill(30);
  textSize(30);
  if (roundWon) {
    text("Round " + round + " complete!", width/2, height/2 - 20);
    if (round < 3) {
      textSize(18);
      text("Press ENTER for Round " + (round + 1), width/2, height/2 + 40);
    } else {
      textSize(18);
      text("Press ENTER to see final result", width/2, height/2 + 40);
    }
  } else {
    text("You missed the target.", width/2, height/2 - 20);
    textSize(18);
    text("Press ENTER to retry Round " + round, width/2, height/2 + 40);
  }
}

function drawFinalScreen() {
  textFont(headingFont);
  fill(30);
  textSize(36);
  text("Congratulations, you beat all 3 rounds!", width/2, height/2 - 20);
  textSize(18);
  text("Press R to play again", width/2, height/2 + 40);
}

// ---------- INPUT ----------
function keyPressed() {
  if (gameStage === 0) {
    if (keyCode === ENTER || keyCode === RETURN) {
      playerName = nameInput.trim();
      if (playerName === "") playerName = "Guest";
      gameStage = 1;
    } else if (keyCode === BACKSPACE && nameInput.length > 0) {
      nameInput = nameInput.substring(0, nameInput.length - 1);
    } else if (key.length === 1) {
      nameInput += key;
    }
  } else if (gameStage === 1 && (keyCode === ENTER || keyCode === RETURN)) {
    startRound(round);
  } else if (gameStage === 3) {
    if (roundWon) {
      if (round < 3 && (keyCode === ENTER || keyCode === RETURN)) {
        startRound(round + 1);
      } else if (round === 3 && (keyCode === ENTER || keyCode === RETURN)) {
        gameStage = 4;
      }
    } else if (keyCode === ENTER || keyCode === RETURN) {
      startRound(round);
    }
  } else if (gameStage === 4 && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function startRound(r) {
  round = r;
  score = 0;
  timerStart = millis();
  placeCharactersRandomly();
  activeChar = null;
  gameStage = 2;
}

function resetGame() {
  round = 1;
  score = 0;
  nameInput = "";
  playerName = "";
  gameStage = 0;
}

// ---------- MOUSE ----------
function mousePressed() {
  if (gameStage === 2 && activeChar !== null) {
    if (activeChar.clicked(mouseX, mouseY)) {
      score++;
      activeChar.startJump();
      activeChar.highlight = false;
      activeChar = null;
    }
  }
}

// ---------- CHARACTERS ----------
function placeCharactersRandomly() {
  let pos = [];
  let minDist = 160;
  for (let i = 0; i < chars.length; i++) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 300) {
      let x = random(100, width - 100);
      let y = random(height/2 + 50, height - 140);
      let ok = true;
      for (let p of pos) {
        if (dist(x, y, p.x, p.y) < minDist) { ok = false; break; }
      }
      if (ok) { pos.push(createVector(x, y)); placed = true; }
      tries++;
    }
    if (!placed) pos.push(createVector((i+1)*width/(chars.length+1), height - 200));
  }
  for (let i = 0; i < chars.length; i++) chars[i] = new Character(pos[i].x, pos[i].y);
}

class Character {
  constructor(x0, y0) {
    this.baseX = x0;
    this.baseY = y0;
    this.x = x0;
    this.y = y0;
    let desiredW = 90;
    let scale = desiredW / characterImg.width;
    this.w = characterImg.width * scale;
    this.h = characterImg.height * scale;
    this.highlight = false;
    this.jumping = false;
    this.velY = 0;
  }
  display() {
    if (this.jumping) {
      this.y += this.velY;
      this.velY += 0.6;
      if (this.y >= this.baseY) { this.y = this.baseY; this.velY = 0; this.jumping = false; }
    }
    if (this.highlight) {
      noStroke(); fill(255, 230, 80, 150);
      ellipse(this.x, this.y, this.w*1.35, this.h*1.35);
    }
    imageMode(CENTER);
    image(characterImg, this.x, this.y, this.w, this.h);
  }
  clicked(px, py) {
    return px > this.x - this.w/2 && px < this.x + this.w/2 &&
           py > this.y - this.h/2 && py < this.y + this.h/2;
  }
  startJump() {
    if (!this.jumping) { this.jumping = true; this.velY = -10; }
  }
}

// ---------- CLOUDS ----------
class Cloud {
  constructor(x0, y0, w0) {
    this.x = x0; this.y = y0; this.w = w0;
  }
  display() {
    noStroke(); fill(255);
    ellipse(this.x, this.y, this.w, this.w*0.6);
    ellipse(this.x + this.w*0.28, this.y + 8, this.w*0.6, this.w*0.35);
    ellipse(this.x - this.w*0.28, this.y + 5, this.w*0.45, this.w*0.3);
  }
}
