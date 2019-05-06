import editorConfig from '../config/editor-config'

function paste (danceChart, songManager, moveManager, noteManager, containers, textures) {
  let addMoves = true
  let movesToAdd = []
  for (let move of editorConfig.clipboard) {
    let newBeat = songManager.nearestBeat + (move[0] - editorConfig.copySelection[0])
    if (moveManager.checkForMoves(danceChart, newBeat) !== -1) {
      addMoves = false
      break
    }
    let newMove = [newBeat, move[1], move[2], move[3]]
    movesToAdd.push(newMove)
  }
  if (addMoves) {
    danceChart.moves = danceChart.moves.concat(movesToAdd)
    noteManager.redraw(danceChart, containers, textures)
  }
}

export default paste
