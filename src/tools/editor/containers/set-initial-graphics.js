import setFixedGraphics from './fixedGraphics/set-fixed-graphics'
import setBackgroundStaff from './backgroundStaff/set-background-staff'
import setSelectionCircles from './selectionCircles/set-selection-circles'

function setInitialGraphics () {
  setBackgroundStaff()
  setFixedGraphics()
  setSelectionCircles()
}

export default setInitialGraphics
