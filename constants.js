const bgColor = ["teal", "purple", "brown", "steelblue"];

const randomInt = (range) => Math.floor(Math.random() * range);

const scatterArea = [
  {
    x: (sizes) => randomInt(sizes.board.x - sizes.tile.x),
    y: (sizes) => randomInt(sizes.tile.y) + sizes.board.y - sizes.tile.y / 2,
  },
  {
    x: (sizes) => randomInt(sizes.tile.x) + sizes.board.x - sizes.tile.x / 2,
    y: (sizes) => randomInt(sizes.board.y - sizes.tile.y),
  },
  {
    x: (sizes) => -randomInt(sizes.tile.x / 2) - sizes.tile.x / 2,
    y: (sizes) => randomInt(sizes.board.y - sizes.tile.y),
  },
];

export { bgColor, scatterArea, randomInt };
