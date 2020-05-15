import jigsaw from "./jigsaw.js";

let imgSrc = image.files[0]
  ? URL.createObjectURL(image.files[0])
  : "./stamp.jpg";
let cols = columns.value || 6;
let puzzleWidthPx = width.value || 600;
let flag = false;
const bgColor = ["teal", "purple", "brown", "plum"];

// const image = document.getElementById("image");
// const columns = document.getElementById("columns");
// const width = document.getElementById("width");
// const play = document.getElementById("play");
// const board = document.getElementById("board");

image.onchange = () => {
  imgSrc = URL.createObjectURL(image.files[0]);
  drawPuzzle();
};

columns.onchange = () => {
  cols = columns.value;
  drawPuzzle();
};

width.onchange = () => {
  puzzleWidthPx = width.value;
  drawPuzzle();
};

play.onclick = () => {
  flag = !flag;
  play.innerText = flag ? "Solve!" : "Scatter!";
  drawPuzzle();
};

const drawPuzzle = async () => {
  while (board.firstChild) {
    board.removeChild(board.lastChild);
  }
  //prettier-ignore
  const { boardSize, tileSize, tilePicArray }
      = await jigsaw(imgSrc, cols, puzzleWidthPx).catch(alert);
  board.style.width = `${boardSize.X + tileSize.X / 2}px`;
  board.style.height = `${boardSize.Y + tileSize.Y / 2}px`;
  board.style.outlineOffset = `-${tileSize.X / 4 + 1}px`;

  const completed = Array(tilePicArray.length).fill(false);
  let isDragging = false;
  let z = 1;

  tilePicArray.forEach((tile, index) => {
    const randomSide = Math.random() < 0.5;
    const randomX = randomSide
      ? Math.floor((Math.random() * tileSize.X) / 2) + boardSize.X
      : Math.floor(Math.random() * boardSize.X);
    const randomY = randomSide
      ? Math.floor(Math.random() * boardSize.Y)
      : Math.floor((Math.random() * tileSize.Y) / 2) + boardSize.Y;

    const img = new Image();
    img.src = tile.base64Url;
    img.style.left = flag ? `${randomX}px` : `${tile.leftOffset}px`;
    img.style.top = flag ? `${randomY}px` : `${tile.topOffset}px`;
    img.style.userSelect = "none";
    img.className = "tile";
    img.draggable = false;

    board.appendChild(img);

    const moveTile = (x, y) => {
      img.style.left = `${x - tileSize.X * 0.75}px`;
      img.style.top = `${y - tileSize.Y * 0.75}px`;
      img.style.zIndex = z;
    };

    const dropTile = (x, y) => {
      const X = x - tileSize.X / 4;
      const Y = y - tileSize.Y / 4;
      z++;

      if (X > 0 && X < boardSize.X && Y > 0 && Y < boardSize.Y) {
        img.style.left = `${Math.trunc(X / tileSize.X) * tileSize.X}px`;
        img.style.top = `${Math.trunc(Y / tileSize.Y) * tileSize.Y}px`;
      }

      completed[index] =
        parseInt(img.style.left) === tile.leftOffset &&
        parseInt(img.style.top) === tile.topOffset;
      if (completed.every((tile) => tile)) {
        flag = false;
        play.innerText = "Play!";
        completed.fill(false);
        bgColor.push(bgColor.shift());
        document.body.style.background = bgColor[0];
      }
    };

    img.onmousedown = (e) => {
      isDragging = true;
    };

    img.onmousemove = (e) => {
      if (isDragging) moveTile(e.pageX, e.pageY);
    };

    img.onmouseup = (e) => {
      isDragging = false;
      dropTile(e.pageX, e.pageY);
    };

    img.ontouchmove = (e) => {
      e.preventDefault();
      moveTile(e.touches[0].pageX, e.touches[0].pageY);
    };

    img.ontouchend = (e) => {
      dropTile(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
  });
};

drawPuzzle();
