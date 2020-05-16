import jigsaw from "./jigsaw.js";

const bgColor = ["teal", "purple", "brown", "steelblue"];
const images = ["stamp", "hand", "greedy", "water"];
const randomInt = (range) => Math.floor(Math.random() * range);

let imgSrc = image.files[0]
  ? URL.createObjectURL(image.files[0])
  : `./images/${images[randomInt(images.length)]}.jpg`;
let cols = columns.value || 6;
let puzzleWidthPx = width.value || 600;
let flag = false;

const initRnd = randomInt(4);
document.body.style.background = bgColor[initRnd];

image.onchange = () => {
  imgSrc = URL.createObjectURL(image.files[0]);
  startGame();
};

columns.onchange = () => {
  cols = columns.value;
  startGame();
};

width.onchange = () => {
  puzzleWidthPx = width.value;
  startGame();
};

play.onclick = () => {
  flag = !flag;
  play.innerText = flag ? "Solve!" : "Scatter!";
  startGame();
};

const startGame = async () => {
  while (board.firstChild) {
    board.removeChild(board.lastChild);
  }
  //prettier-ignore
  const { boardSize, tileSize, tilePicArray }
      = await jigsaw(imgSrc, cols, puzzleWidthPx).catch(alert);
  board.style.width = `${boardSize.X + tileSize.X / 2}px`;
  board.style.height = `${boardSize.Y + tileSize.Y / 2}px`;
  board.style.outlineOffset = `-${(tileSize.X + tileSize.Y) / 8 + 2}px`;

  const completed = Array(tilePicArray.length).fill(false);
  let isDragging = false;
  let z = tilePicArray.length;

  const img = new Image();
  img.src = imgSrc;
  img.style.width = `${boardSize.X}px`;
  img.style.height = `${boardSize.Y}px`;
  img.style.left = `${tileSize.X / 4}px`;
  img.style.top = `${tileSize.Y / 4}px`;
  img.className = "hint";
  img.draggable = false;
  board.appendChild(img);

  tilePicArray.forEach((tile, index) => {
    const side = randomInt(2);
    const scatterArea = [
      {
        x: randomInt(boardSize.X - tileSize.X),
        y: randomInt(tileSize.Y * 1.5) + boardSize.Y + tileSize.Y / 4,
      },
      {
        x: randomInt(tileSize.X * 1.5) + boardSize.X + tileSize.X / 4,
        y: randomInt(boardSize.Y - tileSize.Y),
      },
    ];

    const img = new Image();
    img.src = tile.base64Url;
    img.style.left = flag ? `${scatterArea[side].x}px` : `${tile.leftOffset}px`;
    img.style.top = flag ? `${scatterArea[side].y}px` : `${tile.topOffset}px`;
    img.style.zIndex = randomInt(tilePicArray.length);
    img.className = "tile";
    board.appendChild(img);

    const moveTile = (pageX, pageY) => {
      img.style.left = `${pageX - tileSize.X * 0.75 - board.offsetLeft}px`;
      img.style.top = `${pageY - tileSize.Y * 0.75 - board.offsetTop}px`;
    };

    const dropTile = (pageX, pageY) => {
      const x = pageX - tileSize.X / 4 - board.offsetLeft;
      const y = pageY - tileSize.Y / 4 - board.offsetTop;
      if (x > 0 && x < boardSize.X && y > 0 && y < boardSize.Y) {
        img.style.left = `${Math.trunc(x / tileSize.X) * tileSize.X}px`;
        img.style.top = `${Math.trunc(y / tileSize.Y) * tileSize.Y}px`;
        completed[index] =
          parseInt(img.style.left) === tile.leftOffset &&
          parseInt(img.style.top) === tile.topOffset;
        if (completed.every((tile) => tile)) {
          flag = false;
          play.innerText = "Play!";
          completed.fill(false);
          bgColor.push(bgColor.shift());
          document.body.style.background = bgColor[initRnd];
        }
      }
    };

    img.onmousedown = (e) => {
      e.preventDefault(); //cos ff draggable="false" !working
      isDragging = true;
      moveTile(e.pageX, e.pageY);
      img.style.zIndex = z++;
    };

    img.onmousemove = (e) => {
      if (isDragging) moveTile(e.pageX, e.pageY);
    };

    img.onmouseleave = () => (isDragging = false);

    img.onmouseup = (e) => {
      isDragging = false;
      dropTile(e.pageX, e.pageY);
    };
    //prettier-ignore
    img.addEventListener("touchstart", (e) => {
      moveTile(e.touches[0].pageX, e.touches[0].pageY);
      img.style.zIndex = z++;
    }, {passive: true});

    img.ontouchmove = (e) => {
      e.preventDefault();
      moveTile(e.touches[0].pageX, e.touches[0].pageY);
    };

    img.ontouchend = (e) => {
      dropTile(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
  });
};

startGame();
