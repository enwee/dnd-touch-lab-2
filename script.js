import jigsaw from "./jigsaw.js";

let imgSrc = image.files[0]
  ? URL.createObjectURL(image.files[0])
  : "./stamp.jpg";
let cols = columns.value || 6;
let puzzleWidthPx = width.value || 600;

// const image = document.getElementById("image");
// const columns = document.getElementById("columns");
// const width = document.getElementById("width");
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

scatter.onclick = () => {
  drawPuzzle("scatter");
};

const drawPuzzle = async (flag) => {
  while (board.firstChild) {
    board.removeChild(board.lastChild);
  }
  //prettier-ignore
  const { boardSize, tileSize, tilePicArray }
      = await jigsaw(imgSrc, cols, puzzleWidthPx).catch(alert);
  board.style.width = `${boardSize.X + tileSize.X / 2}px`;
  board.style.height = `${boardSize.Y + tileSize.Y / 2}px`;
  board.style.outlineOffset = `-${tileSize.X / 4 + 1}px`;
  let z = 0;

  tilePicArray.forEach((tile, index) => {
    const randomSide = Math.random() < 0.5;
    const randomX = randomSide
      ? Math.trunc((Math.random() * tileSize.X) / 2) + boardSize.X
      : Math.trunc(Math.random() * (boardSize.X + tileSize.X));
    const randomY = randomSide
      ? Math.trunc(Math.random() * (boardSize.Y + tileSize.Y))
      : Math.trunc((Math.random() * tileSize.Y) / 2) + boardSize.Y;
    const img = new Image();
    // NEWLY ADDED: account for offset after centering board
    let getLeftOffsetValue = (element) => document.getElementById(`${element}`).offsetLeft
    img.src = tile.base64Url;
    img.style.left = flag ? `${randomX}px` : `${tile.leftOffset}px`;
    img.style.top = flag ? `${randomY}px` : `${tile.topOffset}px`;
    img.className = "tile";
    img.ontouchmove = (e) => {
      e.preventDefault();
      img.style.left = `${e.touches[0].pageX - tileSize.X * 0.75 - getLeftOffsetValue("board")}px`;
      img.style.top = `${e.touches[0].pageY - tileSize.Y * 0.75}px`;
      img.style.zIndex = ++z;
    };
    img.ontouchend = (e) => {
      const x = e.changedTouches[0].pageX - tileSize.X / 4;
      const y = e.changedTouches[0].pageY - tileSize.Y / 4;
      if (x > 0 && x < boardSize.X && y > 0 && y < boardSize.Y) {
        img.style.left = `${Math.trunc(x / tileSize.X) * tileSize.X}px`;
        img.style.top = `${Math.trunc(y / tileSize.Y) * tileSize.Y}px`;
      }
    };
    board.appendChild(img);
  });
};

drawPuzzle();
