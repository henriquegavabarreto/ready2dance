import { noteElements } from '../config/containers'
import editorConfig from '../config/editor-config'
import * as PIXI from 'pixi.js'

export default class NoteManager {
  constructor (songManager) {
    this.songManager = songManager
  }

  createNotes (key, beat = this.songManager.nearestBeat, modifier = 1) { // call to create notes
    let x = 22 // default x to left hand
    if (key === 'x') {
      x = 108
    }

    if (modifier === 1 || modifier === -1) {
      this.drawNote(x, beat)
    } else if (modifier === 4) {
      for (let i = 0; i <= 3; i++) { // adds notes in between
        let beatToAdd = beat - i
        this.drawNote(x, beatToAdd)
      }
    } else if (modifier === -4) {
      for (let i = 0; i <= 3; i++) {
        let beatToAdd = beat + i
        this.drawNote(x, beatToAdd)
      }
    }
  }

  drawNote (x, beat) { // internal use - actually draws the note in the container
    if (!this.isOccupied(x, beat)) {
      // eslint-disable-next-line
      let note = new PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/move.png')
      note.x = x
      note.y = (56 * beat / 4) + 58
      note.scale.x = 0.9
      if (x === 22) {
        note.name = `${beat}L`
      } else {
        note.name = `${beat}R`
      }
      noteElements.addChild(note)
    }
  }

  isOccupied (x, beat) { // checks for note in a beat
    for (let notes of noteElements.children) {
      if (notes.x === x && notes.y === (56 * beat / 4) + 58) {
        return true
      }
    }
  }

  redraw (danceChart) { // call after update chart or after move deletion
    noteElements.removeChildren() // remove all notes
    let moves = danceChart.moves
    moves.forEach(move => { // insert all elements again
      move = move.split(',')
      if (move[2] !== 'X') {
        this.drawNote(22, move[0])
        this.tintNotes(move[0], 'L', move[2][0])
      }
      if (move[3] !== 'X') {
        this.drawNote(108, move[0])
        this.tintNotes(move[0], 'R', move[3][0])
      }
    })
  }

  removeInvalidNotes (danceChart) { // call if a insertion is not valid (see isValidInsert in MoveManager)
    let invalidNotes = []
    editorConfig.beatArray.forEach((beat) => {
      let moveIndex = this.checkForMove(danceChart, beat)
      if (moveIndex !== -1) { // if there are moves
        let move = danceChart.moves[moveIndex]
        move = move.split(',')
        if (editorConfig.pressedKey === 'z' && move[2] === 'X') {
          invalidNotes.push(beat)
        } else if (editorConfig.pressedKey === 'x' && move[3] === 'X') {
          invalidNotes.push(beat)
        }
      } else { // if no moves
        invalidNotes.push(beat)
      }
    })
    if (invalidNotes.length > 0) {
      invalidNotes.forEach((beat) => {
        let selectedHand = 'L'
        if (editorConfig.pressedKey === 'x') selectedHand = 'R'
        let noteToRemove = noteElements.getChildByName(`${beat}${selectedHand}`)
        noteElements.removeChild(noteToRemove)
      })
    }
  }

  checkForMove (danceChart, beat = this.songManager.nearestBeat) { // check for move in a beat
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

  tintNotes (beatToTint, hand, moveType) { // tint a specific note or all notes from the beat array (call after the information is added to chart)
    if (!beatToTint && !hand && !moveType) {
      hand = 'L'
      if (editorConfig.pressedKey === 'x') hand = 'R'
      moveType = this.moveType
      editorConfig.beatArray.forEach((beat) => {
        let noteName = `${beat}${hand}`
        let note = noteElements.getChildByName(noteName)
        this.tint(moveType, note)
      })
    } else {
      let noteName = `${beatToTint}${hand}`
      let note = noteElements.getChildByName(noteName)
      this.tint(moveType, note)
    }
  }

  tint (moveType, note) { // internal - actually tints the note
    if (moveType === 'S') {
      note.tint = editorConfig.colors.sharp
    } else if (moveType === 'H') {
      note.tint = editorConfig.colors.hold
    } else {
      note.tint = editorConfig.colors.motion
    }
  }

  get moveType () { // returns moveType
    if (editorConfig.beatArray.length === 1) {
      return 'S'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] !== editorConfig.selectedCircles[1]) {
      return 'M'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] === editorConfig.selectedCircles[1]) {
      return 'H'
    }
  }
}
