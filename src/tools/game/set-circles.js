import * as PIXI from 'pixi.js'
import grid from './config/grid'
import gameConfig from './config/game-config'

function setCircles (container) {
  var circleConfig = {
    size: gameConfig.cue.size,
    lineWidth: gameConfig.cue.lineWidth,
    gridColor: 0xc0c0c0,
    gridAlpha: 0.4
  }

  let circle = new PIXI.Graphics()

  for (let i = 1; i < grid.length; i++) {
    circle.lineStyle(circleConfig.lineWidth, circleConfig.gridColor, circleConfig.gridAlpha)
    circle.drawCircle(grid[i].x, grid[i].y, circleConfig.size)
  }
  circle.cacheAsBitmap = true

  container.addChild(circle)
}

export default setCircles
