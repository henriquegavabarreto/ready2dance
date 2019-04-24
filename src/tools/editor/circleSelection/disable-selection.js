import { selectionCircles } from '../config/containers'

function disableSelection () {
  selectionCircles.children.forEach(circle => {
    circle.interactive = false
  })
}

export default disableSelection
