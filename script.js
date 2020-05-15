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

const drawPuzzle = async () => {
  while (board.firstChild) {
    board.removeChild(board.lastChild);
  }
  //prettier-ignore
  const { boardSize, tileSize, tilePicArray }
      = await jigsaw(imgSrc, cols, puzzleWidthPx).catch(alert);

  // board.style.minHeight = `${boardSize.Y + tileSize.Y / 2}px`;
  // board.style.maxWidth = `${Math.ceil(tileSize.X * 1.5) * cols}px`;

  tilePicArray.forEach((tile, index) => {
    const img = new Image();
    img.src = tile.base64Url;
    img.style.left = `${tile.leftOffset}px`;
    img.style.top = `${tile.topOffset}px`;
    img.className = "tile";
    img.ontouchmove = (e) => {
      img.style.left = `${e.touches[0].pageX - tileSize.X * 0.75}px`;
      img.style.top = `${e.touches[0].pageY - tileSize.Y * 0.75}px`;
    };
    board.appendChild(img);
  });
};

drawPuzzle();
