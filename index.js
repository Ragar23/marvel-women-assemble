let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
canvas.style.border = "2px solid black";
let intervalId = 0;
let isGameOver = false;

// Loading the Images

let bg = new Image();
bg.src = "./images/bg.png";

let ultron = new Image();
ultron.src = "./images/ultron.png";

//The DOM Elements to Start the Game
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");

//How Many Ultrons

//My Functions for the Game

let ultrons = [
  { x: 1800, y: 300 },
  { x: 1300, y: 100 },
  { x: 2000, y: 100 },
  { x: 1900, y: 100 },
  { x: 1600, y: 50 },
  { x: 1300, y: 700 },
];
/*
if (isArrowRight && paddleX + paddleWidth < canvas.width) {
  paddleX = paddleX + 100;
}
if (isArrowLeft && paddleX > 0) {
  paddleX = paddleX - 100;
} */

function draw() {
  ctx.drawImage(bg, 00, 0);

  for (let i = 0; i < ultrons.length; i++) {
    ctx.drawImage(ultron, ultrons[i].x, ultrons[i].y);
    ultrons[i].x = ultrons[i].x - 1;
    console.log(i);

    if (ultrons[i].x + ultron.width < 0) {
      ultrons[i] = {
        x: 1300,
        y: Math.floor(Math.random() * (canvas.height - ultron.height)),
      };
    }
  }
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
  draw();
}

//Where some stuff happens
window.addEventListener("load", () => {
  canvas.style.display = "none";
  startBtn.addEventListener("click", () => {
    startTheGame();
    draw();
    animate();
  });
});

//<div id='d1' style="position:absolute; top:0px; left:0px; z-index:1">
