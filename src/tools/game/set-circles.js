import * as PIXI from 'pixi.js'
import grid from './config/grid'
import gameConfig from './config/game-config'

function setCircles (app, container) {
  var circleConfig = {
    size: gameConfig.cue.size,
    lineWidth: gameConfig.cue.lineWidth,
    gridColor: 0xc0c0c0,
    gridAlpha: 0.4
  }

  let draw = new PIXI.Graphics()
  draw.lineStyle(circleConfig.lineWidth, circleConfig.gridColor, circleConfig.gridAlpha)
  draw.drawCircle(0, 0, circleConfig.size)

  let textureCircle = app.renderer.generateTexture(draw)

  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textureCircle)
    circle.x = grid[i].x
    circle.y = grid[i].y
    container.addChild(circle)
  }
  draw.destroy()
}

export default setCircles
