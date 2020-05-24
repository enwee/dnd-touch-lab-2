export default async (imgSrc, boardCols, boardPxWidth) => {
  const img = new Image();
  img.src = imgSrc;
  await img.decode().catch(alert);

  const aspect = img.naturalWidth / img.naturalHeight;
  const cols = parseInt(boardCols);
  const rows = Math.round(cols / aspect);
  let pieces = cols * rows;

  const boardWidth = parseInt(boardPxWidth);
  const boardHeight = Math.ceil(boardWidth / aspect);
  const tileWidth = Math.ceil(boardWidth / cols);
  const tileHeight = Math.ceil(boardHeight / rows);

  const scaledPic = document.createElement("canvas");
  scaledPic.width = boardWidth;
  scaledPic.height = boardHeight;
  scaledPic.getContext("2d").drawImage(img, 0, 0, boardWidth, boardHeight);

  const edgeName = ["left", "top", "right", "btm"];
  const [left, top, right, btm] = [0, 1, 2, 3];
  const pieceEdges = [...Array(pieces)].map((_) => edgeName.slice());

  for (let piece = 0; piece < pieces; piece++) {
    if ((piece + 1) % cols === 0) {
      pieceEdges[piece][right] = null;
      pieceEdges[(piece + 1) % pieces][left] = null;
    } else {
      const extendEdge = Math.random() < 0.5;
      pieceEdges[piece][right] = extendEdge;
      pieceEdges[piece + 1][left] = !extendEdge;
    }
    if (Math.ceil((piece + 1) / cols) === rows) {
      pieceEdges[piece][btm] = null;
      pieceEdges[(piece + cols) % pieces][top] = null;
    } else {
      const extendEdge = Math.random() < 0.5;
      pieceEdges[piece][btm] = extendEdge;
      pieceEdges[(piece + cols) % pieces][top] = !extendEdge;
    }
  } //sets the edges of every piece

  const cropPuzzlePiece = (x, y, edges) => {
    const canvas = document.createElement("canvas");
    const canvasCtx = canvas.getContext("2d");
    canvas.width = tileWidth * 1.5;
    canvas.height = tileHeight * 1.5;
    canvasCtx.translate(canvas.width / 2, canvas.height / 2);

    edges.forEach((extend, edge) => {
      const rotatedWidth = edge % 2 ? tileHeight : tileWidth;
      const rotatedHeight = edge % 2 ? tileWidth : tileHeight;
      canvasCtx.lineTo(-rotatedWidth / 2 - 2, rotatedHeight / 2);
      if (extend !== null) {
        //prettier-ignore
        canvasCtx.arc(-rotatedWidth / 2, 0, rotatedWidth/4 - !extend,
          Math.PI / 180 * 90, Math.PI / 180 * 270, !extend);
      }
      canvasCtx.lineTo(-rotatedWidth / 2 - 2, -rotatedHeight / 2);
      canvasCtx.rotate((Math.PI / 180) * 90);
    });

    canvasCtx.clip();
    //prettier-ignore
    canvasCtx.drawImage(scaledPic,
     x - tileWidth / 4, y - tileHeight / 4, canvas.width, canvas.height,
     -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    const pieceImg = document.createElement("canvas");
    const pieceImgCtx = pieceImg.getContext("2d");
    pieceImg.width = (edges[left] + 4 + edges[right]) * (tileWidth / 4);
    pieceImg.height = (edges[top] + 4 + edges[btm]) * (tileHeight / 4);
    //prettier-ignore
    pieceImgCtx.drawImage(canvas,
      (!edges[left] * tileWidth / 4), (!edges[top] * tileHeight / 4),
      pieceImg.width, pieceImg.height, 0, 0, pieceImg.width, pieceImg.height);

    return {
      base64Url: pieceImg.toDataURL(),
      midX: (edges[left] + 2) * (tileWidth / 4),
      midY: (edges[top] + 2) * (tileHeight / 4),
    };
  };

  pieces = [];
  for (let y = 0; y < boardHeight; y += tileHeight) {
    for (let x = 0; x < boardWidth; x += tileWidth) {
      let edges = pieceEdges[(y / tileHeight) * cols + x / tileWidth];
      const { base64Url, midX, midY } = cropPuzzlePiece(x, y, edges);
      const leftOffset = x - (edges[left] * tileWidth) / 4;
      const topOffset = y - (edges[top] * tileHeight) / 4;
      edges = Object.fromEntries(
        edges.map((extend, edge) => [edgeName[edge], extend])
      );
      pieces.push({ base64Url, midX, midY, leftOffset, topOffset, edges });
    }
  }

  return {
    board: { width: boardWidth, height: boardHeight, cols, rows },
    tile: { width: tileWidth, height: tileHeight },
    pieces,
  };
};
