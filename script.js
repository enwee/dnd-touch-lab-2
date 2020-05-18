import jigsaw from "./jigsaw.js";
import { bgColor, randomInt } from "./constants.js";

let imgSrc = image.files[0]
  ? URL.createObjectURL(image.files[0])
  : "./stamp.jpg";
puzzleCols.value = 6;
puzzleWidth.value = Math.trunc(document.body.clientWidth * 0.8);
let scatter = false;

if (puzzleWidth.value > 800) puzzleWidth.value = 800;

image.onchange = () => {
  imgSrc = URL.createObjectURL(image.files[0]);
  startGame();
};

puzzleCols.onchange = () => {
  startGame();
};

puzzleWidth.onchange = () => {
  startGame();
};

play.onclick = () => {
  scatter = !scatter;
  play.innerText = scatter ? "Solve!" : "Scatter!";
  const tiles = document.body.getElementsByClassName("tile");
  for (let index = 0; index < tiles.length; index++) {
    tiles[index].animateTile();
  }
};

const startGame = async () => {
  while (board.firstChild) {
    board.removeChild(board.lastChild);
  }
  //prettier-ignore
  const { sizes, tilePicArray }
    = await jigsaw(imgSrc, puzzleCols.value, puzzleWidth.value).catch(alert);

  board.style.width = `${sizes.board.x + sizes.tile.x / 2}px`;
  board.style.height = `${sizes.board.y + sizes.tile.y / 2}px`;
  board.style.outlineOffset = `-${(sizes.tile.x + sizes.tile.y) / 8 + 2}px`;

  const hintImg = new Image();
  hintImg.src = imgSrc;
  hintImg.style.width = `${sizes.board.x}px`;
  hintImg.style.height = `${sizes.board.y}px`;
  hintImg.style.left = `${sizes.tile.x / 4}px`;
  hintImg.style.top = `${sizes.tile.y / 4}px`;
  hintImg.className = "hint";
  hintImg.draggable = false; //!working on ff
  board.appendChild(hintImg);

  const { scatterArea } = await import("./constants.js");
  const completed = Array(tilePicArray.length).fill(false);
  let isDragging = false;
  let z = tilePicArray.length;

  tilePicArray.forEach((tile, index) => {
    const piece = new Image();

    piece.animateTile = () => {
      piece.style.transition = "all 0.5s ease-in-out";
      if (scatter) {
        const side = randomInt(scatterArea.length);
        piece.style.left = `${scatterArea[side].x(sizes)}px`;
        piece.style.top = `${scatterArea[side].y(sizes)}px`;
        piece.style.zIndex = randomInt(tilePicArray.length) + 1;
      } else {
        piece.style.left = `${tile.leftOffset}px`;
        piece.style.top = `${tile.topOffset}px`;
      }
      setTimeout(() => (piece.style.transition = "none"), 500);
      completed.fill(false);
    };

    piece.src = tile.base64Url;
    piece.className = "tile";
    board.appendChild(piece);
    piece.animateTile();

    const moveTile = (pageX, pageY) => {
      piece.style.left = `${pageX - sizes.tile.x * 0.75 - board.offsetLeft}px`;
      piece.style.top = `${pageY - sizes.tile.y * 0.75 - board.offsetTop}px`;
    };

    const dropTile = (pageX, pageY) => {
      const x = pageX - sizes.tile.x / 4 - board.offsetLeft;
      const y = pageY - sizes.tile.y / 4 - board.offsetTop;
      if (x > 0 && x < sizes.board.x && y > 0 && y < sizes.board.y) {
        const snapOnLeft = Math.trunc(x / sizes.tile.x) * sizes.tile.x;
        const snapOnTop = Math.trunc(y / sizes.tile.y) * sizes.tile.y;
        if (snapOnLeft === tile.leftOffset && snapOnTop === tile.topOffset) {
          completed[index] = true;
          piece.style.transition = "all 0.1s ease-in-out";
          piece.style.left = `${snapOnLeft}px`;
          piece.style.top = `${snapOnTop}px`;
          piece.style.zIndex = 0;
          setTimeout(() => (piece.style.transition = "none"), 100);
        }
        if (completed.every((tile) => tile)) {
          scatter = false;
          play.innerText = "Play!";
          completed.fill(false);
          bgColor.push(bgColor.shift());
          document.body.style.background = bgColor[0];
        }
      }
    };

    piece.onmousedown = (e) => {
      e.preventDefault(); //cos ff draggable="false" !working
      if (!completed[index]) {
        isDragging = true;
        moveTile(e.pageX, e.pageY);
        piece.style.zIndex = ++z;
      }
    };

    piece.onmousemove = (e) => {
      if (isDragging) moveTile(e.pageX, e.pageY);
    };

    piece.onmouseleave = () => (isDragging = false);

    piece.onmouseup = (e) => {
      isDragging = false;
      dropTile(e.pageX, e.pageY);
    };
    //prettier-ignore
    piece.addEventListener("touchstart", (e) => {
      if (!completed[index]) {
        moveTile(e.touches[0].pageX, e.touches[0].pageY);
        piece.style.zIndex = ++z;
      }
    }, {passive: true});

    piece.ontouchmove = (e) => {
      e.preventDefault();
      if (!completed[index]) {
        moveTile(e.touches[0].pageX, e.touches[0].pageY);
      }
    };

    piece.ontouchend = (e) => {
      dropTile(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
  });
};

startGame();
