export default class SongManager {
  constructor (player, danceChart) {
    this.player = player
    this.danceChart = danceChart
  }

  // calculate tempo according to the BPM set on the danceChart
  get tempo () {
    let tempo = 60 / this.danceChart.bpm
    return tempo
  }

  // get current beat of the video depending on set BPM and offset of the danceChart
  get currentBeat () {
    let currentBeat = (this.player.getCurrentTime() - this.danceChart.offset) / this.tempo
    return currentBeat
  }

  // returns the round current beat
  get currentRoundBeat () {
    return Math.round(this.currentBeat)
  }

  // returns the current quarter beat
  get currentQuarterBeat () {
    let currentQuarterBeat = this.currentBeat * 4
    return currentQuarterBeat
  }

  // returns the round current quarter beat aka. nearest beat in the moment
  get nearestBeat () {
    let nearestBeat = Math.round(this.currentQuarterBeat)
    return nearestBeat
  }

  // returns video time of a given quarter beat
  getNearestBeatTime (t = 0) {
    let nearestBeatTime = (((this.nearestBeat + t) / 4) * this.tempo) + this.danceChart.offset
    return nearestBeatTime
  }

  // returns video time of a particular beat
  getBeatTime (beat) {
    let beatTime = ((beat / 4) * this.tempo + this.danceChart.offset)
    return beatTime
  }

  // to update danceChart whenever it is changed
  update (changedDanceChart) {
    this.danceChart = changedDanceChart
  }
}
