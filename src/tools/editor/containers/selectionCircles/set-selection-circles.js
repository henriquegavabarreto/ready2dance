import * as PIXI from 'pixi.js'
import grid from '../../config/grid.js'
import editorConfig from '../../config/editor-config'

function setSelectionCircles (containers, textures) {
  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textures.circle)
    circle.alpha = 0.4
    circle.anchor.set(0.5)
    circle.x = grid[i].x
    circle.y = grid[i].y
    circle.name = `${i}`
    circle.buttonMode = true

    circle.on('mouseover', (event) => {
      circle.alpha = 0.1
    })

    circle.on('mouseout', (event) => {
      circle.alpha = 1
    })

    circle.on('mousedown', (event) => {
      circle.alpha = 1
      editorConfig.selectedCircles.push(circle.name)
    })
    containers.auxiliary.selectionCircles.addChild(circle)
  }
}

export default setSelectionCircles
