import { selectionCircles } from '../config/containers'
import editorConfig from '../config/editor-config'

function disableSelection () {
  editorConfig.areaSelect = false
  selectionCircles.children.forEach(circle => {
    circle.interactive = false
  })
}

export default disableSelection
