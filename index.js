let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
canvas.style.border = "2px solid black";

// load all images

let bg = new Image();
bg.src = "./images/bg.png";

// basic animation template

function draw() {
  ctx.drawImage(bg, 0, 0);
}

window.addEventListener("load", () => {
  draw();
});
