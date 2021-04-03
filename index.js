let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let intervalId = 0;
let isGameOver = false;
let isArrowUp = false;
let isArrowDown = false;
let isArrowRight = false;
let isArrowLeft = false;
let pressS = false;

// Loading the Images

let bg = new Image();
bg.src = "./images/bg.png";

let ultron = new Image();
ultron.src = "./images/outriders.png";

let wanda = new Image();
wanda.src = "./images/scarlet-witch.png";

let shootBall = new Image();
shootBall.src = "./images/energyBall.png";

let proxima = new Image();
proxima.src = "./images/proxima.png";

let corvus = new Image();
corvus.src = "./images/corvus.png";

let nebula = new Image();
nebula.src = "./images/nebula.bad.png";

let thanos = new Image();
thanos.src = "./images/thanos.png";

let valkiria = new Image();
valkiria.src = "./images/valkiria.png";

let rescuePotts = new Image();
rescuePotts.src = "./images/rescuePotts.png";

let marvel = new Image();
marvel.src = "./images/marvel.png";

//The DOM Elements to Start the Game
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");
let gameOvBtn = document.querySelector("#end-button");
let endGameScreen = document.querySelector("#GameOverScreen");
let instructions = document.querySelector("#instrucciones");

//Scarlet measures
let scarletX = 0,
  scarletY = 0,
  scarletHeight = 20,
  scarletWidth = 200;
let incrY = 5;
let incrX = 5;

//Ultron Measures
let ultronX = 1200;

//shoot measures
let shootBallX = scarletX;
let shootBallY = scarletY;

let balls = [];
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
let valkiriaX = -30;

//rescue measures
let rescueX = -30;

//marvel
let marvelX = -30;

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
    balls.push({ x: scarletX + 50, y: scarletY + 20 });
    pressS = true;
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

//My Ultrons
let ultrons = [
  { x: 1800, y: 300 },
  { x: 1700, y: 100 },
  { x: 2000, y: 150 },
  { x: 1300, y: 60 },
  { x: 1200, y: 500 },
  { x: 1100, y: 400 },
  { x: 2300, y: 200 },
  { x: 1900, y: 250 },
  { x: 1600, y: 50 },
  { x: 2400, y: 700 },
];

//My Functions for the Game
function draw() {
  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(wanda, scarletX, scarletY);
  ctx.drawImage(proxima, proximaX, 200);
  proximaX = proximaX - 2;
  ctx.drawImage(corvus, corvusX, 350);
  corvusX = corvusX - 4;
  ctx.drawImage(nebula, nebulaX, 600);
  nebulaX = nebulaX - 3;
  ctx.drawImage(thanos, thanosX, 300);
  ctx.drawImage(valkiria, valkiriaX, 200);
  valkiriaX = valkiriaX + 2;
  ctx.drawImage(rescuePotts, rescueX, 350);
  rescueX = rescueX + 2;
  ctx.drawImage(marvel, marvelX, 500);
  marvelX = marvelX + 2;

  //Looping my Ultrons
  for (let i = 0; i < ultrons.length; i++) {
    ctx.drawImage(ultron, ultrons[i].x, ultrons[i].y);
    ultrons[i].x = ultrons[i].x - 3;

    if (ultrons[i].x + ultron.width < 0) {
      ultrons[i] = {
        x: 1300,
        y: Math.floor(Math.random() * (canvas.height - ultron.height)),
      };
    }

    //Checking if my current ultron collide with Wanda
    collision(ultrons[i]);
  }

  if (pressS) {
    //ctx.drawImage(shootBall, shootBallX, shootBallY);
    shootBallX = shootBallX + 5;

    for (let i = 0; i < balls.length; i++) {
      ctx.drawImage(shootBall, balls[i].x, balls[i].y);
      balls[i].x += incrBall;
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
  if (scarletY + wanda.height > canvas.height) {
    isGameOver = true;
  }

  //Game Over and Start Animation
  if (isGameOver) {
    canvas.style.display = "none";
    backGround.style.display = "none";
    gameOvBtn.style.display = "block";
    endGameScreen.style.display = "block";

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
  instructions.style.display = "none";
  draw();
}

function animate() {}

//When Ultrons crash with Wanda = Game Over
function collision(ultrones) {
  let scarletLeft = scarletX;
  let scarletRight = scarletX + wanda.width;
  let scarletTop = scarletY;
  let scarletBottom = scarletY + wanda.height;

  // letiables for easier reading
  let ultronesLeft = ultrones.x;
  let ultronesRight = ultrones.x + ultron.width;
  let ultronesTop = ultrones.y;
  let ultronesBottom = ultrones.y + ultron.height;

  // checks in letiables for easier reading
  let crashRight = ultronesLeft <= scarletRight && ultronesRight >= scarletLeft;
  let crashLeft = ultronesRight >= scarletLeft && ultronesLeft <= scarletRight;
  let crashTop = ultronesBottom >= scarletTop && ultronesTop <= scarletBottom;
  let crashBottom =
    ultronesBottom <= scarletBottom && ultronesBottom >= scarletTop;

  // collision check
  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    isGameOver = true;
  }
  return false;
}

//let audio = new Audio("avengers_assemble_.mp3");

//Where some things happen
window.addEventListener("load", () => {
  canvas.style.display = "none";
  gameOvBtn.style.display = "none";
  endGameScreen.style.display = "none";
  startBtn.addEventListener("click", () => {
    startTheGame();
    audio.play();
    draw();
  });
});
