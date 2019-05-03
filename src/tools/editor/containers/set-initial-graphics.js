import setGuideLine from './fixedGraphics/set-guide-line'
import setBackgroundStaff from './backgroundStaff/set-background-staff'
import setSelectionCircles from './selectionCircles/set-selection-circles'

function setInitialGraphics (app) {
  setBackgroundStaff()
  setGuideLine()
  setSelectionCircles(app)
}

export default setInitialGraphics
