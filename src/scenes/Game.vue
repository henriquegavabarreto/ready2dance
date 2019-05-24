<template>
  <div>
    <video id="videoStream" style="width: 100px; height: 100px; position: fixed; left: 10px; bottom: 10px;" :style="displayWebcam">
    </video>
    <v-container fluid class="pa-0">
      <v-layout row nowrap class="ma-0" style="background-color: black;">
        <v-flex v-if="gameOptions.showAnimation" xs6 id="canvas">
        </v-flex>
        <v-flex xs6 style="background-color: black;" :style="noCanvas">
          <v-container fluid class="pa-0 ma-0">
            <v-layout row wrap justify-center align-center class="pa-0 mt-5">
              <v-flex xs12 id="player" style="width: 720px;" class="mt-5"></v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer height="120" color="dark-gray">
      <h1 id="score" style="border: 2px solid white; border-radius: 5px; margin-left: 120px;" class="pl-3 pr-3">SCORE: {{displayScore}}</h1>
      <v-spacer></v-spacer>
      <ul style="list-style-type: none;">
        <li><h3>You're listening to:</h3></li>
        <li>
          <ul style="list-style-type: none; border: 2px solid white; border-radius: 5px;" class="pa-3">
            <li>{{song.title}}</li>
            <li>{{song.artist}}</li>
          </ul>
        </li>
      </ul>
      <ul style="list-style-type: none;">
        <li><h3>Status:</h3></li>
        <li>
          <ul style="columns: 2; -webkit-columns: 2; -moz-columns: 2; list-style-type: none; border: 2px solid white; border-radius: 5px;" class="pl-3 pr-3">
          <li>
            <ul>
              <li>PERFECT: {{perfect}}</li>
              <li>AWESOME: {{awesome}}</li>
              <li>GOOD: {{good}}</li>
              <li>MISS: {{miss}}</li>
              <li>COMBO: {{combo}}</li>
              <li>MAXCOMBO: {{maxCombo}}</li>
            </ul>
          </li>
          </ul>
        </li>
      </ul>
    </v-footer>
  </div>
</template>

<script>
import getUserMedia from 'getusermedia'
import playerConfig from '../tools/game/config/youtube-player'
import gameConfig from '../tools/game/config/game-config'
import grid from '../tools/game/config/grid'
import SongManager from '../tools/config/song-manager'
import CueManager from '../tools/config/cue-manager'
import detectionManager from '../tools/game/detection-manager'
import pixiConfig from '../tools/game/config/pixi-config'
import createTextures from '../tools/game/create-textures'
import addContainers from '../tools/game/add-containers'
import addGraphics from '../tools/game/add-graphics'
import * as PIXI from 'pixi.js'
import firebase from '../tools/config/firebase'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      app: null,
      containers: {},
      textures: {},
      ticker: null,
      player: null,
      songManager: null,
      moveIndex: 0,
      stream: null,
      holdingLeft: false,
      holdingRight: false,
      perfect: 0,
      awesome: 0,
      good: 0,
      miss: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      displayScore: 0,
      report: {
        rightHand: [],
        leftHand: []
      },
      promiseArray: [],
      cameraLatency: 0 // Camera latency and posenet configuration should be in $store and changeable on a menu in song selection
    }
  },
  created () {
    this.ticker = new PIXI.ticker.Ticker()
    if (this.gameOptions.showAnimation) {
      this.app = new PIXI.Application(pixiConfig)
      createTextures(this.app, this.textures, gameConfig)
      addContainers(this.app, this.containers)
      addGraphics(this.containers, this.textures)
    }
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
    if (this.gameOptions.showAnimation) {
      document.getElementById('canvas').appendChild(this.app.view)
      this.cueManager = new CueManager(this.songManager, gameConfig, grid, this.gameOptions.speed)
      this.ticker.add(() => {
        this.cueManager.drawDynamicCues(this.moves, this.textures.cues)
      })
    }
    this.cameraLatency = (this.gameOptions.latency / this.songManager.tempo) * 4 // measured in quarterBeat => should be in the $store
    this.ticker.add(() => {
      if (this.moveIndex < this.moves.length) { // index value is not higher than the array length
        if (this.moves[this.moveIndex][0] + 1 <= this.songManager.currentQuarterBeat - this.cameraLatency) { // if the beat of the current index has passed the current beat
          if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
            !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
            this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride))
            this.promiseArray.push(this.moves[this.moveIndex])
            Promise.all(this.promiseArray).then((values) => {
              let handMove = values.splice(values.length - 1, 1)[0]
              let rightHandMove = handMove[3]
              let leftHandMove = handMove[2]
              let rightHit = []
              let leftHit = []

              values.forEach((pose, i) => {
                let rightHandDetected = false
                let leftHandDetected = false
                if (leftHandMove !== 'X') {
                  if (leftHandMove[0] === 'S') { // evaluate Sharp move
                    leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                  } else if (leftHandMove[0] === 'H' && leftHandMove.length > 2) { // evaluate Hold move
                    if (leftHandMove[2] === 'S') this.holdingLeft = true // if it is the first of a hold, holding left is true
                    leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                  } else if (leftHandMove[0] === 'M' && leftHandMove.length > 2) { // evaluate Motion move
                    if (leftHandMove[2] === 'S') this.holdingLeft = true // if it is the first of a motion, holding left is true
                    leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                  }
                  if (leftHandDetected) leftHit.push(i)
                }

                if (rightHandMove !== 'X') {
                  if (rightHandMove[0] === 'S') { // evaluate Sharp move
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  } else if (rightHandMove[0] === 'H' && rightHandMove.length > 2) { // evaluate Hold move
                    if (rightHandMove[2] === 'S') this.holdingRight = true // if it is the first of a hold, holding right is true
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  } else if (rightHandMove[0] === 'M' && rightHandMove.length > 2) { // evaluate Motion move
                    if (rightHandMove[2] === 'S') this.holdingRight = true // if it is the first of a motion, holding right is true
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  }
                  if (rightHandDetected) rightHit.push(i)
                }
              })

              if (rightHit.length > 0) {
                // add track for hold and motion
                if (rightHandMove[0] === 'S') {
                  if (rightHit[0] === 0) {
                    this.perfect++
                    this.score += 1000
                  } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                    this.good++
                    this.score += 600
                  } else {
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                } else if ((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && this.holdingRight === true) { // check only if holding is true
                  if (rightHit[0] === 0) {
                    this.perfect++
                    this.score += 1000
                  } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                    this.good++
                    this.score += 600
                  } else {
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                  if ((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove[2] === 'E') this.holdingRight = false // if it is the last of the move, set back to false
                }
              } else if (rightHit.length === 0 && rightHandMove !== 'X' && !((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove.length === 2)) {
                this.miss++
                this.report.rightHand.push(handMove)
                this.combo = 0
                this.holdingRight = false
              }

              if (leftHit.length > 0) {
                // add track for hold and motion
                if (leftHandMove[0] === 'S') {
                  if (leftHit[0] === 0) {
                    this.perfect++
                    this.score += 1000
                  } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                    this.good++
                    this.score += 600
                  } else {
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                } else if ((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && this.holdingLeft === true) { // check only if holding is true
                  if (leftHit[0] === 0) {
                    this.perfect++
                    this.score += 1000
                  } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                    this.good++
                    this.score += 600
                  } else {
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                  if ((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove[2] === 'E') this.holdingLeft = false // if it is the last of the move, set back to false
                }
              } else if (leftHit.length === 0 && leftHandMove !== 'X' && !((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove.length === 2)) {
                this.miss++
                this.report.leftHand.push(handMove)
                this.combo = 0
                this.holdingLeft = false
              }
            }).catch((err) => { console.log(err) })
            this.promiseArray = []
          }

          this.moveIndex++
        }
        if (this.moveIndex < this.moves.length) {
          if (this.moves[this.moveIndex][0] <= this.songManager.currentQuarterBeat - this.cameraLatency) { // push estimate pose to promise array if it is a move with length > 2 (except Sharp)
            if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
              !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
              this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride))
            }
          }
        }
      }
      if (this.displayScore < this.score) {
        let dif = this.score - this.displayScore
        if (dif <= 10) {
          this.displayScore += 1
        } else if (dif <= 100 && dif > 10) {
          this.displayScore += 10
        } else {
          this.displayScore += 100
        }
      }
      if (this.player.getCurrentTime() <= parseFloat(this.videoStart) + 5) {
        this.player.setVolume(this.player.getVolume() + 1)
      }
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) - 2 && parseFloat(this.videoEnd) !== 0) {
        this.player.setVolume(this.player.getVolume() - 1)
      }
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) && parseFloat(this.videoEnd) !== 0) {
        this.goToResults()
      }
    })

    this.player.on('ended', () => {
      this.goToResults()
    })

    this.ticker.stop()

    this.player.on('playing', () => {
      if (parseFloat(this.videoStart) !== 0 && this.player.getCurrentTime() < 0.5) this.player.seek(parseFloat(this.videoStart))
      this.ticker.start()
    })

    this.player.on('paused', () => {
      this.ticker.stop()
    })

    this.player.setVolume(0)
    this.player.load(this.$store.state.selectedChart.videoId, false)

    getUserMedia({ video: { width: 300, height: 300 }, audio: false }, (err, stream) => {
      if (err) {
        console.log(err)
        this.stopCapture()
        this.$store.commit('somethingWentWrong')
        this.$store.commit('goToSongSelection')
      } else {
        this.stream = document.getElementById('videoStream')
        this.stream.width = 300
        this.stream.height = 300
        this.stream.srcObject = stream
        this.stream.play()
        this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride)
      }
    })
  },
  methods: {
    goToResults: function () {
      this.player.stop()
      this.player.destroy()
      if (this.gameOptions.showAnimation) {
        for (let texture in this.textures) {
          this.textures[texture].destroy()
        }
        for (let container in this.containers) {
          this.containers[container].destroy(true)
        }
        this.app.destroy()
      }
      this.ticker.stop()
      this.ticker.destroy()
      this.stopCapture()

      for (let song in this.$store.state.songs) {
        if (this.$store.state.selectedSong.videoId === this.$store.state.songs[song].videoId) {
          firebase.database.ref(`songs/${song}`).once('value').then((value) => {
            let songToCheck = value.val()
            if (!songToCheck.hasOwnProperty('scores')) { // if there are no scores for this song
              // create scores with the new difficulty
              firebase.database.ref('scores').push({
                [this.$store.state.user.username]: this.score
              }).then((scoreRef) => {
                this.$store.dispatch('updateSongScores', scoreRef.key)
                firebase.database.ref(`songs/${song}`).update({
                  scores: {
                    [this.$store.state.selectedDifficulty]: scoreRef.key
                  }
                })
              })
            } else { // if there are scores
              if (songToCheck.scores.hasOwnProperty(this.$store.state.selectedDifficulty)) { // if selected difficulty is part of the score node
                let scoreId = songToCheck.scores[this.$store.state.selectedDifficulty]
                firebase.database.ref(`scores/${scoreId}`).once('value').then((value) => {
                  let scores = value.val()
                  let hasScore = false
                  for (let score in scores) {
                    if (score.username === this.$store.state.user.username) { // user already has a score
                      hasScore = true
                      if (this.score > score[this.$store.state.user.username]) {
                        firebase.database.ref(`scores/${scoreId}`).update({
                          [this.$store.state.user.username]: this.score
                        })
                      }
                    }
                  }
                  if (!hasScore) {
                    firebase.database.ref(`scores/${scoreId}`).update({
                      [this.$store.state.user.username]: this.score
                    })
                  }
                })
              } else {
                // create new score in database and update it in the song
                firebase.database.ref('scores').push({
                  [this.$store.state.user.username]: this.score
                }).then((scoreRef) => {
                  this.$store.dispatch('updateSongScores', scoreRef.key)
                  firebase.database.ref(`songs/${song}/scores`).update({
                    [this.$store.state.selectedDifficulty]: scoreRef.key
                  })
                })
              }
            }
          })
        }
      }

      this.$store.commit('goToResults')
      this.$store.commit('changeResults', {
        perfect: this.perfect,
        awesome: this.awesome,
        good: this.good,
        miss: this.miss,
        maxCombo: this.maxCombo,
        score: this.score,
        report: this.report
      })
    },
    stopCapture: function () {
      this.stream.srcObject.getVideoTracks().forEach((track) => {
        track.stop()
      })
    }
  },
  computed: {
    moves () {
      if (this.$store.state.selectedChart.moves === '') {
        return []
      } else {
        let newChart = []
        let chart = this.$store.state.selectedChart.moves.split(' ')
        chart.forEach((move) => {
          move = move.split(',')
          move[0] = parseInt(move[0])
          move[1] = parseInt(move[1])
          newChart.push(move)
        })
        return newChart
      }
    },
    videoStart () {
      return this.$store.state.selectedChart.videoStart
    },
    videoEnd () {
      return this.$store.state.selectedChart.videoEnd
    },
    song () {
      return this.$store.state.selectedSong
    },
    gameOptions () {
      return this.$store.state.gameOptions
    },
    displayWebcam () {
      if (this.gameOptions.showWebcam === true) {
        return {}
      } else {
        return { display: 'none' }
      }
    },
    noCanvas () {
      if (this.gameOptions.showAnimation === true) {
        return {}
      } else {
        return {
          height: '640px',
          width: '100%',
          margin: '0',
          padding: '0'
        }
      }
    }
  }
}
</script>
<style scoped>
  li {
    font-size: 20px;
  }

  #score {
    font-size: 60px;
  }

  video {
    transform: scaleX(-1);
  }
</style>
