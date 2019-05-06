<template>
  <div>
    <v-container>
      <video id="videoStream" style="width: 600px; height: 600px; display: none;">
      </video>
      <v-layout row wrap justify-center>
        <v-flex xs6 id="canvas">
        </v-flex>
        <v-flex xs6 id="player">
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer>
      <h1>PERFECT: {{perfect}}</h1>
      <h1>AWESOME: {{awesome}}</h1>
      <h1>GOOD: {{good}}</h1>
      <h1>MISS: {{miss}}</h1>
    </v-footer>
  </div>
</template>

<script>
import getUserMedia from 'getusermedia'
import playerConfig from '../tools/game/config/youtube-player'
import SongManager from '../tools/config/song-manager'
import CueManager from '../tools/game/cue-manager'
import detectionManager from '../tools/game/detection-manager'
import pixiConfig from '../tools/game/config/pixi-config'
import setCircles from '../tools/game/set-circles'
import * as PIXI from 'pixi.js'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      app: null,
      circleContainer: null,
      cueContainer: null,
      graphics: null,
      player: null,
      songManager: null,
      moveIndex: 0,
      stream: null,
      perfect: 0,
      awesome: 0,
      good: 0,
      miss: 0,
      rightHit: false,
      leftHit: false,
      promiseArray: [],
      cameraLatency: 0 // Camera latency and posenet configuration should be in $store and changeable on a menu in song selection
    }
  },
  created () {
    this.app = new PIXI.Application(pixiConfig)
    this.circleContainer = new PIXI.Container()
    this.cueContainer = new PIXI.Container()
    this.graphics = new PIXI.Graphics()
    this.cueContainer.addChild(this.graphics)
    this.app.stage.addChild(this.circleContainer)
    this.app.stage.addChild(this.cueContainer)
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
    this.cueManager = new CueManager(this.$store.state.selectedChart, this.songManager, this.leftGraphics, this.rightGraphics)
    this.cameraLatency = (0.32 / this.songManager.tempo) * 4 // measured in quarterBeat => should be a computed property
    this.app.ticker.add(() => {
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
                if (leftHandMove[0] === 'S') {
                  leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                } else if (leftHandMove[0] === 'H' && leftHandMove.length > 2) {
                  leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                } else if (leftHandMove[0] === 'M' && leftHandMove.length > 2) {
                  leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose)
                }
                if (leftHandDetected) leftHit.push(i)
              }

              if (rightHandMove !== 'X') {
                if (rightHandMove[0] === 'S') {
                  rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                } else if (rightHandMove[0] === 'H' && rightHandMove.length > 2) {
                  rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                } else if (rightHandMove[0] === 'M' && rightHandMove.length > 2) {
                  rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose)
                }
                if (rightHandDetected) rightHit.push(i)
              }
            })

            if (rightHit.length > 0) {
              if (rightHit[0] === 0) {
                this.perfect++
              } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                this.good++
              } else {
                this.awesome++
              }
            } else if (rightHit.length === 0 && rightHandMove !== 'X' && !((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove.length === 2)) {
              this.miss++
            }

            if (leftHit.length > 0) {
              if (leftHit[0] === 0) {
                this.perfect++
              } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                this.good++
              } else {
                this.awesome++
              }
            } else if (leftHit.length === 0 && leftHandMove !== 'X' && !((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove.length === 2)) {
              this.miss++
            }
          }).catch((err) => { console.log(err) })
          this.promiseArray = []
        }

        this.moveIndex++
      }
      if (this.moves[this.moveIndex][0] <= this.songManager.currentQuarterBeat - this.cameraLatency) {
        if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
          !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
          this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream))
        }
      }
    })

    // this.app.ticker.stop()

    this.player.on('playing', () => {
      this.app.ticker.start()
    })

    document.getElementById('canvas').appendChild(this.app.view)
    setCircles(this.app, this.circleContainer)
    this.player.load(this.$store.state.selectedChart.videoId, false)
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
    }
  }
}
</script>
