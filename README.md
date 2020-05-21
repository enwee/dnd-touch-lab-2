# jigsaw
### A Javascript jigsaw puzzle generator using only web-browser* APIs
###### _(*Chrome, Firefox - wip for webkit/safari, IE, pre-blink Edge)_
#### with support for mouse and touchscreen control
![screenshot 1](https://enwee.github.io/pics/jigsaw-small.gif)
![placeholder](https://enwee.github.io/pics/jigsaw1-small.gif)

### Select any picture and also change the size of puzzle pieces
![placeholder](https://enwee.github.io/pics/jigsaw2-small.gif)

* ```jigsaw.js``` uses HTML 5 Canvas API to generate puzzle pieces
* given (when called with) 
  * ```imageSrcUrl``` - url of image to be used for the puzzle
  * ```puzzleColumns``` - number of pieces (columns) per row in the generated puzzle
  * ```puzzleWidthPx``` - width (in pixels) of the generated puzzle
* returns 
  * ```sizes``` - object containing the X/Y dimensions (in pixels) of the puzzle board and each tile  
  * ```tilePicArray``` - Array of puzzle piece objects containing
    * base64 encoded puzzle piece image
    * object describing the puzzle piece edges
    * left/top offset position with respect to the puzzle board

```javascript
import jigsaw from "./jigsaw.js";

const startGame = async () => {
  const { sizes, tilePicArray } 
    = await jigsaw(imgSrcUrl, puzzleColumns, puzzleWidthPx)
  
  //game logic/layout code here
}
```
###### _(*awaiting [Top-Level-Await](https://v8.dev/features/top-level-await) to be implemented in browser)_
