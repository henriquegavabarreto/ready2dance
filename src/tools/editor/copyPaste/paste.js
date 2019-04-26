import editorConfig from '../config/editor-config'

function paste (danceChart, songManager, moveManager, noteManager) {
  let addMoves = true
  let movesToAdd = []
  for (let move of editorConfig.clipboard) {
    let newBeat = songManager.nearestBeat + (move[0] - editorConfig.copySelection[0])
    if (moveManager.checkForMoves(danceChart, newBeat) !== -1) {
      addMoves = false
      break
    }
    move[0] = newBeat
    movesToAdd.push(move)
  }
  if (addMoves) {
    for (let move of movesToAdd) {
      danceChart.moves.push(move)
    }
    noteManager.redraw(danceChart)
  }
}

export default paste
