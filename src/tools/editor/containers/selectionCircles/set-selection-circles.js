import * as PIXI from 'pixi.js'
import grid from '../../config/grid.js'
import editorConfig from '../../config/editor-config'

/*
Creates a grid of circles based on the grid points previously created in config/grid.js.
Not only the circles are drawn and placed on the container, the circle events are set at this moment too.
*/
function setSelectionCircles (containers, textures) {
  for (let i = 1; i < grid.length; i++) {
    let circle = new PIXI.Sprite(textures.circle)
    circle.alpha = 0.4
    // the anchor sets the anchor to be the center of the sprite, not the top left corner
    circle.anchor.set(0.5)
    circle.x = grid[i].x
    circle.y = grid[i].y
    // circles are named from top left to bottom right with numbers from 1 to 9
    circle.name = `${i}`
    circle.buttonMode = true

    circle.on('mouseover', (event) => {
      circle.alpha = 0.1
    })

    circle.on('mouseout', (event) => {
      circle.alpha = 0.4
    })
    /* pointerdown event allows the user to select where the player will need
    to place their hands in a given beat of the song
    However, it is in circleSelection that the circles are set to be interactive or not. */
    circle.on('pointerdown', (event) => {
      circle.alpha = 0.4
      editorConfig.selectedCircles.push(circle.name)
    })
    containers.auxiliary.selectionCircles.addChild(circle)
  }
}

export default setSelectionCircles
