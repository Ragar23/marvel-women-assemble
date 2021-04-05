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
let counterForHitThanos = 0;

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

//The DOM Elements to Start the Game
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");
let gameOvBtn = document.querySelector("#end-button");
let endGameScreen = document.querySelector("#GameOverScreen");
let bodyImage = document.querySelector("body");
let instru = document.querySelector("#howToPlay");

//Scarlet measures
let scarletX = 0,
  scarletY = 0,
  scarletHeight = 20,
  scarletWidth = 200;
let incrY = 5;
let incrX = 5;

//SpaceDogs Measures
let spaceDogsX = 1200;

//shoot measures
let shootBallX = scarletX;
let shootBallY = scarletY;

let arrayOfBalls = [];
let incrBall = 3;

//proxima measures
let proximaX = 2200;
//coruvs measures
let corvusX = 1400;
//nebula measures
let nebulaX = 1800;
//thanos measures
let thanosX = 1250;
//valkiria measures
let valkiriaX = -6200;
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

//My Functions for the Game
function draw() {
  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(wandaImage, scarletX, scarletY);
  ctx.drawImage(proximaImage, proximaX, 200);
  proximaX = proximaX - 2;
  ctx.drawImage(corvusImage, corvusX, 350);
  corvusX = corvusX - 4;
  ctx.drawImage(nebulaImage, nebulaX, 600);
  nebulaX = nebulaX - 3;
  ctx.drawImage(thanosImage, thanosX, 300);
  ctx.drawImage(valkiriaImage, valkiriaX, 50);
  valkiriaX = valkiriaX + 2;
  ctx.drawImage(rescuePottsImage, rescueX, 150);
  rescueX = rescueX + 2;
  ctx.drawImage(marvelImage, marvelX, 250);
  marvelX = marvelX + 4;
  ctx.drawImage(okoyeImage, okoyeX, 350);
  okoyeX += 2;
  ctx.drawImage(waspImage, waspX, 450);
  waspX += 2;
  ctx.drawImage(shuriImage, shuriX, 550);
  shuriX += 2;

  //Looping my Space Dogs
  for (let i = 0; i < arrayOfSpaceDogs.length; i++) {
    ctx.drawImage(spaceDogsImage, arrayOfSpaceDogs[i].x, arrayOfSpaceDogs[i].y);
    arrayOfSpaceDogs[i].x = arrayOfSpaceDogs[i].x - 3;

    if (arrayOfSpaceDogs[i].x + spaceDogsImage.width < 0) {
      arrayOfSpaceDogs[i] = {
        x: 1300,
        y: Math.floor(Math.random() * (canvas.height - spaceDogsImage.height)),
      };
    }

    for (let j = 0; j < arrayOfBalls.length; j++) {
      console.log("reach the loop");
      if (collisionWithBall(arrayOfBalls[j], arrayOfSpaceDogs[i])) {
        console.log("collision happened");
        arrayOfSpaceDogs.splice(i, 1);
        arrayOfBalls.splice(j, 1);
        //i--;
        //j--;
      }
    }

    //Checking if my current spaceDog collide with Wanda
    collisionWithWanda(arrayOfSpaceDogs[i]);
  }

  if (pressS) {
    //ctx.drawImage(shootBall, shootBallX, shootBallY);

    shootBallX = shootBallX + 5;
    for (let i = 0; i < arrayOfBalls.length; i++) {
      ctx.drawImage(ballImage, arrayOfBalls[i].x, arrayOfBalls[i].y);
      arrayOfBalls[i].x += incrBall;

      /* if (collisionWithBall(arrayOfBalls[i], arrayOfUltrons[i])) {
        arrayOfUltrons.splice(i, 1);
        arrayOfBalls.splice(i, 1);
      }*/ //-->HERE I CANNOT DELETE MORE THAN 13 OR IT CRASHES
      // if (balls[i].y < 150) {
      //balls.splice(i, 1);
      //shoot = true;
      //}
    }
  }

  //Animate Scarlet Witch Wanda
  if (isArrowDown && +scarletY < canvas.height) {
    scarletY = scarletY + 5;
  }
  if (isArrowUp) {
    scarletY = scarletY - 5;
  }

  if (isArrowLeft && +scarletX < canvas.width) {
    scarletX = scarletX - 5;
  }

  if (isArrowRight) {
    scarletX = scarletX + 5;
  }
  //EXAMPLE OF GAME OVER CONDITION
  if (scarletY + wandaImage.height > canvas.height) {
    isGameOver = true;
  }

  //Game Over and Start Animation
  if (isGameOver) {
    canvas.style.display = "none";
    backGround.style.display = "none";
    gameOvBtn.style.display = "block";
    endGameScreen.style.display = "block";
    audio.pause();

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
  draw();
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

function collisionWithBall(currentBall, currentSpaceDog) {
  console.log(currentBall);
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
let audio = new Audio("avengers_assemble_.mp3");
/*let audio = new Audio(
  "Alan Silvestri - Portals (From Avengers EndgameAudio Only).mp3"
);

let audio2 = new Audio("avengers_assemble_.mp3");

audio.addEventListener(
  "loadedmetadata",
  function () {
    this.currentTime = 96;
  },
  false
);*/

//Where some things happen
window.addEventListener("load", () => {
  canvas.style.display = "none";
  gameOvBtn.style.display = "none";
  endGameScreen.style.display = "none";
  startBtn.addEventListener("click", () => {
    startTheGame();
    audio.play();
    //audio2.play();
    draw();
  });
});
