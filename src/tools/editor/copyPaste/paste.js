import editorConfig from '../config/editor-config'

// To be used when the paste button is pressed
function paste (danceChart, songManager, moveManager, noteManager, containers, textures) {
  let addMoves = true
  // moves to add will have all the moves from the clipboard with the changed beat, so they can be added to the danceChart
  let movesToAdd = []
  for (let move of editorConfig.clipboard) {
    // calculates in which beat the moves need to be placed at
    // current selected beat PLUS the diference between the first selected beat and the beat where the copied move is located
    let newBeat = songManager.nearestBeat + (move[0] - editorConfig.copySelection[0])
    // if there is already a move in any of the beats that the moves should be placed, break will stop any move to be added
    if (moveManager.checkForMoves(danceChart, newBeat) !== -1) {
      addMoves = false
      break
    }
    let newMove = [newBeat, move[1], move[2], move[3]]
    movesToAdd.push(newMove)
  }
  // If there are no conflitant moves
  if (addMoves) {
    // adds moves to danceChart
    danceChart.moves = danceChart.moves.concat(movesToAdd)
    // draws the notes to the canvas
    movesToAdd.forEach((move) => {
      if (move[2] !== 'X') noteManager.addNote(move[0], 'L', move[2], containers, textures)
      if (move[3] !== 'X') noteManager.addNote(move[0], 'R', move[3], containers, textures)
    })
  }
}

export default paste
