// import grid from '../config/grid'
// import editorConfig from '../config/editor-config'

export default class CueManager {
  constructor (songManager, moveManager) {
    this.songManager = songManager
    this.moveManager = moveManager
    // this.graphics = cueContainer.getChildByName('cues')
    this.movesToDraw = []
    this.holdsToDraw = []
    this.index = 0
  }

  // drawCue (handMove, size) {
  //   if (handMove[0] === 'S' && handMove.length > 1) {
  //     this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.sharp, 1)
  //     this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
  //   } else if (handMove[0] === 'H' && handMove[2] === 'S') {
  //     if (size < 80) {
  //       this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
  //       this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
  //     }
  //   } else if (handMove[0] === 'M' && handMove.length === 3) {
  //     this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.motion, 1)
  //     this.graphics.drawCircle(grid[handMove[1]].x, grid[handMove[1]].y, size)
  //   }
  // }

  // drawDynamicCues (danceChart) {
  //   this.graphics.clear()
  //
  //   let moveCount = this.movesToDraw.length + this.holdsToDraw.length
  //   if (danceChart.moves[this.index][0] >= this.songManager.currentQuarterBeat && danceChart.moves[this.index][0] <= this.songManager.currentQuarterBeat + editorConfig.advanceSpawn) this.movesToDraw.push(danceChart.moves[this.index])
  //   if (danceChart.moves[this.index][0] === this.songManager.nearestBeat && ((danceChart.moves[this.index][2][0] === 'H' || danceChart.moves[this.index][3][0] === 'H') && (danceChart.moves[this.index][2][2] === 'S' || danceChart.moves[this.index][3][2] === 'S'))) this.holdsToDraw.push(danceChart.moves[this.index])
  //
  //   if (this.movesToDraw.length + this.holdsToDraw.length > moveCount) this.index++
  //
  //   if (this.movesToDraw.length > 0) {
  //     for (let i = this.movesToDraw.length - 1; i >= 0; i--) {
  //       let proportion = (editorConfig.advanceSpawn - (this.movesToDraw[i][0] - this.songManager.currentQuarterBeat)) / editorConfig.advanceSpawn
  //       if (proportion > 1) {
  //         this.movesToDraw.splice(1, i)
  //       } else {
  //         let leftHand = this.movesToDraw[i][2]
  //         let rightHand = this.movesToDraw[i][3]
  //
  //         let size = editorConfig.cue.size * proportion
  //         if (rightHand !== 'X') this.drawCue(rightHand, size)
  //         if (leftHand !== 'X') this.drawCue(leftHand, size)
  //       }
  //     }
  //   }
  //
  //   if (this.holdsToDraw.length > 0) {
  //     for (let i = this.holdsToDraw.length - 1; i >= 0; i--) {
  //       if (move[2][0] === 'H') this.drawHoldCues(danceChart, move[0], 'L')
  //       if (move[3][0] === 'H') this.drawHoldCues(danceChart, move[0], 'R')
  //     }
  //   }
  //
  //   if (this.movesToDraw.length === 0 && this.holdsToDraw.length === 0) {
  //     this.graphics.visible = false
  //   } else {
  //     this.graphics.visible = true
  //   }
  // }
  //
  // drawStaticCues () {
  //
  // }

  // drawCues (danceChart) {
  //   this.graphics.clear()
  //   let movesToDraw = []
  //   let holdsToDraw = []
  //   danceChart.moves.forEach((move) => {
  //     if (move[0] >= this.songManager.currentQuarterBeat && move[0] <= this.songManager.currentQuarterBeat + editorConfig.advanceSpawn) movesToDraw.push(move)
  //     if (move[0] === this.songManager.nearestBeat && (move[2][0] === 'H' || move[3][0] === 'H')) holdsToDraw.push(move)
  //   })
  //   if (movesToDraw.length > 0) {
  //     movesToDraw.forEach((move) => {
  //       let leftHand = move[2]
  //       let rightHand = move[3]
  //       let proportion = (editorConfig.advanceSpawn - (move[0] - this.songManager.currentQuarterBeat)) / editorConfig.advanceSpawn
  //       let size = editorConfig.cue.size * proportion
  //       if (rightHand !== 'X') this.drawCue(rightHand, size)
  //       if (leftHand !== 'X') this.drawCue(leftHand, size)
  //     })
  //   }
  //   if (holdsToDraw.length > 0) {
  //     holdsToDraw.forEach((move) => {
  //       if (move[2][0] === 'H') this.drawHoldCues(danceChart, move[0], 'L')
  //       if (move[3][0] === 'H') this.drawHoldCues(danceChart, move[0], 'R')
  //     })
  //   }
  //   if (movesToDraw.length === 0 && holdsToDraw.length === 0) {
  //     this.graphics.visible = false
  //   } else {
  //     this.graphics.visible = true
  //   }
  // }
  //
  // drawHoldCues (danceChart, beat, hand) {
  //   let startBeat = this.moveManager.getStartBeat(danceChart, beat, hand)
  //   let endBeat = this.moveManager.getEndBeat(danceChart, beat, hand)
  //   let duration = (endBeat - startBeat) + 1
  //   let proportion = (duration - ((startBeat + duration) - this.songManager.currentQuarterBeat)) / duration
  //   let position = this.moveManager.getHandMove(danceChart, startBeat, hand)[1]
  //   let radius = (2 * Math.PI * proportion) + (2 * Math.PI / duration)
  //   if (radius > 0 && radius <= 2 * Math.PI) {
  //     this.graphics.moveTo(grid[position].x + editorConfig.cue.size, grid[position].y)
  //     this.graphics.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.hold, 1)
  //     this.graphics.arc(grid[position].x, grid[position].y, editorConfig.cue.size, 0, radius)
  //   }
  // }

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
