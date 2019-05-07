import * as PIXI from 'pixi.js'
import grid from './config/grid'

export default function addGraphics (containers, textures) {
  containers.cues.addChild(textures.cues)

  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textures.circle)
    circle.alpha = 0.4
    circle.anchor.set(0.5)
    circle.x = grid[i].x
    circle.y = grid[i].y

    containers.circles.addChild(circle)
  }
}
