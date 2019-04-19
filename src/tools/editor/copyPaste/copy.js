import editorConfig from '../config/editor-config'
import { copyPasteSelection } from '../config/containers'

var copy = {
  start: function (songManager) {
    editorConfig.selectingMoves = true
    editorConfig.copySelection = []
    editorConfig.clipboard = []
    editorConfig.copySelection.push(songManager.nearestBeat)
  },
  end: function (songManager) {
    editorConfig.copySelection.push(songManager.nearestBeat)
    editorConfig.copySelection.sort((a, b) => a - b)
    copyPasteSelection.removeChildren()
    editorConfig.selectingMoves = false
  },
  addSelectionToClipboard: function (danceChart) {
    danceChart.moves.forEach((move) => {
      let splitMove = move.split(',')
      let beat = parseInt(splitMove[0])
      if (beat >= editorConfig.copySelection[0] && beat <= editorConfig.copySelection[1]) editorConfig.clipboard.push(move)
    })
  }
}

export default copy
