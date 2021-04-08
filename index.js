let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//Some Global variables
let intervalId = 0;
let isGameOver = false;
let isArrowUp = false;
let isArrowDown = false;
let isArrowRight = false;
let isArrowLeft = false;
let pressS = false;
let pointsCounter = 0;

//----Loading the Images------//
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

let blastImage = new Image();
blastImage.src = "./images/blast.png";

let stanLeeImage = new Image();
stanLeeImage.src = "./images/StanLee.png";

let gaunletImage = new Image();
gaunletImage.src = "./images/stones.png";

let mantisImage = new Image();
mantisImage.src = "./images/mantis.png";

let leviImage = new Image();
leviImage.src = "./images/levi.png";

let spidermanImage = new Image();
spidermanImage.src = "./images/spiderman.png";

let chit2 = new Image();
chit2.src = "./images/chit2.png";

let chit3 = new Image();
chit3.src = "./images/chit3.png";

let chit4 = new Image();
chit4.src = "./images/chit4.png";

//-----The DOM Elements------//
let startBtn = document.querySelector("#start-button");
let backGround = document.querySelector("#FirsPart");
let gameOvBtn = document.querySelector("#end-button");
let endGameScreen = document.querySelector("#GameOverScreen");
let bodyImage = document.querySelector("body");
let instru = document.querySelector("#howToPlay");
let hideHeader = document.querySelector("#hideHeader");
let marvelStudios = document.querySelector("#studios");
let audioFirstScreen = document.querySelector("#audio");
audioFirstScreen.volume = 0.1;
let backToStart = document.querySelector("#backTo-button");
let finalScoreDisplay = document.querySelector("#finalScore");
let cpMarvelPlayer = document.querySelector("#cpMarvel");
let wandaPlayer = document.querySelector("#wanda");

//Scarlet measures
let scarletX = 0,
  scarletY = 50,
  scarletHeight = 20,
  scarletWidth = 200;
let incrY = 5;
let incrX = 5;

//Variables for choosing character
let wandaCharacter = wandaImage;
let cpMarvelCharacter = marvelImage;
let chooseCharacter = "";

//---POSITION OF SOME CHARACTERS---//
//proxima position
let proximaX = 10800;
let proximaY = 200;
//coruvs position
let corvusX = 10000;
let corvusY = 350;
//nebula position
let nebulaX = 10400;
let nebulaY = 600;
//thanos position
let thanosX = 1250;
let thanosY = 0;
//levi position
let leviX = 10350;
let leviY = 150;
//valkiria position
let valkiriaX = -6200;
let valkiriaY = 50;
//rescue position
let rescueX = -6200;
//cp marvel position
let marvelX = -11600;
//okoye position
let okoyeX = -6200;
//wasp position
let waspX = -6200;
//shuri position
let shuriX = -6200;
//gamora position
let gamoraX = -6200;
//Groot position
let grootX = 85;
let grootY = 670;
//Stan lee position
let stanLeeImageX = -3000;
//gaunlet position
let gaunletImageX = 0;
let gaunletImageY = 450;
//spiderman image
let spidermanImageX = 20;
let spidermanImageY = 480;
//mantis position
let mantisX = -6200;

//SpaceDogs position
let spaceDogsX = 1200;

//Ball position
let shootBallX = scarletX;
let shootBallY = scarletY;

let arrayOfBalls = [];
let incrBall = 8;

function drawScore() {
  ctx.font = "40px Marvel";
  ctx.fillStyle = "#fd0202";
  ctx.fillText(`MARVEL POINTS ${pointsCounter}`, 20, 50);
}

function finalScore() {
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

//setting Wanda's controllers up and down
document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowUp") {
    isArrowUp = true;
    isArrowDown = false;
  } else if (event.code == "ArrowDown") {
    isArrowUp = false;
    isArrowDown = true;
  }
  //---making shoot possible--//

  if (event.code == "KeyS") {
    arrayOfBalls.push({ x: scarletX + 50, y: scarletY + 20 });
    pressS = true;

    arrayOfSpaceDogs.push({ x: 1300 });
    arrayOfChitauris.push({ x: 1800, x: 1800, x: 1800 });
  }

  if (event.code == "KeyW") {
    valkiriaX = 0;
    mantisX = 0;
    okoyeX = 0;
    rescueX = 0;
    gamoraX = 0;
    shuriX = 0;
    waspX = 0;
    marvelX = 0;
  }
  //-----Left and right controllers----//
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

//----The Space Dogs----//
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

//----The chitarui----//

let arrayOfChitauris = [
  { x: 11800, y: 100 },
  { x: 11700, y: 300 },
  { x: 21000, y: 60 },
  { x: 11300, y: 150 },
  { x: 12100, y: 400 },
  { x: 11100, y: 500 },
  { x: 23100, y: 250 },
  { x: 19100, y: 200 },
  { x: 16100, y: 100 },
];

let grootStanding = true;
//To animate Groot
function grootDancing() {
  let myImage = grootStanding ? grootLeftImage : grootRightImage;
  ctx.drawImage(myImage, grootX, grootY);

  if (intervalId % 30 === 0) {
    grootStanding = !grootStanding;
  }
}

// Array with images
let imgArray = [chit2, chit3, chit4];
let chitIndex = 0;
//Chitautirs position
chit1ImageX = 200;
chit1ImageY = 670;

//Animating chitauri
function chitauriMoving() {
  let myCurrentChitImage = imgArray[chitIndex];
  ctx.drawImage(myCurrentChitImage, chit1ImageX, chit1ImageY);
  chit1ImageX -= 20;
  if (intervalId % 10 == 0) {
    chitIndex++;
  }
  if (chitIndex >= imgArray.length) {
    chitIndex = 0;
  }

  for (let i = 0; i < arrayOfChitauris.length; i++) {
    ctx.drawImage(
      myCurrentChitImage,
      arrayOfChitauris[i].x,
      arrayOfChitauris[i].y
    );
    arrayOfChitauris[i].x = arrayOfChitauris[i].x - 6;

    if (arrayOfChitauris[i].x + myCurrentChitImage.width < 0) {
      arrayOfChitauris[i] = {
        x: 11800,
        y: Math.floor(
          Math.random() * (canvas.height - myCurrentChitImage.height)
        ),
      };
    }
    for (let j = 0; j < arrayOfBalls.length; j++) {
      if (collisionWithBall(arrayOfBalls[j], arrayOfChitauris[i])) {
        arrayOfChitauris.splice(i, 1);
        arrayOfBalls.splice(j, 1);
        pointsCounter += 10;
      }
    }
  }
}

//----Functions for the Game----//
function draw() {
  ctx.drawImage(bg, 0, 0);
  //I need to check which character the user has chosen
  if (chooseCharacter === "wanda") {
    ctx.drawImage(wandaImage, scarletX, scarletY);
  } else if (chooseCharacter === "cpMarvel") {
    ctx.drawImage(marvelImage, scarletX, scarletY);
  } else {
    ctx.drawImage(wandaImage, scarletX, scarletY);
  }

  ctx.drawImage(proximaImage, proximaX, proximaY);
  proximaX = proximaX - 4;
  ctx.drawImage(corvusImage, corvusX, corvusY);
  corvusX = corvusX - 4;
  ctx.drawImage(nebulaImage, nebulaX, nebulaY);
  nebulaX = nebulaX - 4;
  ctx.drawImage(thanosImage, thanosX, 300);
  ctx.drawImage(valkiriaImage, valkiriaX, valkiriaY);
  valkiriaX = valkiriaX + 4;
  ctx.drawImage(rescuePottsImage, rescueX, 150);
  rescueX = rescueX + 4;
  ctx.drawImage(mantisImage, mantisX, 250);
  mantisX = mantisX + 4;
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
  ctx.drawImage(stanLeeImage, stanLeeImageX, 670);
  stanLeeImageX += 4;
  ctx.drawImage(gaunletImage, gaunletImageX, gaunletImageY);
  ctx.drawImage(leviImage, leviX, 250);
  leviX = leviX - 4;
  ctx.drawImage(spidermanImage, spidermanImageX, spidermanImageY);
  //Calling the function to draw the score on the canvas
  drawScore();
  //calling groot to show up in the canvas
  grootDancing();
  chitauriMoving();

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
      }
    }
    collisionWithWanda(arrayOfSpaceDogs[i]);
    collisionWithWanda(arrayOfChitauris[i]);

    collision(wandaImage, scarletX, scarletY, nebulaImage, nebulaX, nebulaY);
    collision(wandaImage, scarletX, scarletY, corvusImage, corvusX, corvusY);
    collision(wandaImage, scarletX, scarletY, leviImage, leviX, leviY);
    collision(wandaImage, scarletX, scarletY, proximaImage, proximaX, proximaY);

    collisionWithGaunlet(arrayOfSpaceDogs[i]);
    collisionWithGaunlet(arrayOfChitauris[i]);

    if (collisionWithWomen(arrayOfSpaceDogs[i])) {
      arrayOfSpaceDogs = [];
    }
  }

  if (arrayOfSpaceDogs < 6) {
    arrayOfSpaceDogs.push({ x: 1300 });
  }

  if (pressS) {
    for (let i = 0; i < arrayOfBalls.length; i++) {
      if (chooseCharacter === "wanda") {
        ctx.drawImage(ballImage, arrayOfBalls[i].x, arrayOfBalls[i].y);
      } else if (chooseCharacter === "cpMarvel") {
        ctx.drawImage(blastImage, arrayOfBalls[i].x, arrayOfBalls[i].y);
      }
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

//----Start the Game----//
function startTheGame() {
  canvas.style.display = "block";
  startBtn.style.display = "none";
  backGround.style.display = "none";
  gameOvBtn.style.display = "none";
  endGameScreen.style.display = "none";
  hideHeader.style.display = "none";
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
function resetVariables() {
  isGameOver = false;
  pointsCounter = 0;
  scarletX = 0;
  scarletY = 50;
  arrayOfBalls = [];
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
  arrayOfChitauris = [
    { x: 15800, y: 100 },
    { x: 14700, y: 300 },
    { x: 21000, y: 60 },
    { x: 13300, y: 150 },
    { x: 14100, y: 400 },
    { x: 16100, y: 500 },
    { x: 23100, y: 250 },
    { x: 19100, y: 200 },
    { x: 16100, y: 100 },
  ];
  proximaX = 8200;
  corvusX = 8400;
  nebulaX = 8800;
  thanosX = 1250;
  thanosY = 0;
  leviX = 8400;
  valkiriaX = -6200;
  valkiriaY = 50;
  rescueX = -6200;
  mantisX = 6200;
  marvelX = -11600;
  okoyeX = -6200;
  waspX = -6200;
  shuriX = -6200;
  gamoraX = -6200;
  finalScore();
  audio.load();
  audio2.load();
}

//---Generic collision function---//

function collision(
  object1Image,
  object1X,
  object1Y,
  object2Image,
  object2X,
  object2Y
) {
  let object1Left = object1X;
  let object1Right = object1X + object1Image.width;
  let object1Top = object1Y;
  let object1Bottom = object1Y + object1Image.height;

  // variables to store the positions of the spaceDogs
  let object2Left = object2X;
  let object2Right = object2X + object2Image.width;
  let object2Top = object2Y;
  let object2Bottom = object2Y + object2Image.height;

  // checks the crash cases
  let crashRight = object2Left <= object1Right && object2Right >= object1Left;
  let crashLeft = object2Right >= object1Left && object2Left <= object1Right;
  let crashTop = object2Bottom >= object1Top && object2Top <= object1Bottom;
  let crashBottom =
    object2Bottom <= object1Bottom && object2Bottom >= object1Top;

  // Checking if the collision happens

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    isGameOver = true;
  }
  return false;
}

//-----COLLISION FUNCTIONS----//

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

  // Checking if the collision happens

  if ((crashLeft || crashRight) && (crashTop || crashBottom)) {
    isGameOver = true;
  }
  return false;
}

function collisionWithGaunlet(spaceDogs) {
  let gaunletLeft = gaunletImageX;
  let gaunletRight = gaunletImageX + gaunletImage.width;
  let gaunletTop = gaunletImageY;
  let gaunletBottom = gaunletImageY + gaunletImage.height;

  // variables to store the positions of the spaceDogs
  let spaceDogsLeft = spaceDogs.x;
  let spaceDogsRight = spaceDogs.x + spaceDogsImage.width;
  let spaceDogsTop = spaceDogs.y;
  let spaceDogsBottom = spaceDogs.y + spaceDogsImage.height;

  // checks the crash cases
  let crashRight =
    spaceDogsLeft <= gaunletRight && spaceDogsRight >= gaunletLeft;
  let crashLeft =
    spaceDogsRight >= gaunletLeft && spaceDogsLeft <= gaunletRight;
  let crashTop = spaceDogsBottom >= gaunletTop && spaceDogsTop <= gaunletBottom;
  let crashBottom =
    spaceDogsBottom <= gaunletBottom && spaceDogsBottom >= gaunletTop;

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
  //I give two parameters because the space dogs are not defined inside the function
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

//---AUDIO SETTINGS---//
let audio = new Audio(
  "./assets/Alan Silvestri - Portals (From Avengers EndgameAudio Only).mp3"
);
audio.volume = 0.01;

let audio2 = new Audio("./assets/avengers_assemble_.mp3");
audio2.volume = 0.03;

//Sound effect for choosing character
let audioBalls = new Audio("./assets/ballsSound.mp3");

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

  wandaPlayer.addEventListener("click", () => {
    chooseCharacter = "wanda";
    wandaPlayer.className = "wanda";
    audioBalls.play();
    audioBalls.volume = 0.02;
  });
  cpMarvelPlayer.addEventListener("click", () => {
    chooseCharacter = "cpMarvel";
    audioBalls.play();
    audioBalls.volume = 0.02;
  });
  startBtn.addEventListener("click", () => {
    startTheGame();
  });
  gameOvBtn.addEventListener("click", () => {
    resetVariables();
    startTheGame();
  });

  backToStart.addEventListener("click", () => {
    endGameScreen.style.display = "none";
    backToStart.style.display = "none";
    backGround.style.display = "block";
    hideHeader.style.display = "block";
    instru.style.display = "block";
    marvelStudios.style.display = "block";
    gameOvBtn.style.display = "none";
    startBtn.style.display = "block";
    audioFirstScreen.style.display = "block";
    resetVariables();
  });
});
