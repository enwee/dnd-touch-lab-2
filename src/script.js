import jigsaw from "./jigsaw.js";
import { bgColor, randomInt } from "./constants.js";

let imgSrc = "./image/stamp.jpg";
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
  const pieces = document.body.getElementsByClassName("piece");
  for (let index = 0; index < pieces.length; index++) {
    pieces[index].animateTile();
  }
};

const startGame = async () => {
  while (puzzle.firstChild) {
    puzzle.removeChild(puzzle.lastChild);
  }
  //prettier-ignore
  const {board, tile, pieces}
    = await jigsaw(imgSrc, puzzleCols.value, puzzleWidth.value).catch(alert);

  puzzle.style.width = `${board.width}px`;
  puzzle.style.height = `${board.height}px`;

  const hintImg = new Image();
  hintImg.src = imgSrc;
  hintImg.style.width = `${board.width}px`;
  hintImg.style.height = `${board.height}px`;
  hintImg.className = "hint";
  hintImg.draggable = false; //!working on ff
  puzzle.appendChild(hintImg);

  const { scatterArea } = await import("./constants.js");
  const completed = Array(pieces.length).fill(false);
  let isDragging = false;
  let z = pieces.length;

  pieces.forEach((piece, index) => {
    const pieceImg = new Image();

    pieceImg.animateTile = () => {
      pieceImg.style.transition = "all 0.5s ease-in-out";
      if (scatter) {
        const side = randomInt(scatterArea.length);
        pieceImg.style.left = `${scatterArea[side].x(board, tile)}px`;
        pieceImg.style.top = `${scatterArea[side].y(board, tile)}px`;
        pieceImg.style.zIndex = randomInt(pieces.length) + 1;
      } else {
        pieceImg.style.left = `${piece.leftOffset}px`;
        pieceImg.style.top = `${piece.topOffset}px`;
      }
      setTimeout(() => (pieceImg.style.transition = "none"), 500);
      completed.fill(false);
    };

    pieceImg.src = piece.base64Url;
    pieceImg.className = "piece";
    puzzle.appendChild(pieceImg);
    pieceImg.animateTile();

    const movePiece = (pageX, pageY) => {
      pieceImg.style.left = `${pageX - piece.midX - puzzle.offsetLeft}px`;
      pieceImg.style.top = `${pageY - piece.midY - puzzle.offsetTop}px`;
    };

    const dropPiece = (pageX, pageY) => {
      const x = pageX - puzzle.offsetLeft;
      const y = pageY - puzzle.offsetTop;
      if (x > 0 && x < board.width && y > 0 && y < board.height) {
        const snapOnLeft =
          (Math.trunc(x / tile.width) - piece.edges.left / 4) * tile.width;
        const snapOnTop =
          (Math.trunc(y / tile.height) - piece.edges.top / 4) * tile.height;
        if (snapOnLeft === piece.leftOffset && snapOnTop === piece.topOffset) {
          completed[index] = true;
          pieceImg.style.transition = "all 0.1s ease-in-out";
          pieceImg.style.left = `${snapOnLeft}px`;
          pieceImg.style.top = `${snapOnTop}px`;
          pieceImg.style.zIndex = 0;
          setTimeout(() => (pieceImg.style.transition = "none"), 100);
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

    pieceImg.onmousedown = (e) => {
      e.preventDefault(); //cos ff draggable="false" !working
      if (!completed[index]) {
        isDragging = true;
        pieceImg.style.transition = "all 0.1s ease-in-out";
        movePiece(e.pageX, e.pageY);
        setTimeout(() => (pieceImg.style.transition = "none"), 100);
        pieceImg.style.zIndex = ++z;
      }
    };

    pieceImg.onmousemove = (e) => {
      if (isDragging) movePiece(e.pageX, e.pageY);
    };

    pieceImg.onmouseleave = () => (isDragging = false);

    pieceImg.onmouseup = (e) => {
      if (!completed[index]) {
        isDragging = false;
        dropPiece(e.pageX, e.pageY);
      }
    };
    //prettier-ignore
    pieceImg.addEventListener("touchstart", (e) => {
      if (!completed[index]) {
        pieceImg.style.transition = "all 0.1s ease-in-out";
        movePiece(e.touches[0].pageX, e.touches[0].pageY);
        setTimeout(() => (pieceImg.style.transition = "none"), 100);
        pieceImg.style.zIndex = ++z;
      }
    }, {passive: true});

    pieceImg.ontouchmove = (e) => {
      e.preventDefault();
      if (!completed[index]) movePiece(e.touches[0].pageX, e.touches[0].pageY);
    };

    pieceImg.ontouchend = (e) => {
      if (!completed[index]) {
        dropPiece(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
      }
    };
  });
};

startGame();
