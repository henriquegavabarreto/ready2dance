import setFixedGraphics from './fixedGraphics/set-fixed-graphics'
import setBackgroundStaff from './backgroundStaff/set-background-staff'
import setSelectionCircles from './selectionCircles/set-selection-circles'

function setInitialGraphics (app) {
  setBackgroundStaff()
  setFixedGraphics()
  setSelectionCircles(app)
}

export default setInitialGraphics
