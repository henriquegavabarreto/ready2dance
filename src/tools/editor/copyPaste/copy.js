import editorConfig from '../config/editor-config'

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
    editorConfig.selectingMoves = false
  },
  addSelectionToClipboard: function (danceChart) {
    danceChart.moves.forEach((move) => {
      if (move[0] >= editorConfig.copySelection[0] && move[0] <= editorConfig.copySelection[1]) editorConfig.clipboard.push(move)
    })
  }
}

export default copy
