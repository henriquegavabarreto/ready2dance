import { circleSelection, backgroundChart, noteElements, guideNumbers, fixedGraphics, cueContainer, copyPasteSelection } from '../config/containers'

function setViewAndContainers (app) {
  document.getElementById('canvas').appendChild(app.view)

  app.stage.addChild(backgroundChart)
  app.stage.addChild(noteElements)
  app.stage.addChild(copyPasteSelection)
  app.stage.addChild(fixedGraphics)
  app.stage.addChild(circleSelection)
  app.stage.addChild(cueContainer)
  app.stage.addChild(guideNumbers)
}

export default setViewAndContainers
