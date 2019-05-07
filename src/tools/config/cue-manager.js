import grid from '../editor/config/grid'
import editorConfig from '../editor/config/editor-config'

export default class CueManager {
  constructor (songManager) {
    this.songManager = songManager
    this.movesToDraw = []
    this.holdsToDraw = []
    this.index = 0
    this.holdIndex = 0
  }

  drawCue (handMove, size, cues) {
    if (handMove[0] === 'S' && handMove.length > 1) {
      cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.sharp, 1)
      cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    } else if (handMove[0] === 'H' && handMove[2] === 'S') {
      if (size < 80) {
        cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
        cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
      }
    } else if (handMove[0] === 'M' && handMove.length === 3) {
      cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.motion, 1)
      cues.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    }
  }

  drawDynamicCues (danceChart, cues) {
    cues.clear()

    if (this.holdIndex < danceChart.moves.length) {
      if (danceChart.moves[this.holdIndex][0] === this.songManager.nearestBeat) {
        if ((danceChart.moves[this.holdIndex][2][0] === 'H' || danceChart.moves[this.holdIndex][3][0] === 'H') && (danceChart.moves[this.holdIndex][2][2] === 'S' || danceChart.moves[this.holdIndex][3][2] === 'S')) {
          this.holdsToDraw.push(danceChart.moves[this.holdIndex])
        }
        this.holdIndex++
      }
    }

    if (this.index < danceChart.moves.length) {
      if (danceChart.moves[this.index][0] >= this.songManager.currentQuarterBeat && danceChart.moves[this.index][0] <= this.songManager.currentQuarterBeat + editorConfig.advanceSpawn) {
        this.movesToDraw.push(danceChart.moves[this.index])
        this.index++
      }
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
          if (rightHand !== 'X') this.drawCue(rightHand, size, cues)
          if (leftHand !== 'X') this.drawCue(leftHand, size, cues)
        }
      }
    }

    if (this.holdsToDraw.length > 0) {
      for (let i = this.holdsToDraw.length - 1; i >= 0; i--) {
        if (this.holdsToDraw[i][2][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'L', cues, this.holdsToDraw[i][2], i)
        if (this.holdsToDraw[i][3][0] === 'H') this.drawHoldCues(danceChart, this.holdsToDraw[i][0], 'R', cues, this.holdsToDraw[i][3], i)
      }
    }

    if (this.movesToDraw.length === 0 && this.holdsToDraw.length === 0) {
      cues.visible = false
    } else {
      cues.visible = true
    }
  }

  drawHoldCues (danceChart, beat, hand, cues, handMove, i) {
    let duration = parseInt(handMove.slice(3))
    let proportion = (duration - ((beat + duration) - this.songManager.currentQuarterBeat)) / duration
    if (proportion > 1) {
      this.holdsToDraw.splice(1, i)
    } else {
      let position = handMove[1]
      let radius = (2 * Math.PI * proportion) + (2 * Math.PI / duration) + 0.4
      cues.moveTo(grid[position].x + editorConfig.cue.size, grid[position].y)
      cues.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
      cues.arc(grid[position].x, grid[position].y, editorConfig.cue.size, 0, radius)
    }
  }

  setCurrentIndex (danceChart) {
    if (danceChart.moves.length > 0) {
      let beat = this.songManager.nearestBeat
      let beatArray = []

      danceChart.moves.forEach((move) => {
        beatArray.push(move[0])
      })

      let closest = beatArray.reduce(function (prev, curr) {
        return (Math.abs(curr - beat) < Math.abs(prev - beat) ? curr : prev)
      })

      this.index = beatArray.indexOf(closest)
      this.holdIndex = beatArray.indexOf(closest)
    } else {
      this.index = 0
      this.holdIndex = 0
    }
  }

  update (songManager) {
    this.songManager = songManager
  }
}
