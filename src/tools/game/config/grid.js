import pixiConfig from './pixi-config'

// similar to editor grid, same idea, but with diferent measures
function createGrid () {
  let referenceGrid = ['-'] // placeholder for the first so position 1 can be index 1

  let distance = 160
  let initX = (pixiConfig.width / 2) - distance
  let initY = (pixiConfig.height / 2) + distance

  for (let y = initY; y >= initY - (2 * distance); y -= distance) {
    for (let x = initX; x <= initX + (2 * distance); x += distance) {
      referenceGrid.push({ x: x, y: y })
    }
  }

  return referenceGrid
}

let grid = createGrid()

export default grid
