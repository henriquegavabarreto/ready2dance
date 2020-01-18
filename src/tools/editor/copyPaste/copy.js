import editorConfig from '../config/editor-config'
/*
Groups all copy related functions

start - to be used when a button is pressed to copy movements
Changes mode to selectingMoves, sets copySelection and clipboard to be an empty array to make sure there are no moves stored,
pushes the beat to the copySelection array

end - to be used when the copy button is released
pushes the last beat to the copySelection array and sorts the array in ascending order
exits selectingMoves mode

addSelectionToClipboard - add the moves to the clipboard
Based on the copySelection elements, get the moves between those selected beats and push them to the clipboard
to be used afterwards when pasting

TODO:

1. all - copy from first to last note - Check the best approach to do this.
Maybe the editor should listen to another key or a combination of keys (c + a)

2. editorConfig.clipboard - should be an array in VUEX, so the user can use in a new file (in case that is necessary)
*/
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
