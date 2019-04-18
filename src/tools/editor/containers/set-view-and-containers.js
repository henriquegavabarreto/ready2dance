import { selectionCircles, backgroundStaff, noteElements, guideNumbers, fixedGraphics, cueContainer, copyPasteSelection } from '../config/containers'

function setViewAndContainers (app) {
  document.getElementById('canvas').appendChild(app.view)

  app.stage.addChild(backgroundStaff)
  app.stage.addChild(noteElements)
  app.stage.addChild(copyPasteSelection)
  app.stage.addChild(fixedGraphics)
  app.stage.addChild(selectionCircles)
  app.stage.addChild(cueContainer)
  app.stage.addChild(guideNumbers)
}

export default setViewAndContainers
