import gameConfig from './config/game-config'

export default class CueManager {
  constructor (chart, songManager, leftGraphics, rightGraphics) {
    this.songManager = songManager
    this.i = 0
    this.movesToDraw = []
    this.holdsToDraw = []
    this.moves = chart.moves.split(' ')
    this.leftGraphics = leftGraphics
    this.rightGraphics = rightGraphics
  }

  drawMoves (previousBeat) {
    let goToNext = false
    if (this.songManager.nearestBeat === this.moves[this.i][0] - gameConfig.advanceSpawn && this.songManager.nearestBeat !== previousBeat) {
      goToNext = true
    }
    if (this.songManager.nearestBeat === this.moves[this.i][0] && (this.moves[this.i][2][1] === 'H' || this.moves[this.i][3][1] === 'H')) {
      this.holdsToDraw.push(this.moves[this.i])
      goToNext = true
    }

    if (goToNext === true) this.i++
  }

  getDuration () {
    // getEndBeat (danceChart, beat, hand) { // internal - get end beat of a hold or motion
    //   let handMove = this.getHandMove(danceChart, beat, hand)
    //   if (handMove[handMove.length - 1] === 'E') {
    //     return handMove[0]
    //   } else if (handMove[handMove.length - 1] === 'S' || handMove[handMove.length - 1] === 'P') {
    //     return this.getEndBeat(danceChart, beat + 1, hand)
    //   }
    // }
  }
}
