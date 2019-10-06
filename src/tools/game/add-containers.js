import * as PIXI from 'pixi.js'

// creates containers and add them to the stage
export default function addContainers (app, containers) {
  containers.circles = new PIXI.Container()
  containers.cues = new PIXI.Container()
  containers.feedback = new PIXI.Container()
  app.stage.addChild(containers.circles, containers.cues, containers.feedback)
}
