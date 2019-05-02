import * as PIXI from 'pixi.js'
import { selectionCircles } from '../../config/containers'
import grid from '../../config/grid.js'
import editorConfig from '../../config/editor-config'

function setSelectionCircles (app) {
  var circleConfig = {
    size: editorConfig.cue.size,
    lineWidth: editorConfig.cue.lineWidth,
    gridColor: 0xc0c0c0,
    gridAlpha: 0.4
  }

  let draw = new PIXI.Graphics()
  draw.lineStyle(circleConfig.lineWidth, circleConfig.gridColor, circleConfig.gridAlpha)
  draw.drawCircle(0, 0, circleConfig.size)

  let textureCircle = app.renderer.generateTexture(draw)

  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textureCircle)
    console.log(grid[i].x)
    circle.x = grid[i].x
    circle.y = grid[i].y
    console.log(circle.x)
    console.log(circle.y)
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
    selectionCircles.addChild(circle)
  }
}

export default setSelectionCircles
