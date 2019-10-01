import editorConfig from './editor-config'

// returns an array of points to be used as reference to create a 3x3 grid of circles
function createGrid () {
  // referenceGrid starts with a placeholder for the first position so position 1 in the grid can be index 1
  let referenceGrid = ['-']

  let distance = 130
  let initX = (editorConfig.width * 2 / 3) - distance
  let initY = (editorConfig.height / 2) + distance

  for (let y = initY; y >= initY - (2 * distance); y -= distance) {
    for (let x = initX; x <= initX + (2 * distance); x += distance) {
      referenceGrid.push({ x: x, y: y })
    }
  }
  return referenceGrid
}

let grid = createGrid()

export default grid
