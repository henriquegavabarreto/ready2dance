import grid from '../config/grid'
import editorConfig from '../config/editor-config'
import { cueContainer } from '../config/containers'

export default class CueManager {
  constructor (songManager, moveManager) {
    this.songManager = songManager
    this.moveManager = moveManager
    this.graphics = cueContainer.getChildByName('cues')
  }

  drawCue (handMove, size) {
    if (handMove[0] === 'S' && handMove.length > 1) {
      this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.sharp, 1)
      this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    } else if (handMove[0] === 'H' && handMove[2] === 'S') {
      if (size < 80) {
        this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
        this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
      }
    } else if (handMove[0] === 'M' && handMove.length === 3) {
      this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.motion, 1)
      this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
    }
  }

  drawCues (danceChart) {
    this.graphics.clear()
    let movesToDraw = []
    let holdsToDraw = []
    danceChart.moves.forEach((move) => {
      move = move.split(',')
      let beat = parseInt(move[0])
      if (beat >= this.songManager.currentQuarterBeat && beat <= this.songManager.currentQuarterBeat + editorConfig.advanceSpawn) movesToDraw.push(move)
      if (beat === this.songManager.nearestBeat && (move[2][0] === 'H' || move[3][0] === 'H')) holdsToDraw.push(move)
    })
    if (movesToDraw.length > 0) {
      movesToDraw.forEach((move) => {
        let beat = parseInt(move[0])
        let leftHand = move[2]
        let rightHand = move[3]
        let proportion = (editorConfig.advanceSpawn - (beat - this.songManager.currentQuarterBeat)) / editorConfig.advanceSpawn
        let size = editorConfig.cue.size * proportion
        if (rightHand !== 'X') this.drawCue(rightHand, size)
        if (leftHand !== 'X') this.drawCue(leftHand, size)
      })
    }
    if (holdsToDraw.length > 0) {
      holdsToDraw.forEach((move) => {
        let beat = parseInt(move[0])
        if (move[2][0] === 'H') this.drawHoldCues(danceChart, beat, 'L')
        if (move[3][0] === 'H') this.drawHoldCues(danceChart, beat, 'R')
      })
    }
  }

  drawHoldCues (danceChart, beat, hand) {
    let startBeat = this.moveManager.getStartBeat(danceChart, beat, hand)
    let endBeat = this.moveManager.getEndBeat(danceChart, beat, hand)
    let duration = (endBeat - startBeat) + 1
    let proportion = (duration - ((startBeat + duration) - this.songManager.currentQuarterBeat)) / duration
    let position = this.moveManager.getHandMove(danceChart, startBeat, hand)[1]
    let radius = (2 * Math.PI * proportion) + (2 * Math.PI / duration)
    if (radius > 0 && radius <= 2 * Math.PI) {
      this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
      this.graphics.arc(grid[position].x, grid[position].y, editorConfig.cue.size, 0, radius)
    }
  }

  update (songManager, moveManager) {
    this.songManager = songManager
    this.moveManager = moveManager
  }
}
