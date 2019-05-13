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
    movesToAdd.forEach((move) => {
      if (move[2] !== 'X') noteManager.addNote(move[0], 'L', move[2], containers, textures)
      if (move[3] !== 'X') noteManager.addNote(move[0], 'R', move[3], containers, textures)
    })
  }
}

export default paste
