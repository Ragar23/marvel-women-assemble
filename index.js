let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//BETTER WRITING MY CODES
//- Write more descriptive names.
let intervalId = 0;
let isGameOver = false;
let isArrowUp = false;
let isArrowDown = false;
let isArrowRight = false;
let isArrowLeft = false;
let pressS = false;
let pointsCounter = 0;

// Loading the Images

let bg = new Image();
bg.src = "./images/bg.png";

let spaceDogsImage = new Image();
spaceDogsImage.src = "./images/outriders.png";

let wandaImage = new Image();
wandaImage.src = "./images/scarlet-witch.png";

let ballImage = new Image();
ballImage.src = "./images/energyBall.png";

let proximaImage = new Image();
proximaImage.src = "./images/proxima.png";

let corvusImage = new Image();
corvusImage.src = "./images/corvus.png";

let nebulaImage = new Image();
nebulaImage.src = "./images/nebula.bad.png";

let thanosImage = new Image();
thanosImage.src = "./images/thanos.png";

let valkiriaImage = new Image();
valkiriaImage.src = "./images/valkiria.png";

let rescuePottsImage = new Image();
rescuePottsImage.src = "./images/rescuePotts.png";

let marvelImage = new Image();
marvelImage.src = "./images/marvel.png";

let okoyeImage = new Image();
okoyeImage.src = "./images/okoye.png";

let waspImage = new Image();
waspImage.src = "./images/wasp.png";

let shuriImage = new Image();
shuriImage.src = "./images/shuri.png";

let gamoraImage = new Image();
gamoraImage.src = "./images/gamora.png";

let grootLeftImage = new Image();
grootLeftImage.src = "./images/babyGroot.png";

let grootRightImage = new Image();
grootRightImage.src = "./images/babyGrootLeft.png";

//The DOM Elements to Start the Game
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");
let gameOvBtn = document.querySelector("#end-button");
let endGameScreen = document.querySelector("#GameOverScreen");
let bodyImage = document.querySelector("body");
let instru = document.querySelector("#howToPlay");
let marvelStudios = document.querySelector("#studios");
let audioFirstScreen = document.querySelector("#audio");
let backToStart = document.querySelector("#backTo-button");
let finalScoreDisplay = document.querySelector("#finalScore");

//Scarlet measures
let scarletX = 0,
  scarletY = 50,
  scarletHeight = 20,
  scarletWidth = 200;
let incrY = 5;
let incrX = 5;

//SpaceDogs Measures
let spaceDogsX = 1200;

//Ball measures
let shootBallX = scarletX;
let shootBallY = scarletY;

let arrayOfBalls = [];
let incrBall = 8;

//proxima measures
let proximaX = 2200;
//coruvs measures
let corvusX = 1400;
//nebula measures
let nebulaX = 1800;
//thanos measures
let thanosX = 1250;
let thanosY = 0;
//valkiria measures
let valkiriaX = -6200;
let valkiriaY = 50;
//rescue measures
let rescueX = -6200;
//marvel
let marvelX = -11600;
//okoye measures
let okoyeX = -6200;
//wasp
let waspX = -6200;
//shuri
let shuriX = -6200;
//gamora measuers
let gamoraX = -6200;

let grootX = 85;
let grootY = 670;

function drawScore() {
  ctx.font = "40px Marvel";
  ctx.fillStyle = "#fd0202";
  ctx.fillText(`MARVEL POINTS ${pointsCounter}`, 20, 50);
}

function finalScore() {
  console.log("final score");
  if (
    finalScoreDisplay.innerText ==
    "You've reached a score of 0 points by killing the space dogs!"
  ) {
    finalScoreDisplay.innerText = `You've reached a score of ${pointsCounter} points by killing the space dogs!`;
  } else {
    finalScoreDisplay.innerText =
      "You've reached a score of 0 points by killing the space dogs!";
  }
}

//To see your final score
/*function yourEndScore() {
  ctx.font = "40px Marvel";
  ctx.fillStyle = "#fd0202";
  ctx.fillText(`MARVEL POINTS ${pointsCounter}`, 20, 50);
}*/

//setting Wanda's controllers
document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowUp") {
    isArrowUp = true;
    isArrowDown = false;
  } else if (event.code == "ArrowDown") {
    isArrowUp = false;
    isArrowDown = true;
  }
  //making shoot
  if (event.code == "KeyS") {
    arrayOfBalls.push({ x: scarletX + 50, y: scarletY + 20 });
    pressS = true;

    arrayOfSpaceDogs.push({ x: 1300 });
  }

  if (event.code == "ArrowLeft") {
    isArrowLeft = true;
    isArrowRight = false;
  } else if (event.code == "ArrowRight") {
    isArrowLeft = false;
    isArrowRight = true;
  }
});

document.addEventListener("keyup", () => {
  isArrowUp = false;
  isArrowDown = false;
  isArrowRight = false;
  isArrowLeft = false;
});

//My Space Dogs
let arrayOfSpaceDogs = [
  { x: 1800, y: 300 },
  { x: 1700, y: 100 },
  { x: 2000, y: 150 },
  { x: 1300, y: 60 },
  { x: 1200, y: 500 },
  { x: 1100, y: 400 },
  { x: 2300, y: 200 },
  { x: 1900, y: 250 },
  { x: 1600, y: 50 },
];

function grootDancing() {
  intervalId++;

  if (intervalId % 21 === 0) {
    ctx.drawImage(grootLeftImage, grootX, grootY);
  } else if (intervalId % 8 === 0) {
    ctx.drawImage(grootRightImage, grootX, grootY);
  }
}

//My Functions for the Game
function draw() {
  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(wandaImage, scarletX, scarletY);
  ctx.drawImage(proximaImage, proximaX, 200);
  proximaX = proximaX - 4;
  ctx.drawImage(corvusImage, corvusX, 350);
  corvusX = corvusX - 8;
  ctx.drawImage(nebulaImage, nebulaX, 600);
  nebulaX = nebulaX - 6;
  ctx.drawImage(thanosImage, thanosX, 300);
  ctx.drawImage(valkiriaImage, valkiriaX, valkiriaY);
  valkiriaX = valkiriaX + 4;
  ctx.drawImage(rescuePottsImage, rescueX, 150);
  rescueX = rescueX + 4;
  ctx.drawImage(marvelImage, marvelX, 250);
  marvelX = marvelX + 8;
  ctx.drawImage(okoyeImage, okoyeX, 350);
  okoyeX += 4;
  ctx.drawImage(waspImage, waspX, 450);
  waspX += 4;
  ctx.drawImage(shuriImage, shuriX, 550);
  shuriX += 4;
  ctx.drawImage(gamoraImage, gamoraX, 650);
  gamoraX += 4;
  //Calling the function to draw the score
  drawScore();

  //Looping over the Space Dogs
  for (let i = 0; i < arrayOfSpaceDogs.length; i++) {
    ctx.drawImage(spaceDogsImage, arrayOfSpaceDogs[i].x, arrayOfSpaceDogs[i].y);
    arrayOfSpaceDogs[i].x = arrayOfSpaceDogs[i].x - 6;

    if (arrayOfSpaceDogs[i].x + spaceDogsImage.width < 0) {
      arrayOfSpaceDogs[i] = {
        x: 1300,
        y: Math.floor(Math.random() * (canvas.height - spaceDogsImage.height)),
      };
    }
    //looping over the balls
    for (let j = 0; j < arrayOfBalls.length; j++) {
      if (collisionWithBall(arrayOfBalls[j], arrayOfSpaceDogs[i])) {
        arrayOfSpaceDogs.splice(i, 1);
        arrayOfBalls.splice(j, 1);
        pointsCounter += 10;
        console.log(pointsCounter);
        //i--;
        //j--;
      }

      // collisionWithThanos(arrayOfBalls[j]);
    }
    collisionWithWanda(arrayOfSpaceDogs[i]);

    if (collisionWithWomen(arrayOfSpaceDogs[i])) {
      arrayOfSpaceDogs = [];
    }
  }

  if (arrayOfSpaceDogs < 6) {
    arrayOfSpaceDogs.push({ x: 1300 });
  }

  if (pressS) {
    for (let i = 0; i < arrayOfBalls.length; i++) {
      ctx.drawImage(ballImage, arrayOfBalls[i].x, arrayOfBalls[i].y);
      arrayOfBalls[i].x += incrBall;
    }
  }

  //Animate Scarlet Witch Wanda
  if (isArrowDown && scarletY + wandaImage.height < canvas.height) {
    scarletY = scarletY + 10;
  }
  if (isArrowUp && scarletY > 0) {
    scarletY = scarletY - 10;
  }

  if (isArrowLeft && scarletX > 0) {
    scarletX = scarletX - 10;
  }

  if (isArrowRight && scarletX + wandaImage.width < canvas.width) {
    scarletX = scarletX + 10;
  }

  grootDancing();

  //Game Over and Start Animation
  if (isGameOver) {
    canvas.style.display = "none";
    backGround.style.display = "block";
    gameOvBtn.style.display = "block";
    endGameScreen.style.display = "block";
    backToStart.style.display = "block";
    finalScore();

    audio.pause();
    audio2.pause();

    cancelAnimationFrame(intervalId);
  } else {
    intervalId = requestAnimationFrame(draw);
  }
}

//Start the Game
function startTheGame() {
  canvas.style.display = "block";
  startBtn.style.display = "none";
  backGround.style.display = "none";
  gameOvBtn.style.display = "none";
  endGameScreen.style.display = "none";
  instru.style.display = "none";
  marvelStudios.style.display = "none";
  audioFirstScreen.pause();
  audioFirstScreen.style.display = "none";
  backToStart.style.display = "none";
  audio.play();
  audio2.play();
  draw();
}

//Resetting all my variables
function restartVariables() {
  isGameOver = false;
  pointsCounter = 0;
  audio.play();
  audio2.play();
  scarletX = 0;
  scarletY = 50;
  arrayOfSpaceDogs = [
    { x: 1800, y: 300 },
    { x: 1700, y: 100 },
    { x: 2000, y: 150 },
    { x: 1300, y: 60 },
    { x: 1200, y: 500 },
    { x: 1100, y: 400 },
    { x: 2300, y: 200 },
    { x: 1900, y: 250 },
    { x: 1600, y: 50 },
  ];
  proximaX = 2200;
  corvusX = 1400;
  nebulaX = 1800;
  thanosX = 1250;
  thanosY = 0;
  valkiriaX = -6200;
  valkiriaY = 50;
  rescueX = -6200;
  marvelX = -11600;
  okoyeX = -6200;
  waspX = -6200;
  shuriX = -6200;
  gamoraX = -6200;
  finalScore();
}

//When SpaceDogs crash with Wanda = Game Over
function collisionWithWanda(spaceDogs) {
  let scarletLeft = scarletX;
  let scarletRight = scarletX + wandaImage.width;
  let scarletTop = scarletY;
  let scarletBottom = scarletY + wandaImage.height;

  // variables to store the positions of the spaceDogs
  let spaceDogsLeft = spaceDogs.x;
  let spaceDogsRight = spaceDogs.x + spaceDogsImage.width;
  let spaceDogsTop = spaceDogs.y;
  let spaceDogsBottom = spaceDogs.y + spaceDogsImage.height;

  // checks the crash cases
  let crashRight =
    spaceDogsLeft <= scarletRight && spaceDogsRight >= scarletLeft;
  let crashLeft =
    spaceDogsRight >= scarletLeft && spaceDogsLeft <= scarletRight;
  let crashTop = spaceDogsBottom >= scarletTop && spaceDogsTop <= scarletBottom;
  let crashBottom =
    spaceDogsBottom <= scarletBottom && spaceDogsBottom >= scarletTop;

  // actual collision check

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    isGameOver = true;
  }
  return false;
}

function collisionWithWomen(spaceDogs) {
  let valkiriaLeft = valkiriaX;
  let valkiriaRight = valkiriaX + valkiriaImage.width;
  let valkiriaTop = valkiriaY;
  let valkiriaBottom = valkiriaY + valkiriaImage.height;

  // variables to store the positions of the spaceDogs
  let spaceDogsLeft = spaceDogs.x;
  let spaceDogsRight = spaceDogs.x + spaceDogsImage.width;
  let spaceDogsTop = spaceDogs.y;
  let spaceDogsBottom = spaceDogs.y + spaceDogsImage.height;

  // checks the crash cases
  let crashRight =
    spaceDogsLeft <= valkiriaRight && spaceDogsRight >= valkiriaLeft;
  let crashLeft =
    spaceDogsRight >= valkiriaLeft && spaceDogsLeft <= valkiriaRight;
  let crashTop =
    spaceDogsBottom >= valkiriaTop && spaceDogsTop <= valkiriaBottom;
  let crashBottom =
    spaceDogsBottom <= valkiriaBottom && spaceDogsBottom >= valkiriaTop;

  // actual collision check

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    return true;
  } else {
    return false;
  }
}

function collisionWithBall(currentBall, currentSpaceDog) {
  //console.log(currentBall);
  //I give two parameters because the space dogs are not defined inside the function
  //Check collision between left side of the current space dogs and right side of the current ball
  //Im writing the same thing twice.
  let spaceDogsLeft = currentSpaceDog.x;
  let spaceDogsRight = currentSpaceDog.x + spaceDogsImage.width;
  let spaceDogsTop = currentSpaceDog.y;
  let spaceDogsBottom = currentSpaceDog.y + spaceDogsImage.width;

  let ballsRight = currentBall.x + ballImage.width;
  let ballsLeft = currentBall.x;
  let ballsTop = currentBall.y;
  let ballsBottom = currentBall.y + ballImage.width;

  let crashRight = spaceDogsLeft <= ballsRight && spaceDogsRight >= ballsLeft;
  let crashLeft = spaceDogsRight >= ballsLeft && spaceDogsLeft <= ballsRight;
  let crashTop = spaceDogsBottom >= ballsTop && spaceDogsTop <= ballsBottom;
  let crashBottom =
    spaceDogsBottom <= ballsBottom && spaceDogsBottom >= ballsTop;

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    return true;
  }
}

/*function collisionWithThanos(currentBallToThanos) {
  console.log(currentBallToThanos);
  let ballsRight = currentBallToThanos.x + ballImage.width;
  let ballsLeft = currentBallToThanos.x;
  let ballsTop = currentBallToThanos.y;
  let ballsBottom = currentBallToThanos.y + ballImage.width;

  let thanosLeft = thanosX;
  let thanosRight = thanosX + thanosImage.width;
  let thanosTop = thanosY;
  let thanosBottom = thanosX + thanosImage.height;

  let crashRight = thanosLeft <= ballsRight && thanosRight >= ballsLeft;
  let crashLeft = thanosRight >= ballsLeft && thanosLeft <= ballsRight;
  let crashTop = thanosBottom >= ballsTop && thanosTop <= ballsBottom;
  let crashBottom = thanosBottom <= ballsBottom && thanosBottom >= ballsTop;

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    console.log("collision happening");
    return true;
  }
}*/

//AUDIO SETTINGS
//let audio = new Audio("avengers_assemble_.mp3");
let audio = new Audio(
  "Alan Silvestri - Portals (From Avengers EndgameAudio Only).mp3"
);

let audio2 = new Audio("avengers_assemble_.mp3");

audio.addEventListener(
  "loadedmetadata",
  function () {
    this.currentTime = 96;
  },
  false
);

//Timer for first Audio in splashScreen
audioFirstScreen.addEventListener(
  "loadedmetadata",
  function () {
    this.currentTime = 162;
  },
  false
);

//Where some things happen
window.addEventListener("load", () => {
  canvas.style.display = "none";
  gameOvBtn.style.display = "none";
  endGameScreen.style.display = "none";
  backToStart.style.display = "none";
  startBtn.addEventListener("click", () => {
    startTheGame();

    //audio2.play();
  });
  gameOvBtn.addEventListener("click", () => {
    restartVariables();
    startTheGame();
  });

  /*backToStart.addEventListener("click", () => {
    endGameScreen.style.display = "none";
    backToStart.style.display = "none";
    backGround.style.display = "block";
    marvelStudios.style.display = "block";
    instru.style.display = "block";
    gameOvBtn.style.display = "none";
    startBtn.style.display = "block";

    audioFirstScreen.play();
  }); */
});

/*canvas.style.display = "block";
startBtn.style.display = "none";
backGround.style.display = "none";
gameOvBtn.style.display = "none";
endGameScreen.style.display = "none";
instru.style.display = "none";
marvelStudios.style.display = "none";
audioFirstScreen.pause();
audioFirstScreen.style.display = "none";
backToStart.style.display = "none";*/
