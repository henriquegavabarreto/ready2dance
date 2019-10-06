import * as PIXI from 'pixi.js'
import grid from './config/grid'

// Adds all graphics to their respective containers
export default function addGraphics (containers, textures) {
  // add cues  to cues container
  containers.cues.addChild(textures.cues)

  // creates all reference circle sprites based on the grid and add them to the circles container
  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textures.circle)
    circle.alpha = 0.4
    circle.anchor.set(0.5)
    circle.x = grid[i].x
    circle.y = grid[i].y

    containers.circles.addChild(circle)
  }

  /*
  Add one feedback for each circle
  Even though the texture chosen to be the default is 'textures.perfect',
  the feedback.texture can be changed (and it is) in the giveFeedback function as necessary
  */
  for (let i = 1; i < grid.length; i++) {
    let feedback = new PIXI.Sprite(textures.perfect)
    feedback.visible = false
    feedback.anchor.set(0.5)
    feedback.x = grid[i].x
    feedback.y = grid[i].y
    feedback.name = `${i}`

    containers.feedback.addChild(feedback)
  }
}
