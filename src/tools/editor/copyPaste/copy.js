import editorConfig from '../config/editor-config'
import { copyPasteSelection } from '../config/containers'

var copy = {
  start: function (songManager) {
    editorConfig.selectingMoves = true
    copyPasteSelection.visible = true
    editorConfig.copySelection = []
    editorConfig.clipboard = []
    editorConfig.copySelection.push(songManager.nearestBeat)
  },
  end: function (songManager) {
    editorConfig.copySelection.push(songManager.nearestBeat)
    editorConfig.copySelection.sort((a, b) => a - b)
    copyPasteSelection.visible = false
    editorConfig.selectingMoves = false
  },
  addSelectionToClipboard: function (danceChart) {
    danceChart.moves.forEach((move) => {
      if (move[0] >= editorConfig.copySelection[0] && move[0] <= editorConfig.copySelection[1]) editorConfig.clipboard.push(move)
    })
  }
}

export default copy
