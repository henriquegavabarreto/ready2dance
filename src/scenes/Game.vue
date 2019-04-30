<template>
  <div>
    <v-container>
      <video id="videoStream" style="width: 600px; height: 600px;">
      </video>
      <v-layout row wrap justify-center>
        <v-flex xs6 id="canvas">
        </v-flex>
        <v-flex xs6 id="player">
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer>
      <h1>HIT: {{hit}}</h1>
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
      rightGraphics: null,
      leftGraphics: null,
      player: null,
      songManager: null,
      previousBeat: -1,
      moveIndex: 0,
      stream: null,
      streaming: false,
      poseNetOptions: {
        scale: 0.5,
        output: 16,
        flipHorizontal: false
      },
      hit: 0,
      miss: 0,
      rightHit: false,
      leftHit: false
    }
  },
  created () {
    this.app = new PIXI.Application(pixiConfig)
    this.circleContainer = new PIXI.Container()
    this.cueContainer = new PIXI.Container()
    this.rightGraphics = new PIXI.Graphics()
    this.leftGraphics = new PIXI.Graphics()
    this.cueContainer.addChild(this.rightGraphics)
    this.cueContainer.addChild(this.leftGraphics)
    this.app.stage.addChild(this.circleContainer)
    this.app.stage.addChild(this.cueContainer)
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
    this.cueManager = new CueManager(this.$store.state.selectedChart, this.songManager, this.leftGraphics, this.rightGraphics)
    this.app.ticker.add(() => {
      if (this.moves[this.moveIndex][0] + 1 <= this.songManager.currentQuarterBeat) {
        if ((this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && (this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2)) {
          // console.log('No Check')
        } else {
          if (this.moves[this.moveIndex][2] !== 'X' || this.moves[this.moveIndex][3] !== 'X') {
            if (this.rightHit) {
              this.hit++
            } else {
              this.miss++
            }
            if (this.leftHit) {
              this.hit++
            } else {
              this.miss++
            }
          }
          this.rightHit = false
          this.leftHit = false
        }
        this.moveIndex++
      }
      if (this.moves[this.moveIndex][0] <= this.songManager.currentQuarterBeat) {
        if ((this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && (this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2)) {
          // console.log('No Check')
        } else {
          this.estimatePose(this.moves[this.moveIndex][2], this.moves[this.moveIndex][3])
        }
        this.previousBeat = this.songManager.nearestBeat
      }
    })
    document.getElementById('canvas').appendChild(this.app.view)
    setCircles(this.circleContainer)
    this.player.load(this.$store.state.selectedChart.videoId, false)
    console.log(getUserMedia())
    getUserMedia({ video: { width: 600, height: 600 }, audio: false }, (err, stream) => {
      if (err) {
        console.log(err)
        this.$store.commit('goToSongSelection')
      } else {
        console.log(stream)
        this.stream = document.getElementById('videoStream')
        this.stream.width = 600
        this.stream.height = 600
        this.stream.srcObject = stream
        this.stream.play()
        this.streaming = true
        this.$store.state.net.estimateSinglePose(this.stream, this.poseNetOptions.scale, this.poseNetOptions.flipHorizontal, this.poseNetOptions.output)
      }
    })
  },
  methods: {
    estimatePose: function (leftHand, rightHand) {
      let rightHandDetected = false
      let leftHandDetected = false

      this.$store.state.net.estimateSinglePose(this.stream, this.poseNetOptions.scale, this.poseNetOptions.flipHorizontal, this.poseNetOptions.output).then((data) => {
        console.log(data, rightHand, leftHand)
        if (leftHand !== 'X') {
          if (leftHand[0] === 'S') {
            leftHandDetected = detectionManager.detect('L', leftHand[1], data)
          } else if (leftHand[0] === 'H' && leftHand.length > 2) {
            leftHandDetected = detectionManager.detect('L', leftHand[1], data)
          } else if (leftHand[0] === 'M' && leftHand.length > 2) {
            leftHandDetected = detectionManager.detect('L', leftHand[1], data)
          }
          if (rightHandDetected) this.rightHit = true
        }

        if (rightHand !== 'X') {
          if (rightHand[0] === 'S') {
            rightHandDetected = detectionManager.detect('R', rightHand[1], data)
          } else if (rightHand[0] === 'H' && rightHand.length > 2) {
            rightHandDetected = detectionManager.detect('R', rightHand[1], data)
          } else if (rightHand[0] === 'M' && rightHand.length > 2) {
            rightHandDetected = detectionManager.detect('R', rightHand[1], data)
          }

          if (leftHandDetected) this.leftHit = true
        }
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
        console.log(newChart)
        return newChart
      }
    }
  }
}
</script>
