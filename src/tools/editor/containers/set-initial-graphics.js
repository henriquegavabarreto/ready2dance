import setGuideLine from './fixedGraphics/set-guide-line'
import drawStaff from './backgroundStaff/draw-staff'
import setSelectionCircles from './selectionCircles/set-selection-circles'

export default function setInitialGraphics (containers, textures) {
  drawStaff(containers, textures)
  setGuideLine(containers, textures)
  setSelectionCircles(containers, textures)
  containers.auxiliary.copyPasteSelection.addChild(textures.selection)
  containers.auxiliary.cueContainer.addChild(textures.cues)
}
