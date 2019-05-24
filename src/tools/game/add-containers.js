import * as PIXI from 'pixi.js'

export default function addContainers (app, containers) {
  containers.circles = new PIXI.Container()
  containers.cues = new PIXI.Container()
  containers.feedback = new PIXI.Container()
  app.stage.addChild(containers.circles, containers.cues, containers.feedback)
}
