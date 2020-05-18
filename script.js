import jigsaw from "./jigsaw.js";

let imgSrc = image.files[0]
  ? URL.createObjectURL(image.files[0])
  : "./stamp.jpg";
puzzleCols.value = 6;
puzzleWidth.value = Math.trunc(document.body.clientWidth * 0.8);
let scatter = false;
const bgColor = ["teal", "purple", "brown", "steelblue"];

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
  const { boardSize, tileSize, tilePicArray }
      = await jigsaw(imgSrc, puzzleCols.value, puzzleWidth.value).catch(alert);
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
  img.draggable = false; //!working on ff
  board.appendChild(img);

  tilePicArray.forEach((tile, index) => {
    const img = new Image();
    const randomInt = (range) => Math.floor(Math.random() * range);
    const scatterArea = [
      {
        x: () => randomInt(boardSize.X - tileSize.X),
        y: () => randomInt(tileSize.Y) + boardSize.Y - tileSize.Y / 2,
      },
      {
        x: () => randomInt(tileSize.X) + boardSize.X - tileSize.X / 2,
        y: () => randomInt(boardSize.Y - tileSize.Y),
      },
      {
        x: () => -randomInt(tileSize.X / 2) - tileSize.X / 2,
        y: () => randomInt(boardSize.Y - tileSize.Y),
      },
    ];

    img.animateTile = () => {
      img.style.transition = "all 0.5s ease-in-out";
      if (scatter) {
        const side = randomInt(3);
        img.style.left = `${scatterArea[side].x()}px`;
        img.style.top = `${scatterArea[side].y()}px`;
        img.style.zIndex = randomInt(tilePicArray.length) + 1;
      } else {
        img.style.left = `${tile.leftOffset}px`;
        img.style.top = `${tile.topOffset}px`;
      }
      setTimeout(() => (img.style.transition = "none"), 500);
      completed.fill(false);
    };

    img.src = tile.base64Url;
    img.className = "tile";
    board.appendChild(img);
    img.animateTile();

    const moveTile = (pageX, pageY) => {
      img.style.left = `${pageX - tileSize.X * 0.75 - board.offsetLeft}px`;
      img.style.top = `${pageY - tileSize.Y * 0.75 - board.offsetTop}px`;
    };

    const dropTile = (pageX, pageY) => {
      const x = pageX - tileSize.X / 4 - board.offsetLeft;
      const y = pageY - tileSize.Y / 4 - board.offsetTop;
      if (x > 0 && x < boardSize.X && y > 0 && y < boardSize.Y) {
        const snapOnLeft = Math.trunc(x / tileSize.X) * tileSize.X;
        const snapOnTop = Math.trunc(y / tileSize.Y) * tileSize.Y;
        if (snapOnLeft === tile.leftOffset && snapOnTop === tile.topOffset) {
          completed[index] = true;
          img.style.transition = "all 0.1s ease-in-out";
          img.style.left = `${snapOnLeft}px`;
          img.style.top = `${snapOnTop}px`;
          img.style.zIndex = 0;
          setTimeout(() => (img.style.transition = "none"), 100);
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

    img.onmousedown = (e) => {
      e.preventDefault(); //cos ff draggable="false" !working
      if (!completed[index]) {
        isDragging = true;
        moveTile(e.pageX, e.pageY);
        img.style.zIndex = ++z;
      }
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
      if (!completed[index]) {
        moveTile(e.touches[0].pageX, e.touches[0].pageY);
        img.style.zIndex = ++z;
      }
    }, {passive: true});

    img.ontouchmove = (e) => {
      e.preventDefault();
      if (!completed[index]) {
        moveTile(e.touches[0].pageX, e.touches[0].pageY);
      }
    };

    img.ontouchend = (e) => {
      dropTile(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
  });
};

startGame();
