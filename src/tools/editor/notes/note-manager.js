import { noteElements } from '../config/containers'
import editorConfig from '../config/editor-config'
import * as PIXI from 'pixi.js'

export default class NoteManager {
  constructor (songManager) {
    this.songManager = songManager
  }

  createNote (key, beat = this.songManager.getNearestBeat()) {
    let x = 22 // default x to left hand
    if (key === 'x') {
      x = 108
    }
    this.drawNote(x, beat)
  }

  drawNote (x, beat) {
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

  isOccupied (x, beat) {
    for (let notes of noteElements.children) {
      if (notes.x === x && notes.y === (56 * beat / 4) + 58) {
        return true
      }
    }
  }

  redraw (danceChart) { // use after update chart or after move deletion
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

  removeInvalidNotes (danceChart) {
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

  tintNotes (beatToTint, hand, moveType) {
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

  tint (moveType, note) {
    if (moveType === 'S') {
      note.tint = editorConfig.colors.sharp
    } else if (moveType === 'H') {
      note.tint = editorConfig.colors.hold
    } else {
      note.tint = editorConfig.colors.motion
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
}
