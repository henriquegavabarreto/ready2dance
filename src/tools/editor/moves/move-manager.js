import editorConfig from '../config/editor-config'
/*
All functions related to moves are here. I made this as a class so I could update the song manager,
however I'm not sure if it is really necessary or best practice.
*/
export default class MoveManager {
  constructor (songManager) {
    this.songManager = songManager
  }
  /* check if there is a move in a given beat
  returns -1 if there is no move
  if there is a move, returns its index in the danceChart
  */
  checkForMoves (danceChart, beat = this.songManager.nearestBeat) {
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
  // used only inside this class - return hand move of a beat
  getHandMove (danceChart, beat, hand) {
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
  /*
  returns the moveType (Sharp, Motion or Hold)
  moveType is determined by 2 things:
  1. the number of elements in the beat array
  2. the circles selected for the moves

  - if there is one element in the beat array, it can only be a Sharp Move
  - if there are more elements, but the movement starts and ends in the same place in the grid, it's a Hold Move
  - if there are more elements, and the start and the end are in diferent places in the grid, it's a Motion Move
  */
  get moveType () {
    if (editorConfig.beatArray.length === 1) {
      return 'S'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] !== editorConfig.selectedCircles[1]) {
      return 'M'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] === editorConfig.selectedCircles[1]) {
      return 'H'
    }
  }

  /*
  internal use - get start beat of a hold or motion move
  using a recursive function returns the beat when a Motion or Hold Move starts
  */
  getStartBeat (danceChart, beat, hand) {
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'S' || /\d/.test(handMove[handMove.length - 1])) {
      return beat
    } else if (handMove[handMove.length - 1] === 'E' || handMove[handMove.length - 1] === 'P') {
      return this.getStartBeat(danceChart, beat - 1, hand)
    }
  }
  /*
  internal use - get end beat of a hold or motion move
  using a recursive function returns the beat when a Motion or Hold Move ends
  */
  getEndBeat (danceChart, beat, hand) {
    let handMove = this.getHandMove(danceChart, beat, hand)
    if (handMove[handMove.length - 1] === 'E') {
      return beat
    } else if (handMove[handMove.length - 1] === 'S' || handMove[handMove.length - 1] === 'P' || /\d/.test(handMove[handMove.length - 1])) {
      return this.getEndBeat(danceChart, beat + 1, hand)
    }
  }
  /*
  call this function when the user stops the creation, this will add a 'proto-move' to the danceChart
  proto moves consists in [ beat where the move is placed, avaliation method (single or double - not implemented),
  leftHand Selected (S) or not (X), rightHand Selected (S) or not (X) ]
  The avaliation method would describe if left and right hands will be considered
  for points apart or together, but it was not implemented yet
  Left and right hand selection means for 'S' that a move information will be placed there,
  and 'X' means there is no note or move for this hand this time

  ATTENTION: If there is already a move on the beat, and the pressed button corresponds
  to a place where there is already move information, no move will be changed

  */
  addMoveToChart (danceChart, pressedKey, beat) {
    // chacks for moves in the beat
    let i = this.checkForMoves(danceChart, beat)

    // if this beat has no moves yet AKA this beat is not part of the danceChart
    if (i === -1) {
      if (editorConfig.pressedKey === 'x') {
        // S stands for selected and X for no data
        danceChart.moves.push([beat, 1, 'X', 'S'])
      } else if (editorConfig.pressedKey === 'z') {
        danceChart.moves.push([beat, 1, 'S', 'X'])
      }
    } else { // if this beat already has a move
      // select right hand if the 'x' key was pressed and the move information there is 'X'
      if (editorConfig.pressedKey === 'x' && danceChart.moves[i][3] === 'X') {
        danceChart.moves[i][3] = 'S'
        // select left hand if the 'z' key was pressed and the move information there is 'X'
      } else if (editorConfig.pressedKey === 'z' && danceChart.moves[i][2] === 'X') {
        danceChart.moves[i][2] = 'S'
      }
    }
  }

  // adds hand information to a move
  addHandInfo (danceChart) {
    let moveType = this.moveType
    /*
    This will change the "proto-moves" into real usable move information
    for each of the beats in the beat array
    */
    editorConfig.beatArray.forEach((beat, index) => {
      let i = this.checkForMoves(danceChart, beat)
      if (moveType === 'S') {
        // Check if the proto-move (length === 1) is not null ('X'), but a Selected ('S')
        if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
          // Sharp move information consists in S (Sharp) + Grid Circle Area (from 1 to 9 selected by the user in the editor)
          danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[0]
        } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
          danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[0]
        }
      } else {
        if (index === 0) {
          if (moveType === 'H') { // adds duration for hold moves
            if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
              // Hold move information consists in H (Hold) + Grid Circle Area (from 1 to 9 selected by the user in the editor) + S (to inticate it's the start) + duration of the hold
              danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[0] + 'S' + (editorConfig.beatArray[editorConfig.beatArray.length - 1] - editorConfig.beatArray[0] + 1)
            } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
              danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[0] + 'S' + (editorConfig.beatArray[editorConfig.beatArray.length - 1] - editorConfig.beatArray[0] + 1)
            }
          } else {
            if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
              // Motion move information consists in M (Motion) + Grid Circle Area (from 1 to 9 selected by the user in the editor) + S (to inticate it's the start)
              danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[0] + 'S'
            } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
              danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[0] + 'S'
            }
          }
        } else if (index > 0 && index < editorConfig.beatArray.length - 1) {
          if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
            /* If the beat is not the first or last beat on the beatArray the hold or motion is considered
            in progress, then the information will consist in H or M + P (in Progress) */
            danceChart.moves[i][2] = moveType + 'P'
          } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
            danceChart.moves[i][3] = moveType + 'P'
          }
        } else if (index === editorConfig.beatArray.length - 1) {
          if (danceChart.moves[i][2] !== 'X' && danceChart.moves[i][2].length === 1) {
            // The last beat information is H or M (move type) + Grid Circle Selected Area + E (End)
            danceChart.moves[i][2] = moveType + editorConfig.selectedCircles[1] + 'E'
          } else if (danceChart.moves[i][3] !== 'X' && danceChart.moves[i][3].length === 1) {
            danceChart.moves[i][3] = moveType + editorConfig.selectedCircles[1] + 'E'
          }
        }
      }
    })
  }

  // to be called when creation of moves stops - checks if there are notes in any of the selected positions in the beatArray
  isValidInsert (danceChart) {
    let isValid = false
    for (let i = 0; i < editorConfig.beatArray.length; i++) {
      let moveIndex = this.checkForMoves(danceChart, editorConfig.beatArray[i])
      // if there are moves in the beat
      if (moveIndex !== -1) {
        /*
        if there is already move information for the left hand in this beat when the user is inserting
        information for the left hand, this is not a valid insert
        */
        if (editorConfig.pressedKey === 'z' && danceChart.moves[moveIndex][2] !== 'X') {
          return false
          /*
          if there is already move information for the right hand in this beat when the user is inserting
          information for the right hand, this is not a valid insert
          */
        } else if (editorConfig.pressedKey === 'x' && danceChart.moves[moveIndex][3] !== 'X') {
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

  // adds proto-moves to the danceChart - to be called when isValidInsert is true
  addRequiredMoves (danceChart, key) {
    editorConfig.beatArray.forEach((beat) => {
      this.addMoveToChart(danceChart, key, beat)
    })
  }

  /*
  changeMove changes a Motion move, changing the start or end moves, or adding a node to the whole movement (thinking about detection and points)
  This way MP can get a position, and Start and End Motion Moves can have their positions changed
  - Since Motion need to have diferent start and end areas selectioned,
    they can be changed to the same position this way and stay as a Motion Move

  This function is called after the change button is pressed and the circle selection is done
  */
  changeMove (danceChart, beat, key, position) {
    // detects hand according to pressed button
    let hand = 'L'
    if (editorConfig.pressedKey === 's') hand = 'R'
    // get the hand move that will be changed
    let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, hand)
    // TODO: one more time assumes that checkForMoves will not return -1
    let i = this.checkForMoves(danceChart)
    if (hand === 'L') {
      // Adds position to in Progress move
      if (handMove.length === 2) {
        danceChart.moves[i][2] = handMove[0] + position + 'P'
      } else { // Changes position in non Progress move
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

  /*
  call when 'a' or 's' keyup (creating a node for a hold move) - This checks for the original position of the Hold Move,
  and applies it to the current beat move as a new node
  */
  setHoldNode (danceChart, key) {
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

  /*
  getCreatedMoveType returns the first character of a hand move, which determines
  the move moveType

  this function is used to see if a hold node will be set or if a circle should be
  selected for a Motion Move change
  */
  getCreatedMoveType (danceChart, key) {
    let hand = 'L'
    if (key === 's') hand = 'R'
    let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, hand)
    return handMove[0]
  }

  // to use when there are any changes in timing in the danceChart
  updateMoves (danceChart, bpm, offsetDifference) {
    let updatedMoves = []
    danceChart.moves.forEach(move => { // insert all elements again based on the bpm and offset changes based on the dance chart
      move[0] = parseInt(move[0]) + Math.round((offsetDifference / (60 / bpm)) * 4) // change each move beat so they stay in the same time according to the song
      updatedMoves.push(move)
    })
    danceChart.moves = updatedMoves // update moves on the dance chart
  }

  /*
  to be called when q (delete left hand) or w (delete right hand) keyup to delete moves
  Moves are deleted and beats with no valid movements ('X' and 'X' for left and right hands)
  are removed from the chart
  */
  deleteMove (danceChart, key, noteManager, containers) {
    if (key === 'q') {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'L')
      if (handMove !== 'X') {
        this.searchAndDelete(danceChart, this.songManager.nearestBeat, handMove, 'L', noteManager, containers)
        this.removeNoInfoMoves(danceChart)
      }
    } else {
      let handMove = this.getHandMove(danceChart, this.songManager.nearestBeat, 'R')
      if (handMove !== 'X') {
        this.searchAndDelete(danceChart, this.songManager.nearestBeat, handMove, 'R', noteManager, containers)
        this.removeNoInfoMoves(danceChart)
      }
    }
  }

  /*
  function used inside this class - search surrounding moves to delete
  Sharp Moves have their information removed, and after that, the noteManager removes the respective note
  Get Hold and Motion Moves start and end beats, loop through start to end removing move information and notes
  */
  searchAndDelete (danceChart, beat, handMove, hand, noteManager, containers) {
    if (handMove[0] === 'S') { // if sharp move
      this.removeHandInfo(danceChart, beat, hand)
      noteManager.removeNote(containers, beat, hand)
    } else if (handMove[0] === 'H' || handMove[0] === 'M') {
      let startBeat = this.getStartBeat(danceChart, beat, hand)
      let endBeat = this.getEndBeat(danceChart, beat, hand)
      for (let i = startBeat; i <= endBeat; i++) {
        this.removeHandInfo(danceChart, i, hand)
        noteManager.removeNote(containers, i, hand)
      }
    }
  }

  // internal - remove hand info when delete button keyup - Hand information will be changed to 'X'
  removeHandInfo (danceChart, beat, hand) {
    if (hand === 'L') { // if left hand
      danceChart.moves[this.checkForMoves(danceChart, beat)][2] = 'X' // change the move that needs to be changed
    } else {
      danceChart.moves[this.checkForMoves(danceChart, beat)][3] = 'X' // change the move that needs to be changed
    }
  }

  // internal - it is called to remove 'X,X' moves from the chart ('X' information for left and right hands)
  removeNoInfoMoves (danceChart) {
    for (let i = danceChart.moves.length - 1; i >= 0; i--) {
      if (danceChart.moves[i][2] === 'X' && danceChart.moves[i][3] === 'X') danceChart.moves.splice(i, 1)
    }
  }

  // add beats to the beatArray when creating notes
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

  // sort beatArray in ascending order
  sortBeatArray () {
    editorConfig.beatArray.sort(function (a, b) { return a - b })
  }

  /*
  sets editorConfig.circleCount to 1 or 2 depending on the length of the beatArray
  if the beat array has one element, just one position will need to be selected, otherwise
  2 must be selected
  */
  setCircleCount () {
    if (editorConfig.beatArray.length === 1) {
      editorConfig.circleCount = 1
    } else {
      editorConfig.circleCount = 2
    }
  }

  // to update songManager when needed
  update (songManager) {
    this.songManager = songManager
  }
}
