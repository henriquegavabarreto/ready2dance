import { selectionCircles } from '../config/containers'

function enableSelection () {
  selectionCircles.children.forEach(circle => {
    circle.interactive = true
  })
}

export default enableSelection
