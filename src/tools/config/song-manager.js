export default class SongManager {
  constructor (player, danceChart) {
    this.player = player
    this.danceChart = danceChart
  }

  get tempo () {
    let tempo = 60 / this.danceChart.bpm
    return tempo
  }

  get currentBeat () {
    let currentBeat = (this.player.getCurrentTime() - this.danceChart.offset) / this.tempo
    return currentBeat
  }

  get currentRoundBeat () {
    return Math.round(this.currentBeat)
  }

  get currentQuarterBeat () {
    let currentQuarterBeat = this.currentBeat * 4
    return currentQuarterBeat
  }

  get nearestBeat () {
    let nearestBeat = Math.round(this.currentQuarterBeat)
    return nearestBeat
  }

  getNearestBeatTime (t = 0) {
    let nearestBeatTime = (((this.nearestBeat + t) / 4) * this.tempo + this.danceChart.offset)
    return nearestBeatTime
  }

  getBeatTime (beat) {
    let beatTime = ((beat / 4) * this.tempo + this.danceChart.offset)
    return beatTime
  }

  update (changedDanceChart) {
    this.danceChart = changedDanceChart
  }
}
