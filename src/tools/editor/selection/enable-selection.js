import { selectionCircles } from '../config/containers'
import editorConfig from '../config/editor-config'

function enableSelection () {
  editorConfig.areaSelect = true
  selectionCircles.children.forEach(circle => {
    circle.interactive = true
  })
}

export default enableSelection
