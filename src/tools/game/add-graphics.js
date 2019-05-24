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

  for (let i = 1; i < grid.length; i++) { // add one feedback for each circle
    let feedback = new PIXI.Sprite(textures.perfect)
    feedback.visible = false
    feedback.anchor.set(0.5)
    feedback.x = grid[i].x
    feedback.y = grid[i].y
    feedback.name = `${i}`

    containers.feedback.addChild(feedback)
  }
}
