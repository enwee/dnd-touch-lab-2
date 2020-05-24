const bgColor = ["teal", "purple", "brown", "steelblue"];

const randomInt = (range) => Math.floor(Math.random() * range);

const scatterArea = [
  {
    //below the board
    x: (board, tile) => randomInt(board.width - tile.width),
    y: (board, tile) => randomInt(tile.height * 0.5) + board.height,
  },
  {
    //right side of board
    x: (board, tile) => randomInt(tile.width * 0.5) + board.width,
    y: (board, tile) => randomInt(board.height - tile.height),
  },
  {
    //left side of board
    x: (board, tile) => -randomInt(tile.width * 0.25) - tile.width * 0.75,
    y: (board, tile) => randomInt(board.height - tile.height),
  },
];

export { bgColor, scatterArea, randomInt };
