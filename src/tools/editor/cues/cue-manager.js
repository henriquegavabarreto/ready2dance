import grid from '../config/grid'
import editorConfig from '../config/editor-config'

export default class CueManager {
  constructor (songManager, moveManager) {
    this.songManager = songManager
    this.moveManager = moveManager
    this.movesToDraw = []
    this.holdsToDraw = []
    this.index = 0
    this.holdIndex = 0
  }

  drawCue (handMove, size, textures) {
    if (handMove[0] === 'S' && handMove.length > 1) {
      textures.cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.sharp, 1)
      textures.cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    } else if (handMove[0] === 'H' && handMove[2] === 'S') {
      if (size < 80) {
        textures.cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
        textures.cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
      }
    } else if (handMove[0] === 'M' && handMove.length === 3) {
      textures.cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.motion, 1)
      textures.cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    }
  }

  drawDynamicCues (danceChart, textures) {
    if (this.index < danceChart.moves.length) {
      textures.cues.clear()

      if (danceChart.moves[this.index][0] >= this.songManager.currentQuarterBeat && danceChart.moves[this.index][0] <= this.songManager.currentQuarterBeat + editorConfig.advanceSpawn) {
        this.movesToDraw.push(danceChart.moves[this.index])
        this.index++
      }
      if (danceChart.moves[this.holdIndex][0] === this.songManager.nearestBeat) {
        if ((danceChart.moves[this.holdIndex][2][0] === 'H' || danceChart.moves[this.holdIndex][3][0] === 'H') && (danceChart.moves[this.holdIndex][2][2] === 'S' || danceChart.moves[this.holdIndex][3][2] === 'S')) {
          this.holdsToDraw.push(danceChart.moves[this.holdIndex])
        }
        this.holdIndex++
      }

      if (this.movesToDraw.length > 0) {
        for (let i = this.movesToDraw.length - 1; i >= 0; i--) {
          let proportion = (editorConfig.advanceSpawn - (this.movesToDraw[i][0] - this.songManager.currentQuarterBeat)) / editorConfig.advanceSpawn
          if (proportion > 1) {
            this.movesToDraw.splice(1, i)
          } else {
            let leftHand = this.movesToDraw[i][2]
            let rightHand = this.movesToDraw[i][3]

            let size = editorConfig.cue.size * proportion
            if (rightHand !== 'X') this.drawCue(rightHand, size, textures)
            if (leftHand !== 'X') this.drawCue(leftHand, size, textures)
          }
        }
      }

      if (this.holdsToDraw.length > 0) {
        for (let i = this.holdsToDraw.length - 1; i >= 0; i--) {
          if (this.holdsToDraw[i][2][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'L', textures)
          if (this.holdsToDraw[i][3][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'R', textures)
        }
      }

      if (this.movesToDraw.length === 0 && this.holdsToDraw.length === 0) {
        textures.cues.visible = false
      } else {
        textures.cues.visible = true
      }
    } else if (this.index === danceChart.moves.length && (this.holdsToDraw.length > 0 || this.movesToDraw.length > 0)) {
      textures.cues.clear()
      if (this.movesToDraw.length > 0) {
        for (let i = this.movesToDraw.length - 1; i >= 0; i--) {
          let proportion = (editorConfig.advanceSpawn - (this.movesToDraw[i][0] - this.songManager.currentQuarterBeat)) / editorConfig.advanceSpawn
          if (proportion > 1) {
            this.movesToDraw.splice(1, i)
          } else {
            let leftHand = this.movesToDraw[i][2]
            let rightHand = this.movesToDraw[i][3]

            let size = editorConfig.cue.size * proportion
            if (rightHand !== 'X') this.drawCue(rightHand, size, textures)
            if (leftHand !== 'X') this.drawCue(leftHand, size, textures)
          }
        }
      }

      if (this.holdsToDraw.length > 0) {
        for (let i = this.holdsToDraw.length - 1; i >= 0; i--) {
          if (this.holdsToDraw[i][2][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'L', textures, i)
          if (this.holdsToDraw[i][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'R', textures, i)
        }
      }
    }
  }

  drawHoldCues (danceChart, beat, hand, textures, i) {
    let startBeat = this.moveManager.getStartBeat(danceChart, beat, hand)
    let endBeat = this.moveManager.getEndBeat(danceChart, beat, hand)
    let duration = (endBeat - startBeat) + 1
    let proportion = (duration - ((startBeat + duration) - this.songManager.currentQuarterBeat)) / duration
    let position = this.moveManager.getHandMove(danceChart, startBeat, hand)[1]
    let radius = (2 * Math.PI * proportion) + (2 * Math.PI / duration)
    if (radius > 0 && radius <= 2 * Math.PI) {
      textures.cues.moveTo(grid[position].x + editorConfig.cue.size, grid[position].y)
      textures.cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
      textures.cues.arc(grid[position].x, grid[position].y, editorConfig.cue.size, 0, radius)
    }
    if (proportion > 1) this.holdsToDraw.splice(1, i)
  }

  setCurrentIndex (danceChart) {
    let beat = this.songManager.nearestBeat
    let beatArray = []

    danceChart.moves.forEach((move) => {
      beatArray.push(move[0])
    })

    let closest = beatArray.reduce(function (prev, curr) {
      return (Math.abs(curr - beat) < Math.abs(prev - beat) ? curr : prev)
    })

    this.index = beatArray.indexOf(closest)
  }

  update (songManager, moveManager) {
    this.songManager = songManager
    this.moveManager = moveManager
  }
}
