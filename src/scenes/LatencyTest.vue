<template>
  <div @keyup.esc="backToSelection" tabindex="0" style="height: 100vh;" class="black">
    <v-container fluid class="pa-0">
      <v-layout row wrap class="black" justify-center align-center style="height: 100vh;">
        <v-flex md12 lg6 order-xs3 order-md3 order-lg1 class="text-xs-center">
          <v-layout row wrap style="position: relative;">
            <v-flex xs12 id="canvas" class="black">
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex id="player" class="md12 lg6 order-xs1 order-md1 order-lg2 text-xs-center" style="width: 100%;"></v-flex>
        <v-flex xs12 order-xs2 order-md2 order-lg3 class="white--text">
          <v-layout row wrap justify-center align-center class="pr-2">
            <v-flex shrink :style="displayWebcam" class="pl-2">
              <video id="videoStream" style="width: 10vh; height: 10vh; border: 2px solid white;">
              </video>
            </v-flex>
            <v-flex grow>
              <p class="headline pa-3">Follow the rhythm and hit the circles making a <a target="_blank" href="https://youtu.be/27zEh530vOo?t=46">bye bye</a>. The latency will be set automatically at the end.</p>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import playerConfig from '../tools/game/config/youtube-player'
import gameConfig from '../tools/game/config/game-config'
import grid from '../tools/game/config/grid'
import SongManager from '../tools/config/song-manager'
import CueManager from '../tools/config/cue-manager'
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
      promiseArray: [],
      timeStamps: {},
      latencies: []
    }
  },
  created () {
    this.ticker = new PIXI.ticker.Ticker()
    this.app = new PIXI.Application(pixiConfig)
    createTextures(this.app, this.textures, gameConfig)
    addContainers(this.app, this.containers)
    addGraphics(this.containers, this.textures)
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
    document.getElementById('canvas').appendChild(this.app.view)
    this.cueManager = new CueManager(this.songManager, gameConfig, grid, this.gameOptions.speed)
    this.ticker.add(() => {
      this.cueManager.drawDynamicCues(this.moves, this.textures.cues)
    })
    window.addEventListener('resize', this.resizeWindow())
    this.resize()
    this.ticker.add(() => {
      if (this.moveIndex < this.moves.length) { // index value is not higher than the array length
        if (this.moves[this.moveIndex][0] + 6 <= this.songManager.currentQuarterBeat) { // if the beat of the current index has passed the current beat + 6
          this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride))
          this.promiseArray.push(this.moves[this.moveIndex])
          Promise.all(this.promiseArray).then((values) => {
            let handMove = values.splice(values.length - 1, 1)[0]
            let rightHandMove = handMove[3]
            let leftHandMove = handMove[2]

            if (leftHandMove[0] === 'S') {
              // this array stores every left hand x position of all positions captured
              let leftHandX = []
              values.forEach(pose => {
                leftHandX.push(pose.keypoints[9].position.x)
              })
              // get index of greatest x
              let highestLeft = leftHandX.indexOf(Math.max(...leftHandX))
              // define difference between first timestamp (beat) and the one of when the x was the greatest (which is believed to be the movement for this beat)
              let latency = this.timeStamps[handMove[0]][highestLeft] - this.timeStamps[handMove[0]][0]
              // only push to latencies if it is a number
              if (typeof latency === 'number') this.latencies.push(latency)
            }

            if (rightHandMove[0] === 'S') {
              // this array stores every right hand x position of all positions captured
              let rightHandX = []
              values.forEach(pose => {
                rightHandX.push(pose.keypoints[10].position.x)
              })
              // get index of least x
              let highestRight = rightHandX.indexOf(Math.min(...rightHandX))
              // define difference between first timestamp (beat) and the one of when the x was the least (which is believed to be the movement for this beat)
              let latency = this.timeStamps[handMove[0]][highestRight] - this.timeStamps[handMove[0]][0]
              // only push to latencies if it is a number
              if (typeof latency === 'number' && !isNaN(latency)) this.latencies.push(latency)
            }
          }).catch((err) => { console.log(err) })
          this.promiseArray = []
          this.moveIndex++
        }
        if (this.moveIndex < this.moves.length) {
          if (this.moves[this.moveIndex][0] <= this.songManager.currentQuarterBeat) { // push estimate pose to promise array if there is a move for this beat - this will be checked until beat + 6
            this.promiseArray.push(this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride))
            this.timeStamps[this.moves[this.moveIndex][0]].push(this.player.getCurrentTime())
          }
        }
      }
      // fade in
      if (this.player.getCurrentTime() <= parseFloat(this.videoStart) + 5) {
        this.player.setVolume(this.player.getVolume() + 1)
      }
      // fade out
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) - 2 && parseFloat(this.videoEnd) !== 0) {
        this.player.setVolume(this.player.getVolume() - 1)
      }
      // end test
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) && parseFloat(this.videoEnd) !== 0) {
        this.changeScene()
      }
    })

    this.player.on('ended', () => {
      this.changeScene()
    })

    this.ticker.stop()

    this.player.on('playing', () => {
      // if this is the start of the video and there is a time set for the video to start, seek to that time
      if (parseFloat(this.videoStart) !== 0 && this.player.getCurrentTime() < 0.5) this.player.seek(parseFloat(this.videoStart))
      this.ticker.start()
    })

    this.player.on('paused', () => {
      this.ticker.stop()
    })

    this.player.setVolume(0)

    this.createCapture()
    this.getMovesStamps()
  },
  methods: {
    changeScene: function () {
      this.stopAndDestroy()
      this.latencies = this.latencies.sort((a, b) => { return b - a }).splice(3, 10)
      let latency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      // only change latency if it is a number, otherwise keep the latency and show an error message with somethingWentWrong
      // Maybe not the best solution
      if (typeof latency === 'number') {
        this.$store.commit('changeLatency', latency)
      } else {
        this.$store.commit('changeWrongMessage', 'Something went wrong with the test. Please perform it again.')
        this.$store.commit('somethingWentWrong')
      }
      this.$store.commit('goToScene', 'song-selection')
    },
    stopCapture: function () {
      this.stream.srcObject.getVideoTracks().forEach((track) => {
        track.stop()
      })
    },
    resizeWindow: function () {
      window.onresize = (event) => {
        this.resize()
      }
    },
    resize: function () {
      let ratio = pixiConfig.width / pixiConfig.height
      let w
      let h
      if (window.innerWidth / window.innerHeight >= ratio) {
        w = window.innerHeight * ratio
        h = window.innerHeight
      } else {
        w = window.innerWidth
        h = window.innerWidth / ratio
      }

      if (this.$vuetify.breakpoint.lgAndUp) {
        this.app.view.style.width = w / 1.5 + 'px'
        this.app.view.style.height = h / 1.5 + 'px'
      } else if (this.$vuetify.breakpoint.md || this.$vuetify.breakpoint.sm) {
        this.app.view.style.width = w / 2.8 + 'px'
        this.app.view.style.height = h / 2.8 + 'px'
      } else {
        this.app.view.style.width = w / 1.3 + 'px'
        this.app.view.style.height = h / 1.3 + 'px'
      }
    },
    createCapture: function () {
      let constraints = {
        audio: false,
        video: {
          frameRate: 30,
          facingMode: 'user',
          width: 300,
          height: 300
        }
      }

      if (!navigator.mediaDevices) { // if there is no mediaDevices
        // try to use getUserMedia
        navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia

        if (navigator.getUserMedia) {
          navigator.getUserMedia({ audio: false, video: { width: 300, height: 300 } }, (stream) => {
            this.stream = document.getElementById('videoStream')
            this.stream.srcObject = stream
            this.stream.onloadedmetadata = (e) => {
              this.stream.play()
              this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride)
              setTimeout(() => {
                this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride)
              }, 2000)
            }
          }, (err) => {
            let errorMessage = 'The following error occurred: ' + err.name
            this.stopAndDestroy()
            this.$store.commit('changeWrongMessage', errorMessage)
            this.$store.commit('somethingWentWrong')
            this.$store.commit('goToScene', 'song-selection')
          })
        } else {
          let errorMessage = 'This browser has no camera support.'
          this.stopAndDestroy()
          this.$store.commit('changeWrongMessage', errorMessage)
          this.$store.commit('somethingWentWrong')
          this.$store.commit('goToScene', 'song-selection')
        }
      } else {
        navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            this.player.load(this.$store.state.selectedChart.videoId, false)
            this.stream = document.getElementById('videoStream')
            this.stream.setAttribute('autoplay', '')
            this.stream.setAttribute('muted', '')
            this.stream.setAttribute('playsinline', '')
            this.stream.srcObject = stream
            this.stream.onloadedmetadata = (e) => {
              this.stream.width = 300
              this.stream.height = 300
              this.stream.play()
              // do 2 pose estimations (for some reason the first estimations slow everything down)
              this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride)
              setTimeout(() => {
                this.$store.state.net.estimateSinglePose(this.stream, this.gameOptions.imageScale, false, this.gameOptions.outputStride)
              }, 2000)
            }
          })
          .catch((err) => {
            this.stopAndDestroy()

            let errorMessage = 'Something went wrong...'

            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              errorMessage = 'Are you sure you have a camera? Check your device and your system preferences to make sure your camera is anabled and reload this page.'
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
              errorMessage = 'Are you using your camera elsewhere? Come back here when your camera is not being used.'
            } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
              errorMessage = 'The camera you have is not supported... Check this website using another device.'
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              errorMessage = 'This website needs permission to use your camera. Make sure you hit allowed when asked or check your settings and try again.'
            } else if (err.name === 'TypeError' || err.name === 'TypeError') {
              errorMessage = 'Oops... Something went wrong when we tried to access you camera...'
            } else {
              errorMessage = 'Something went wrong... Check if you have a camera, if it\'s working and that this website can use it. Check your settings and try again.'
            }
            this.$store.commit('changeWrongMessage', errorMessage)
            this.$store.commit('somethingWentWrong')
            this.$store.commit('goToScene', 'song-selection')
          })
      }
    },
    stopAndDestroy: function () {
      this.player.stop()
      this.player.destroy()
      for (let texture in this.textures) {
        this.textures[texture].destroy()
      }
      for (let container in this.containers) {
        this.containers[container].destroy(true)
      }
      this.app.destroy()
      this.ticker.stop()
      this.ticker.destroy()

      this.stopCapture()

      window.removeEventListener('resize', this.resizeWindow)
      window.onresize = null
    },
    backToSelection: function () {
      // interrupts the game and goes back to song selection
      this.stopAndDestroy()
      this.$store.commit('goToScene', 'song-selection')
    },
    getMovesStamps: function () {
      let chart = this.$store.state.selectedChart.moves.split(' ')
      chart.forEach((move) => {
        move = move.split(',')
        move[0] = parseInt(move[0])
        this.timeStamps[move[0]] = []
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
    gameOptions () {
      return this.$store.state.gameOptions
    },
    displayWebcam () {
      if (this.gameOptions.showWebcam === true) {
        return {}
      } else {
        return { display: 'none' }
      }
    }
  }
}
</script>
<style scoped>
  html, body {
    min-height: 100vh;
  }
  video {
    transform: scaleX(-1);
  }
</style>
