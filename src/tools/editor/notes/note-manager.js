import editorConfig from '../config/editor-config'
import * as PIXI from 'pixi.js'

/*
All functions related to drawing, deleting, tinting notes are here
Notes are the visual representation of moves - they are shown on the PIXI canvas as rectangles
*/
export default class NoteManager {
  constructor (songManager) {
    this.songManager = songManager
  }

  /*
  draws notes to selected beat when creating moves dynamically
  if beats are selected, instead of quarter beats, the gaps are filled

  The beat array and this function can be used to accomplish that
  notes are not tinted at this point
  */
  createNotes (key, containers, textures, beat = this.songManager.nearestBeat, modifier = 1) { // call to create notes
    let x = 22 // default x to left hand
    if (key === 'x') {
      x = 108
    }

    if (modifier === 1 || modifier === -1) {
      this.drawNote(x, beat, containers, textures)
    } else if (modifier === 4) {
      for (let i = 0; i <= 3; i++) { // adds notes in between
        let beatToAdd = beat - i
        this.drawNote(x, beatToAdd, containers, textures)
      }
    } else if (modifier === -4) {
      for (let i = 0; i <= 3; i++) {
        let beatToAdd = beat + i
        this.drawNote(x, beatToAdd, containers, textures)
      }
    }
  }

  /*
  internal use - actually draws the note sprite in the container
  all notes are named with beat + hand (L for left, and R for right)
  notes are not tinted at this point
  */
  drawNote (x, beat, containers, textures) {
    if (!this.isOccupied(x, beat, containers)) {
      // eslint-disable-next-line
      let note = new PIXI.Sprite(textures.note)
      note.x = x
      note.y = (56 * beat / 4) + 58
      note.scale.x = 0.9
      if (x === 22) {
        note.name = `${beat}L`
      } else {
        note.name = `${beat}R`
      }
      containers.auxiliary.noteElements.addChild(note)
    }
  }

  // checks for note in a beat
  isOccupied (x, beat, containers) {
    for (let notes of containers.auxiliary.noteElements.children) {
      if (notes.x === x && notes.y === (56 * beat / 4) + 58) {
        return true
      }
    }
  }

  /*
  remove specific note with a given name (beat + hand)
  - destroy sprite and remove note from container
  */
  removeNote (containers, beat, hand) {
    let note = containers.auxiliary.noteElements.getChildByName(`${beat}${hand}`)
    note.destroy()
    containers.auxiliary.noteElements.removeChild(note)
  }

  /*
  Used when pasting moves to create new notes
  sprites are created, tinted and added to the container
  */
  addNote (beat, hand, move, containers, textures) {
    let note = new PIXI.Sprite(textures.note)
    let x = 22
    if (hand === 'R') x = 108
    note.x = x
    note.y = (56 * beat / 4) + 58
    note.scale.x = 0.9
    if (x === 22) {
      note.name = `${beat}L`
    } else {
      note.name = `${beat}R`
    }
    this.tint(move[0], note)
    containers.auxiliary.noteElements.addChild(note)
  }

  /*
  call after update chart or after a move delete
  removes all the notes drawn and draw them again based on the danceChart new information
  */
  redraw (danceChart, containers, textures) {
    if (containers.auxiliary.noteElements.children.length > 0) containers.auxiliary.noteElements.removeChildren()
    danceChart.moves.forEach(move => { // insert all elements again
      if (move[2] !== 'X') {
        this.drawNote(22, move[0], containers, textures)
        this.tintNotes(containers, danceChart, move[0], 'L', move[2][0])
      }
      if (move[3] !== 'X') {
        this.drawNote(108, move[0], containers, textures)
        this.tintNotes(containers, danceChart, move[0], 'R', move[3][0])
      }
    })
  }

  /*
  call if a insertion is not valid (see isValidInsert in MoveManager)
  All created/drawn notes are removed before tinting, because it conflicts with
  another note already created
  Notes are only valid if there is information for them in the danceChart, otherwise
  there would be no way to tint them, for example
  */
  removeInvalidNotes (danceChart, containers) {
    let invalidNotes = []
    // goes through all beats in the beat array
    editorConfig.beatArray.forEach((beat) => {
      let i = this.checkForMove(danceChart, beat)
      if (i !== -1) { // if there are moves for this beat
        // if no proto move with relevant information is part of the danceChart for this beat, this note is not valid
        if (editorConfig.pressedKey === 'z' && danceChart.moves[i][2] === 'X') {
          invalidNotes.push(beat)
        } else if (editorConfig.pressedKey === 'x' && danceChart.moves[i][3] === 'X') {
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
        let noteToRemove = containers.auxiliary.noteElements.getChildByName(`${beat}${selectedHand}`)
        noteToRemove.destroy()
        containers.auxiliary.noteElements.removeChild(noteToRemove)
      })
    }
  }

  // Check for move in a given beat - returns -1 for no move or the index of the move when it's part of the danceChart
  checkForMove (danceChart, beat = this.songManager.nearestBeat) {
    if (danceChart.moves.length === 0) {
      return -1
    } else {
      for (let i = 0; i < danceChart.moves.length; i++) {
        if (danceChart.moves[i][0] === beat) {
          return i
        } else if (i === danceChart.moves.length - 1) {
          return -1
        }
      }
    }
  }

  // tint a specific note or all notes from the beat array according to moveType (call after the information is added to chart)
  tintNotes (containers, danceChart, beatToTint, hand, moveType) {
    if (!beatToTint && !hand && !moveType) {
      hand = 'L'
      if (editorConfig.pressedKey === 'x') hand = 'R'
      moveType = this.moveType
      editorConfig.beatArray.forEach((beat) => {
        let noteName = `${beat}${hand}`
        let note = containers.auxiliary.noteElements.getChildByName(noteName)
        let progress = this.getProgress(danceChart, beat, hand)
        this.tint(moveType, note, progress)
      })
    } else {
      let noteName = `${beatToTint}${hand}`
      let note = containers.auxiliary.noteElements.getChildByName(noteName)
      let progress = this.getProgress(danceChart, beatToTint, hand)
      this.tint(moveType, note, progress)
    }
  }

  // internal - actually tints the note Sprite
  tint (moveType, note, progress) {
    if (moveType === 'S') {
      note.tint = editorConfig.colors.sharp
    } else if (moveType === 'H') {
      if (progress) {
        note.tint = editorConfig.colors.holdProgress
      } else {
        note.tint = editorConfig.colors.hold
      }
    } else {
      if (progress) {
        note.tint = editorConfig.colors.motionProgress
      } else {
        note.tint = editorConfig.colors.motion
      }
    }
  }

  // returns moveType of a creating move
  get moveType () {
    if (editorConfig.beatArray.length === 1) {
      return 'S'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] !== editorConfig.selectedCircles[1]) {
      return 'M'
    } else if (editorConfig.beatArray.length > 1 && editorConfig.selectedCircles[0] === editorConfig.selectedCircles[1]) {
      return 'H'
    }
  }

  getProgress (danceChart, beat, hand) {
    for (let move of danceChart.moves) {
      if (move[0] === beat) {
        if (hand === 'R') {
          if (move[3][1] === 'P') {
            return true
          } else {
            return false
          }
        } else {
          if (move[2][1] === 'P') {
            return true
          } else {
            return false
          }
        }
      }
    }
  }

  // updates songManager when necessary
  update (songManager) {
    this.songManager = songManager
  }
}
