<template>
  <div>
    <v-container fluid class="pa-0">
      <video id="videoStream" style="width: 600px; height: 600px; display: none;">
      </video>
      <v-layout row nowrap class="ma-0" style="background-color: black;">
        <v-flex xs6 id="canvas">
        </v-flex>
        <v-flex xs6 style="background-color: black;">
          <v-container fluid class="pa-0 ma-0">
            <v-layout row wrap justify-center align-center class="pa-0 ma-0">
              <v-flex xs12 id="player" style="width:720px;"></v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer height="120" color="blue">
      <ul style="list-style-type: none;">
        <li>PERFECT: {{perfect}}</li>
        <li>AWESOME: {{awesome}}</li>
        <li>GOOD: {{good}}</li>
        <li>MISS: {{miss}}</li>
        <li>COMBO: {{combo}}</li>
        <li>MAXCOMBO: {{maxCombo}}</li>
        <li>SCORE: {{score}}</li>
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
      perfect: 0,
      awesome: 0,
      good: 0,
      miss: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      report: {
        rightHand: [],
        leftHand: []
      },
      promiseArray: [],
      cameraLatency: 0 // Camera latency and posenet configuration should be in $store and changeable on a menu in song selection
    }
  },
  created () {
    this.app = new PIXI.Application(pixiConfig)
    this.ticker = new PIXI.ticker.Ticker()
    createTextures(this.app, this.textures, gameConfig)
    addContainers(this.app, this.containers)
    addGraphics(this.containers, this.textures)
  },
  mounted () {
    document.getElementById('canvas').appendChild(this.app.view)
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
    this.cueManager = new CueManager(this.songManager, gameConfig, grid)
    this.cameraLatency = (0.32 / this.songManager.tempo) * 4 // measured in quarterBeat => should be in the $store
    this.ticker.add(() => {
      this.cueManager.drawDynamicCues(this.moves, this.textures.cues)
      if (this.moveIndex < this.moves.length) {
        if (this.moves[this.moveIndex][0] + 1 <= this.songManager.currentQuarterBeat - this.cameraLatency) {
          if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
            !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
            this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream))
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
                    leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                  } else if (leftHandMove[0] === 'M' && leftHandMove.length > 2) { // evaluate Motion move
                    leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                  }
                  if (leftHandDetected) leftHit.push(i)
                }

                if (rightHandMove !== 'X') {
                  if (rightHandMove[0] === 'S') { // evaluate Sharp move
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  } else if (rightHandMove[0] === 'H' && rightHandMove.length > 2) { // evaluate Hold move
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  } else if (rightHandMove[0] === 'M' && rightHandMove.length > 2) { // evaluate Motion move
                    rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                  }
                  if (rightHandDetected) rightHit.push(i)
                }
              })

              if (rightHit.length > 0) {
                if (rightHit[0] === 0) {
                  this.perfect++
                  this.score += 500
                } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                  this.good++
                  this.score += 300
                } else {
                  this.awesome++
                  this.score += 400
                }
                this.combo++
                if (this.combo > this.maxCombo) this.maxCombo = this.combo
              } else if (rightHit.length === 0 && rightHandMove !== 'X' && !((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove.length === 2)) {
                this.miss++
                this.report.rightHand.push(handMove)
                this.combo = 0
              }

              if (leftHit.length > 0) {
                if (leftHit[0] === 0) {
                  this.perfect++
                  this.score += 500
                } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                  this.good++
                  this.score += 300
                } else {
                  this.awesome++
                  this.score += 400
                }
                this.combo++
                if (this.combo > this.maxCombo) this.maxCombo = this.combo
              } else if (leftHit.length === 0 && leftHandMove !== 'X' && !((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove.length === 2)) {
                this.miss++
                this.report.leftHand.push(handMove)
                this.combo = 0
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
              this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream))
            }
          }
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

    // this.player.on('unstarted', () => {
    //   this.player.seek(parseFloat(this.videoStart))
    // })

    getUserMedia({ video: { width: 600, height: 600 }, audio: false }, (err, stream) => {
      if (err) {
        console.log(err)
        this.$store.commit('goToSongSelection')
        // add a something went wrong snackbar at song selection if an error occurs
      } else {
        this.stream = document.getElementById('videoStream')
        this.stream.width = 600
        this.stream.height = 600
        this.stream.srcObject = stream
        this.stream.play()
        this.$store.state.net.estimateSinglePose(this.stream)
      }
    })
  },
  methods: {
    goToResults: function () {
      this.player.stop()
      this.player.destroy()
      for (let texture in this.textures) {
        this.textures[texture].destroy()
      }
      for (let container in this.containers) {
        this.containers[container].destroy(true)
      }
      this.ticker.stop()
      this.ticker.destroy()
      this.app.destroy()
      this.stopCapture()
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
    }
  }
}
</script>
