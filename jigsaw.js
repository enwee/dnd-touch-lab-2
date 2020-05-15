export default async (imgSrc, boardCols, boardPxWidth) => {
  const img = new Image();
  img.src = imgSrc;
  await img.decode().catch(alert);

  const aspect = img.naturalWidth / img.naturalHeight;
  const cols = parseInt(boardCols);
  const rows = Math.round(cols / aspect);
  const pieces = cols * rows;

  const boardSizeX = parseInt(boardPxWidth);
  const boardSizeY = Math.round(boardSizeX / aspect);
  const tileSizeX = Math.ceil(boardSizeX / cols);
  const tileSizeY = Math.ceil(boardSizeY / rows);

  const scaledPic = document.createElement("canvas");
  scaledPic.width = boardSizeX;
  scaledPic.height = boardSizeY;
  scaledPic.getContext("2d").drawImage(img, 0, 0, boardSizeX, boardSizeY);

  const edgeName = ["left", "top", "right", "btm"];
  const [leftEdge, topEdge, rightEdge, btmEdge] = [0, 1, 2, 3];
  const tileEdgeArray = [...Array(pieces)].map((_) => edgeName.slice());

  for (let tileIndex = 0; tileIndex < pieces; tileIndex++) {
    if ((tileIndex + 1) % cols === 0) {
      tileEdgeArray[tileIndex][rightEdge] = "picEdge";
      tileEdgeArray[(tileIndex + 1) % pieces][leftEdge] = "picEdge";
    } else {
      const extendEdge = Math.random() < 0.5;
      tileEdgeArray[tileIndex][rightEdge] = extendEdge;
      tileEdgeArray[tileIndex + 1][leftEdge] = !extendEdge;
    }
    if (Math.ceil((tileIndex + 1) / cols) === rows) {
      tileEdgeArray[tileIndex][btmEdge] = "picEdge";
      tileEdgeArray[(tileIndex + cols) % pieces][topEdge] = "picEdge";
    } else {
      const extendEdge = Math.random() < 0.5;
      tileEdgeArray[tileIndex][btmEdge] = extendEdge;
      tileEdgeArray[(tileIndex + cols) % pieces][topEdge] = !extendEdge;
    }
  } //sets the edges of every piece

  const cropPuzzlePiece = (x, y, tileIndex) => {
    const canvas = document.createElement("canvas");
    const canvasCtx = canvas.getContext("2d");
    canvas.width = Math.ceil(tileSizeX * 1.5);
    canvas.height = Math.ceil(tileSizeY * 1.5);
    canvasCtx.translate(canvas.width / 2, canvas.height / 2);

    tileEdgeArray[tileIndex].forEach((extend, edge) => {
      const rotatedX = edge % 2 ? tileSizeY : tileSizeX;
      const rotatedY = edge % 2 ? tileSizeX : tileSizeY;
      if (!extend) canvasCtx.translate(-1, 0);
      if (!edge) canvasCtx.moveTo(-tileSizeX / 2, tileSizeY / 2);
      if (extend !== "picEdge") {
        const tileSize = edge % 2 ? tileSizeY : tileSizeX;
        //prettier-ignore
        canvasCtx.arc(-tileSize / 2, 0, tileSize/4,
          Math.PI / 180 * 90, Math.PI / 180 * 270, !extend);
      }
      canvasCtx.lineTo(-rotatedX / 2, -rotatedY / 2);
      if (!extend) canvasCtx.translate(1, 0);
      canvasCtx.rotate((Math.PI / 180) * 90);
    });

    canvasCtx.clip();
    //prettier-ignore
    canvasCtx.drawImage(scaledPic,
        x - tileSizeX*0.25, y - tileSizeY*0.25, canvas.width, canvas.height,
        -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    return canvas.toDataURL();
  };

  const tilePicArray = [];
  for (let y = 0; y < boardSizeY; y += tileSizeY) {
    for (let x = 0; x < boardSizeX; x += tileSizeX) {
      const tileIndex = (y / tileSizeY) * cols + x / tileSizeX;
      const edges = Object.fromEntries(
        tileEdgeArray[tileIndex].map((extend, edge) => [edgeName[edge], extend])
      );
      const leftOffset = tileSizeX * (tilePicArray.length % cols);
      const topOffset = tileSizeY * Math.floor(tilePicArray.length / cols);
      const base64Url = cropPuzzlePiece(x, y, tileIndex);
      tilePicArray.push({ edges, leftOffset, topOffset, base64Url });
    }
  }

  return {
    boardSize: { X: boardSizeX, Y: boardSizeY },
    tileSize: { X: tileSizeX, Y: tileSizeY },
    tilePicArray,
  };
};
