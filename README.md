# 🧩 jigsaw
### A Javascript jigsaw puzzle piece generator using web-browser\* APIs
###### _(\*Chrome, Firefox - wip for webkit/safari, IE, pre-blink Edge)_

### Cuts a source image into a collection of jigsaw piece images
###### _([Shown](https://enwee.github.io/jigsaw) in a game layout for **mouse/touchscreen** control)_
![scatter/solve](https://enwee.github.io/pics/jigsaw-small.gif)
![game/play](https://enwee.github.io/pics/jigsaw1-small.gif)

### Select any picture and also change the size of puzzle pieces
![change pic/size](https://enwee.github.io/pics/jigsaw2-small.gif)

- `jigsaw.js` uses HTML 5 Canvas API to generate .png puzzle piece images
- given (when called with)
  - `imageSrcUrl` - url of image to be used for the puzzle
  - `puzzleColumns` - number of pieces (columns) per row in the generated puzzle
  - `puzzleWidthPx` - width (in pixels) of the generated puzzle
- returns
  - `board` - object containing the X/Y dimensions (in pixels) of the puzzle board and the number of rows/cols
  - `tile` - object containing the X/Y dimensions (in pixels) of each tile on puzzle board
  - `pieces` - Array of puzzle piece objects containing
    - base64 encoded .png puzzle piece image
    - offset for mid point of tile with respect to the piece dimension
    - left/top offset for original position with respect to the puzzle board
    - object describing the puzzle piece edges

```javascript
import jigsaw from "./jigsaw.js";

const startGame = async () => { //remove in future**
  const { board, tile, pieces } 
    = await jigsaw( imgSrcUrl, puzzleColumns, puzzleWidthPx);
  //game logic/layout code here
};
```
###### _(\*\*awaiting [Top-Level-Await](https://v8.dev/features/top-level-await) to be implemented in browser)_
