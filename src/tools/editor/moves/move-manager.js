import editorConfig from '../config/editor-config'

export default class MoveManager {
  constructor (songManager) {
    this.songManager = songManager
  }

  checkForMove (danceChart, beat = this.songManager.nearestBeat) {
    if (danceChart.moves.length === 0) {
      return -1
    } else {
      for (let i = 0; i < danceChart.moves.length; i++) {
        let move = danceChart.moves[i]
        move = move.split(',')
        if (parseInt(move[0]) === beat) {
          return i
        } else if (i === danceChart.moves.length - 1) {
          return -1
        }
      }
    }
  }

  getHandMove (danceChart, beat, hand) {
    let i = this.checkForMove(beat)
    if (i >= 0) {
      let move = danceChart.moves[i]
      move = move.split(',')
      if (hand === 'L') {
        return move[2]
      } else {
        return move[3]
      }
    } else {
      return 'X'
    }
  }

  get moveType () {
    if (editorConfig.beatArray.length === 1) {
      return 'S'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] !== editorConfig.selectedCircles[1]) {
      return 'M'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] === editorConfig.selectedCircles[1]) {
      return 'H'
    }
  }

  getStartBeat (danceChart, beat, hand) {
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'S') {
      return beat
    } else if (handMove[handMove.length - 1] === 'E' || handMove[handMove.length - 1] === 'P') {
      return this.getStartBeat(danceChart, beat - 1, hand)
    }
  }

  getEndBeat (danceChart, beat, hand) {
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'E') {
      return beat
    } else if (handMove[handMove.length - 1] === 'S' || handMove[handMove.length - 1] === 'P') {
      return this.getEndBeat(danceChart, beat + 1, hand)
    }
  }

  addMoveToChart (danceChart, pressedKey, beat) {
    let beatOnMove = this.checkForMoves(danceChart, beat)

    if (beatOnMove === -1) { // if there is no move on the beat yet
      if (pressedKey === editorConfig.shortCuts.rightHand) { // S for selected and X for no data
        danceChart.moves.push(`${beat},1,X,S`)
      } else if (pressedKey === editorConfig.shortCuts.leftHand) {
        danceChart.moves.push(`${beat},1,S,X`)
      }
    } else { // if there is a move on this beat
      let moves = danceChart.moves[beatOnMove].split(',')
      if (pressedKey === editorConfig.shortCuts.rightHand && moves[3] === 'X') { // select right hand
        moves[3] = 'S'
        moves = moves.join(',')
        danceChart.moves[beatOnMove] = moves
      } else if (pressedKey === editorConfig.shortCuts.leftHand && moves[2] === 'X') { // select left hand
        moves[2] = 'S'
        moves = moves.join(',')
        danceChart.moves[beatOnMove] = moves
      }
    }
  }

  addHandInfo (danceChart) {
    let moveType = this.moveType
    editorConfig.beatArray.forEach((beat, index) => {
      let moveIndex = this.checkForMove(danceChart, beat)
      let move = danceChart.moves[moveIndex].split(',')
      if (moveType === 'S') {
        if (move[2] !== 'X' && move[2].length === 1) {
          move[2] = moveType + editorConfig.selectedCircles[0]
          danceChart.moves[moveIndex] = move.join(',')
        } else if (move[3] !== 'X' && move[3].length === 1) {
          move[3] = moveType + editorConfig.selectedCircles[0]
          danceChart.moves[moveIndex] = move.join(',')
        }
      } else {
        if (index === 0) {
          if (move[2] !== 'X' && move[2].length === 1) {
            move[2] = moveType + editorConfig.selectedCircles[0] + 'S'
            danceChart.moves[moveIndex] = move.join(',')
          } else if (move[3] !== 'X' && move[3].length === 1) {
            move[3] = moveType + editorConfig.selectedCircles[0] + 'S'
            danceChart.moves[moveIndex] = move.join(',')
          }
        } else if (index > 0 && index < editorConfig.beatArray.length - 1) {
          if (move[2] !== 'X' && move[2].length === 1) {
            move[2] = moveType + 'P'
            danceChart.moves[moveIndex] = move.join(',')
          } else if (move[3] !== 'X' && move[3].length === 1) {
            move[3] = moveType + 'P'
            danceChart.moves[moveIndex] = move.join(',')
          }
        } else if (index === editorConfig.beatArray.length - 1) {
          if (move[2] !== 'X' && move[2].length === 1) {
            move[2] = moveType + editorConfig.selectedCircles[1] + 'E'
            danceChart.moves[moveIndex] = move.join(',')
          } else if (move[3] !== 'X' && move[3].length === 1) {
            move[3] = moveType + editorConfig.selectedCircles[1] + 'E'
            danceChart.moves[moveIndex] = move.join(',')
          }
        }
      }
    })
  }

  isValidInsert (danceChart) {
    let isValid = false
    for (let i = 0; i < editorConfig.beatArray.length; i++) {
      let moveIndex = this.checkForMove(danceChart, editorConfig.beatArray[i])
      if (moveIndex !== -1) { // if there are moves
        let move = danceChart.moves[moveIndex]
        move = move.split(',')
        if (editorConfig.pressedKey === 'z' && move[2] !== 'X') { // for left hand
          return false
        } else if (editorConfig.pressedKey === 'x' && move[3] !== 'X') { // for right hand
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

  addRequiredMoves (danceChart, key) {
    editorConfig.beatArray.forEach((beat) => {
      this.addMovesToChart(danceChart, key, beat)
    })
  }

  updateMoves (danceChart, offsetDifference = 0) { // to use when there are any changes in timing
    let moves = danceChart.moves
    let updatedMoves = []
    moves.forEach(move => { // insert all elements again based on the bpm and offset changes based on the dance chart
      move = move.split(',')
      move[0] = parseFloat(move[0]) + Math.round((offsetDifference / (60 / danceChart.bpm)) * 4) // change each move beat so they stay in the same time according to the song
      updatedMoves.push(move.join(','))
    })
    danceChart.moves = updatedMoves // update moves on the dance chart
  }

  deleteMove (danceChart) {
    if (editorConfig.pressedKey === 'q') {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'L')
      if (handMove !== 'X') {
        this.searchAndDelete(danceChart, this.songManager.nearestBeat, handMove, 'L')
        this.removeNoInfoMoves(danceChart)
      }
    } else if (event.key === 'w') {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'R')
      if (handMove !== 'X') {
        this.searchAndDelete(this.songManager.nearestBeat, handMove, 'R')
        this.removeNoInfoMoves(danceChart)
      }
    }
  }

  searchAndDelete (danceChart, beat, handMove, hand) {
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

  removeHandInfo (danceChart, beat, hand) {
    if (hand === 'L') { // if left hand
      let moveToChange = danceChart.moves[this.checkForMoves(danceChart, beat)].split(',') // split move
      moveToChange[2] = 'X' // change the move that needs to be changed
      danceChart.moves[this.checkForMoves(danceChart, beat)] = moveToChange.join(',') // change it in the danceChart
    } else {
      let moveToChange = danceChart.moves[this.checkForMoves(danceChart, beat)].split(',') // split move
      moveToChange[3] = 'X' // change the move that needs to be changed
      danceChart.moves[this.checkForMoves(danceChart, beat)] = moveToChange.join(',') // change it in the danceChart
    }
  }

  removeNoInfoMoves (danceChart) {
    for (let i = danceChart.moves.length - 1; i >= 0; i--) {
      let move = danceChart.moves[i].split(',')
      if (move[2] === 'X' && move[3] === 'X') danceChart.moves.splice(i, 1)
    }
  }

  addBeatToArray (beat = this.songManager.nearestBeat) {
    if (!editorConfig.beatArray.includes(beat)) editorConfig.beatArray.push(beat)
  }

  // clears the array
  clearBeatArray () {
    editorConfig.beatArray = []
  }

  sortBeatArray () {
    editorConfig.beatArray.sort(function (a, b) { return a - b })
  }

  getCircleCount () {
    if (editorConfig.beatArray.length === 1) {
      return 1
    } else {
      return 2
    }
  }

  update (songManager) {
    this.songManager = songManager
  }
}
