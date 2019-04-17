import editorConfig from './editor-config'

function createGrid () {
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
