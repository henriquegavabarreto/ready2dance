import * as PIXI from 'pixi.js'

/* Creates and assigns pixi containers in an object (containers)
- master has two main containers (static and dynamic)
- static has no x and y alteration
- dynamic moves according to the video playback
- auxiliary containers are added to the masters depending on their nature (static or dynamic) and contain
  background elements, selection circles (for selecting movement locations), cues that will be animated -
  most are self-explanatory
- the auxiliary guideLine is a static line to keep track of the beat and is added to the stage after
  the master containers to stay visible on the top of the editor
*/

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
