let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
canvas.style.border = "2px solid black";
let intervalId = 0;
let isGameOver = false;
let isArrowUp = false;
let isArrowDown = false;

// Loading the Images

let bg = new Image();
bg.src = "./images/bg.png";

let ultron = new Image();
ultron.src = "./images/ultron.png";

let wanda = new Image();
wanda.src = "./images/scarlet-witch.png";

//The DOM Elements to Start the Game
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");

//Scarlet measures
let scarletX = 0,
  scarletY = 0,
  scarletHeight = 20,
  scarletWidth = 200;
let incrY = 5;
let incrX = 5;

//setting wandas controlers
document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowUp") {
    isArrowUp = true;
    isArrowDown = false;
  } else if (event.code == "ArrowDown") {
    isArrowUp = false;
    isArrowDown = true;
  }
});

document.addEventListener("keyup", () => {
  isArrowUp = false;
  isArrowDown = false;
});

//My Ultrons
let ultrons = [
  { x: 1800, y: 300 },
  { x: 1300, y: 100 },
  { x: 2000, y: 100 },
  { x: 1900, y: 100 },
  { x: 1600, y: 50 },
  { x: 1300, y: 700 },
];

//My Functions for the Game
function draw() {
  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(wanda, scarletX, scarletY);

  for (let i = 0; i < ultrons.length; i++) {
    ctx.drawImage(ultron, ultrons[i].x, ultrons[i].y);
    ultrons[i].x = ultrons[i].x - 1;

    if (ultrons[i].x + ultron.width < 0) {
      ultrons[i] = {
        x: 1300,
        y: Math.floor(Math.random() * (canvas.height - ultron.height)),
      };
    }
  }
  //Animate Scarlet Witch Wanda
  if (isArrowDown && +scarletY < canvas.height) {
    scarletY = scarletY + 5;
  }
  if (isArrowUp) {
    scarletY = scarletY - 5;
  }

  //Game Over and Start Animation
  if (isGameOver) {
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
  draw();
}

function animate() {
  //animate wanda
  if (isArrowDown) {
    scarletY = scarletY + 5;
  }
  if (isArrowUp) {
    scarletY = scarletY - 5;
  }
}

//let audio = new Audio("avengers_assemble_.mp3");

//Where some things happen
window.addEventListener("load", () => {
  canvas.style.display = "none";
  startBtn.addEventListener("click", () => {
    startTheGame();
    audio.play();
    draw();
    animate();
  });
});
