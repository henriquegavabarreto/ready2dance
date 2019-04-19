import editorConfig from '../config/editor-config'

function paste (songManager, danceChart, moveManager, noteManager) {
  let addMoves = true
  let movesToAdd = []
  for (let move of editorConfig.clipboard) {
    move = move.split(',')
    let beat = parseInt(move[0])
    let newBeat = songManager.nearestBeat + (beat - editorConfig.copySelection[0])
    if (moveManager.checkMoves(danceChart, newBeat) !== -1) {
      addMoves = false
      break
    }
    move[0] = newBeat
    move = move.join(',')
    movesToAdd.push(move)
  }
  if (addMoves) {
    for (let move of movesToAdd) {
      danceChart.moves.push(move)
    }
    noteManager.redrawNotes(danceChart)
  }
}

export default paste
