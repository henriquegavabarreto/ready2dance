import * as PIXI from 'pixi.js'
import { selectionCircles } from '../../config/containers.js'
import grid from '../../config/grid.js'
// import { addSelectionToArray } from '../../circles/add-selection-to-array.js'
// import { addSelectionToMove } from '../../circles/add-selection-to-move.js'
import editorConfig from '../../config/editor-config.js'

function setSelectionCircles () {
  var circleConfig = {
    size: editorConfig.cue.size,
    lineWidth: editorConfig.cue.lineWidth,
    gridColor: 0xc0c0c0,
    gridAlpha: 0.4
  }

  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Graphics()
    circle.lineStyle(circleConfig.lineWidth, circleConfig.gridColor, circleConfig.gridAlpha)
    circle.drawCircle(grid[i].x, grid[i].y, circleConfig.size)
    circle.cacheAsBitmap = true
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
      // if (editorConfig.creatingMove) {
      //   editorConfig.selectedCircles.push(circle.name)
      //   // addSelectionToArray(circle.name)
      // } else if (editorConfig.changingMove) {
      //   editorConfig.selectedCircles.push(circle.name)
      //   // addSelectionToMove(circle.name)
      // }
    })
    selectionCircles.addChild(circle)
  }
}

export default setSelectionCircles
