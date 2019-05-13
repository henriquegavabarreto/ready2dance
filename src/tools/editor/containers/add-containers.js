import * as PIXI from 'pixi.js'

export default function addContainers (app, containers) {
  containers.master.staticContainer = new PIXI.Container()
  containers.master.dynamicContainer = new PIXI.Container()
  containers.auxiliary.selectionCircles = new PIXI.Container()
  containers.auxiliary.cueContainer = new PIXI.Container()
  containers.auxiliary.guideLine = new PIXI.Container()
  containers.auxiliary.backgroundStaff = new PIXI.Container()
  containers.auxiliary.noteElements = new PIXI.Container()
  containers.auxiliary.guideNumbers = new PIXI.Container()
  containers.auxiliary.copyPasteSelection = new PIXI.Container()

  containers.master.staticContainer.addChild(containers.auxiliary.selectionCircles, containers.auxiliary.cueContainer)
  containers.master.dynamicContainer.addChild(containers.auxiliary.backgroundStaff, containers.auxiliary.noteElements, containers.auxiliary.guideNumbers, containers.auxiliary.copyPasteSelection)

  app.stage.addChild(containers.master.staticContainer, containers.master.dynamicContainer, containers.auxiliary.guideLine)
}
