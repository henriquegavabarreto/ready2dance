import editorConfig from '../config/editor-config'

export default class MoveManager {
  constructor (songManager) {
    this.songManager = songManager
  }

  checkForMoves (danceChart, beat = this.songManager.nearestBeat) { // check if there is a move in a beat
    if (danceChart.moves.length === 0) {
      return -1
    } else {
      for (let i = 0; i < danceChart.moves.length; i++) {
        let move = danceChart.moves[i]
        if (move[0] === beat) {
          return i
        } else if (i === danceChart.moves.length - 1) {
          return -1
        }
      }
    }
  }

  getHandMove (danceChart, beat, hand) { // internal - return hand move of a beat
    let i = this.checkForMoves(danceChart, beat)
    if (i >= 0) {
      if (hand === 'L') {
        return danceChart.moves[i][2]
      } else {
        return danceChart.moves[i][3]
      }
    } else {
      return 'X'
    }
  }

  get moveType () { // internal - returns the moveType
    if (editorConfig.beatArray.length === 1) {
      return 'S'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] !== editorConfig.selectedCircles[1]) {
      return 'M'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] === editorConfig.selectedCircles[1]) {
      return 'H'
    }
  }

  getStartBeat (danceChart, beat, hand) { // internal - get start beat of a hold or motion
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'S') {
      return beat
    } else if (handMove[handMove.length - 1] === 'E' || handMove[handMove.length - 1] === 'P') {
      return this.getStartBeat(danceChart, beat - 1, hand)
    }
  }

  getEndBeat (danceChart, beat, hand) { // internal - get end beat of a hold or motion
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'E') {
      return beat
    } else if (handMove[handMove.length - 1] === 'S' || handMove[handMove.length - 1] === 'P') {
      return this.getEndBeat(danceChart, beat + 1, hand)
    }
  }

  addMoveToChart (danceChart, pressedKey, beat) { // call when stop creation to add 'proto-moves' to chart
    let i = this.checkForMoves(danceChart, beat)

    if (i === -1) { // if there is no move on the beat yet
      if (editorConfig.pressedKey === 'x') { // S for selected and X for no data
        danceChart.moves.push([beat, 1, 'X', 'S'])
      } else if (editorConfig.pressedKey === 'z') {
        danceChart.moves.push([beat, 1, 'S', 'X'])
      }
    } else { // if there is a move on this beat
      if (editorConfig.pressedKey === 'x' && danceChart.moves[i][3] === 'X') { // select right hand
        danceChart.moves[i][3] = 'S'
      } else if (editorConfig.pressedKey === 'z' && danceChart.moves[i][2] === 'X') { // select left hand
        danceChart.moves[i][2] = 'S'
      }
    }
  }

  addHandInfo (danceChart) {
    let moveType = this.moveType
    editorConfig.beatArray.forEach((beat, index) => {
      let i = this.checkForMoves(danceChart, beat)
      if (moveType === 'S') {
        if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
          danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[0]
        } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
          danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[0]
        }
      } else {
        if (index === 0) {
          if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
            danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[0] + 'S' + (editorConfig.beatArray[editorConfig.beatArray.length - 1] - editorConfig.beatArray[0] + 1)
          } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
            danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[0] + 'S' + (editorConfig.beatArray[editorConfig.beatArray.length - 1] - editorConfig.beatArray[0] + 1)
          }
        } else if (index > 0 && index < editorConfig.beatArray.length - 1) {
          if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
            danceChart.moves[i][2] = moveType + 'P'
          } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
            danceChart.moves[i][3] = moveType + 'P'
          }
        } else if (index === editorConfig.beatArray.length - 1) {
          if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
            danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[1] + 'E'
          } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
            danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[1] + 'E'
          }
        }
      }
    })
  }

  isValidInsert (danceChart) { // call when creation stops - checks if there are notes in any of the selected positions
    let isValid = false
    for (let i = 0; i < editorConfig.beatArray.length; i++) {
      let moveIndex = this.checkForMoves(danceChart, editorConfig.beatArray[i])
      if (moveIndex !== -1) { // if there are moves
        if (editorConfig.pressedKey === 'z' && danceChart.moves[moveIndex][2] !== 'X') { // for left hand
          return false
        } else if (editorConfig.pressedKey === 'x' && danceChart.moves[moveIndex][3] !== 'X') { // for right hand
          return false
        } else {
          isValid = true
        }
      } else { // if there are no moves in the selected beats
        isValid = true
      }
    }
    return isValid
  }

  addRequiredMoves (danceChart, key) { // adds 'proto-moves' - call when isValidInsert is true
    editorConfig.beatArray.forEach((beat) => {
      this.addMoveToChart(danceChart, key, beat)
    })
  }

  changeMove (danceChart, beat, key, position) { // call after all selection is done
    let hand = 'L'
    if (editorConfig.pressedKey === 's') hand = 'R'
    let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, hand)
    let i = this.checkForMoves(danceChart)
    if (hand === 'L') {
      if (handMove.length === 2) {
        danceChart.moves[i][2] = handMove[0] + position + 'P'
      } else {
        danceChart.moves[i][2] = handMove[0] + position + handMove[2]
      }
    } else {
      if (handMove.length === 2) {
        danceChart.moves[i][3] = handMove[0] + position + 'P'
      } else {
        danceChart.moves[i][3] = handMove[0] + position + handMove[2]
      }
    }
  }

  setHoldNode (danceChart, key) { // call when 'a' or 's' keyup
    let hand = 'L'
    if (key === 's') hand = 'R'
    let startBeat = this.getStartBeat(danceChart, this.songManager.nearestBeat, hand)
    let originalPosition = this.getHandMove(danceChart, startBeat, hand)[1]
    let i = this.checkForMoves(danceChart)
    if (hand === 'L') {
      danceChart.moves[i][2] = 'H' + originalPosition + 'P'
    } else {
      danceChart.moves[i][3] = 'H' + originalPosition + 'P'
    }
  }

  getCreatedMoveType (danceChart, key) {
    let hand = 'L'
    if (key === 's') hand = 'R'
    let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, hand)
    return handMove[0]
  }

  updateMoves (danceChart, bpm, offsetDifference) { // to use when there are any changes in timing
    let updatedMoves = []
    danceChart.moves.forEach(move => { // insert all elements again based on the bpm and offset changes based on the dance chart
      move[0] = move[0] + Math.round((offsetDifference / (60 / bpm)) * 4) // change each move beat so they stay in the same time according to the song
      updatedMoves.push(move)
    })
    danceChart.moves = updatedMoves // update moves on the dance chart
  }

  deleteMove (danceChart, key) { // call when q or w keyup to delete moves
    if (key === 'q') {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'L')
      if (handMove !== 'X') {
        this.searchAndDelete(danceChart, this.songManager.nearestBeat, handMove, 'L')
        this.removeNoInfoMoves(danceChart)
      }
    } else {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'R')
      if (handMove !== 'X') {
        this.searchAndDelete(danceChart, this.songManager.nearestBeat, handMove, 'R')
        this.removeNoInfoMoves(danceChart)
      }
    }
  }

  searchAndDelete (danceChart, beat, handMove, hand) { // internal - search surrounding moves to delete
    if (handMove[0] === 'S') { // if sharp move
      this.removeHandInfo(danceChart, beat, hand)
    } else if (handMove[0] === 'H' || handMove[0] === 'M') {
      let startBeat = this.getStartBeat(danceChart, beat, hand)
      let endBeat = this.getEndBeat(danceChart, beat, hand)
      for (let i = startBeat; i <= endBeat; i++) {
        this.removeHandInfo(danceChart, i, hand)
      }
    }
  }

  removeHandInfo (danceChart, beat, hand) { // internal - remove hand info when delete button keyup
    if (hand === 'L') { // if left hand
      danceChart.moves[this.checkForMoves(danceChart, beat)][2] = 'X' // change the move that needs to be changed
    } else {
      danceChart.moves[this.checkForMoves(danceChart, beat)][3] = 'X' // change the move that needs to be changed
    }
  }

  removeNoInfoMoves (danceChart) { // internal - it is called to remove 'X,X' moves from the chart
    for (let i = danceChart.moves.length - 1; i >= 0; i--) {
      if (danceChart.moves[i][2] === 'X' && danceChart.moves[i][3] === 'X') danceChart.moves.splice(i, 1)
    }
  }

  addBeatToArray (beat = this.songManager.nearestBeat, modifier = 1) {
    if (modifier === 1 || modifier === -1) {
      if (!editorConfig.beatArray.includes(beat)) editorConfig.beatArray.push(beat)
    } else if (modifier === 4) {
      for (let i = 0; i <= 3; i++) { // adds notes in between
        let beatToAdd = beat - i
        if (!editorConfig.beatArray.includes(beatToAdd)) editorConfig.beatArray.push(beatToAdd)
      }
    } else if (modifier === -4) {
      for (let i = 0; i <= 3; i++) {
        let beatToAdd = beat + i
        if (!editorConfig.beatArray.includes(beatToAdd)) editorConfig.beatArray.push(beatToAdd)
      }
    }
  }

  clearBeatArray () { // clears the array
    editorConfig.beatArray = []
  }

  sortBeatArray () {
    editorConfig.beatArray.sort(function (a, b) { return a - b })
  }

  setCircleCount () {
    if (editorConfig.beatArray.length === 1) {
      editorConfig.circleCount = 1
    } else {
      editorConfig.circleCount = 2
    }
  }

  update (songManager) {
    this.songManager = songManager
  }
}
