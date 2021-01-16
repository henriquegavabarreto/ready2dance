export default class CueManager {
  constructor (songManager, config, grid, speed = 1) {
    this.songManager = songManager
    this.movesToDraw = []
    this.holdsToDraw = []
    this.index = 0
    this.holdIndex = 0
    this.config = config
    this.grid = grid
    this.speed = speed
    this.lastBeat = 0
  }

  // this function litteraly draws the cues in the canvas
  // Helper function to be used in the functions below
  drawCue (hand, handMove, size, cues) { // draw circle cues
    if (handMove[0] === 'S' && handMove.length > 1) {
      cues.lineStyle(this.config.cue.lineWidth, this.config.colors.sharp, 1)
      cues.drawCircle(this.grid[handMove[1]].x, this.grid[handMove[1]].y, size)
    } else if (handMove[0] === 'H' && handMove[2] === 'S') {
      if (size < 80) {
        cues.lineStyle(this.config.cue.lineWidth, this.config.colors.hold, 1)
        cues.drawCircle(this.grid[handMove[1]].x, this.grid[handMove[1]].y, size)
      }
    } else if (handMove[0] === 'M' && handMove.length === 3) {
      cues.lineStyle(this.config.cue.lineWidth, this.config.colors.motion, 1)
      cues.drawCircle(this.grid[handMove[1]].x, this.grid[handMove[1]].y, size)
    }
  }

  // selects the moves that should be drawn this frame and pushes to specific array
  drawDynamicCues (moves, cues) {
    if (this.lastBeat === this.songManager.currentBeat) return

    // checks for a hold in the moves array at the current holdIndex
    if (this.holdIndex < moves.length) {
      if (this.songManager.nearestBeat >= moves[this.holdIndex][0]) {
        this.checkHoldMoves(moves, this.holdIndex)
        this.holdIndex++
      }
    }

    // check for circle cues to draw
    if (this.index < moves.length) {
      // catches exceptions when using the editor
      if (moves[this.index][0] < this.songManager.currentQuarterBeat) {
        this.index++
        this.checkNextMoves(moves, this.index)
      } else if (moves[this.index][0] >= this.songManager.currentQuarterBeat && moves[this.index][0] <= this.songManager.currentQuarterBeat + (this.config.advanceSpawn / this.speed)) {
        // start from the previous index if it is not included already and meets conditions
        if (this.index !== 0 && !this.movesToDraw.includes(moves[this.index - 1]) && moves[this.index - 1][0] >= this.songManager.currentQuarterBeat && moves[this.index - 1][0] <= this.songManager.currentQuarterBeat + (this.config.advanceSpawn / this.speed)) {
          this.checkNextMoves(moves, this.index - 1)
        } else {
          // checks current and next moves and add them to movesToDraw
          this.checkNextMoves(moves, this.index)
        }
        this.index++
      }
    }

    // if there are no cues to draw, cues should not be visible and makes no sense going any firther in this function
    if (this.movesToDraw.length === 0 && this.holdsToDraw.length === 0) {
      cues.visible = false
      this.lastBeat = this.songManager.currentBeat
      return
    } else {
      cues.visible = true
    }
    // clear only before drawing
    if (this.movesToDraw.length !== 0 || this.holdsToDraw.length !== 0) {
      cues.clear()
    }

    // removes move if the proportion is equal or bigger than one,
    // else keeps drawing the moves in the array
    if (this.movesToDraw.length > 0) {
      for (let i = this.movesToDraw.length - 1; i >= 0; i--) {
        let proportion = ((this.config.advanceSpawn / this.speed) - (this.movesToDraw[i][0] - this.songManager.currentQuarterBeat)) / (this.config.advanceSpawn / this.speed)
        // remove hold move cues a bit before it reaches proportion === 1
        if (proportion > 0.98) {
          if (this.movesToDraw[i][2][0] === 'H' || this.movesToDraw[i][3][0] === 'H') {
            this.movesToDraw.splice(1, i)
          } else {
            if (proportion > 1) this.movesToDraw.splice(i, 1)
          }
        } else {
          let leftHand = this.movesToDraw[i][2]
          let rightHand = this.movesToDraw[i][3]

          let size = this.config.cue.size * proportion
          if (rightHand !== 'X') this.drawCue('R', rightHand, size, cues)
          if (leftHand !== 'X') this.drawCue('L', leftHand, size, cues)
        }
      }
    }

    // draw all holds to draw, if any
    if (this.holdsToDraw.length > 0) {
      for (let i = this.holdsToDraw.length - 1; i >= 0; i--) {
        if (this.holdsToDraw[i][2][0] === 'H' && this.holdsToDraw[i][2].length > 2) this.drawHoldCues(this.holdsToDraw[i][0], 'L', cues, this.holdsToDraw[i][2], i)
        if (this.holdsToDraw[i]) { // avoids spliced element
          if (this.holdsToDraw[i][3][0] === 'H' && this.holdsToDraw[i][3].length > 2) this.drawHoldCues(this.holdsToDraw[i][0], 'R', cues, this.holdsToDraw[i][3], i)
        }
      }
    }
    this.lastBeat = this.songManager.currentBeat
  }

  // draw hold arcs that indicate holding time
  drawHoldCues (beat, hand, cues, handMove, i) {
    let duration = parseInt(handMove.slice(3))
    let proportion = (duration - ((beat + duration) - this.songManager.currentQuarterBeat)) / duration
    if (proportion > 1) {
      this.holdsToDraw.splice(i, 1)
    } else {
      let position = handMove[1]
      let radius = (2 * Math.PI * proportion) + (2 * Math.PI / duration) + 0.4
      cues.moveTo(this.grid[position].x + this.config.cue.size, this.grid[position].y)
      cues.lineStyle(this.config.cue.lineWidth, this.config.colors.hold, 1)
      cues.arc(this.grid[position].x, this.grid[position].y, this.config.cue.size, 0, radius)
    }
  }

  // set the current index to be checked
  // To be used in the editor when you go back and forth with the beats
  setCurrentIndex (danceChart) {
    if (danceChart.moves.length > 0) {
      let beat = this.songManager.currentQuarterBeat
      if (beat <= 0) {
        this.index = 0
        this.holdIndex = 0
        return
      }
      let beatArray = []

      danceChart.moves.forEach((move) => {
        beatArray.push(move[0])
      })

      let closest = beatArray.reduce(function (prev, curr) {
        return (Math.abs(curr - beat) < Math.abs(prev - beat) ? curr : prev)
      })

      if (closest >= beat) {
        this.index = beatArray.indexOf(closest)
        this.holdIndex = beatArray.indexOf(closest)
      } else {
        this.index = beatArray.indexOf(closest) + 1
        this.holdIndex = beatArray.indexOf(closest) + 1
      }
    } else {
      this.index = 0
      this.holdIndex = 0
    }
  }

  checkNextMoves (moves, index) {
    if (index >= 0 && index < moves.length) {
      if (moves[index][0] >= this.songManager.currentQuarterBeat && moves[index][0] <= this.songManager.currentQuarterBeat + (this.config.advanceSpawn / this.speed)) {
        if (!this.movesToDraw.includes(moves[index])) {
          this.movesToDraw.push(moves[index])
          this.checkNextMoves(moves, index + 1)
        }
      }
    }
  }

  checkHoldMoves (moves, index) {
    if (index >= 0 && index < moves.length) {
      if (moves[index][2][0] === 'H' || moves[index][3][0] === 'H') {
        if ((moves[index][2][2] === 'S' || moves[index][3][2] === 'S') && !this.holdsToDraw.includes(moves[index])) {
          this.holdsToDraw.push(moves[index])
        } else {
          this.checkHoldMoves(moves, index - 1)
        }
      }
    }
  }

  // updates the songManager according with the new songManager whan the BPM is changed
  update (songManager) {
    this.songManager = songManager
  }
}
