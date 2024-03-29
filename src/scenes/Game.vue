<template>
  <!-- if esc is pressed on this scene, go back to previous scene -->
  <div @keyup.esc="backToPrevious" @keyup.r="restartTest" tabindex="0" style="height: 100vh;" class="black">
    <v-container fluid class="pa-0">
      <v-layout row wrap class="black" justify-center align-center style="height: 100vh;">
        <!-- flex containing pixi canvas that shows the game circles -->
        <v-flex md12 lg6 order-xs3 order-md3 order-lg1 v-if="gameOptions.showAnimation" class="text-xs-center">
          <v-layout row wrap style="position: relative;">
            <span v-if="noPose" class="noPoseWarning" :style="$vuetify.breakpoint.mdAndUp ? 'left: 10%; right: 10%;' : ''">MAKE SURE YOU ARE FAR ENOUGH FROM THE CAMERA</span>
            <v-flex xs12 id="canvas" class="black">
            </v-flex>
          </v-layout>
        </v-flex>
        <!-- youtube video is loaded in this v-flex -->
        <v-flex id="player" :class="gameOptions.showAnimation ? 'md12 lg6 order-xs1 order-md1 order-lg2 text-xs-center' : 'xs12 text-xs-center'" style="width: 100%; z-index: 1;"></v-flex>
        <span v-if="noPose && !gameOptions.showAnimation" style="color: white; font-size: 30px;">MAKE SURE YOU ARE FAR ENOUGH FROM THE CAMERA</span>
        <v-flex xs12 order-xs2 order-md2 order-lg3 class="white--text">
          <v-layout row wrap justify-center align-center class="pr-2">
            <!-- webcam video is displayed here if chosen to in settings -->
            <v-flex shrink :style="displayWebcam" class="pl-2">
              <video id="videoStream" style="width: 10vh; height: 10vh; border: 2px solid black;">
              </video>
            </v-flex>
            <!-- flex containing general score -->
            <v-flex grow>
              <ul style="list-style-type: none;">
                <li class="pb-2"><h3 class="title font-weight-bold">SCORE</h3></li>
                <li>
                  <ul style="list-style-type: none; border: 2px solid white; border-radius: 5px;" class="pa-2 headline">
                    <li>{{displayScore}}</li>
                  </ul>
                </li>
              </ul>
            </v-flex>
            <!-- display song details -->
            <v-flex hidden-xs-only xs3>
              <ul style="list-style-type: none;">
                <li class="pb-2"><h3 class="title font-weight-bold">SONG</h3></li>
                <li>
                  <ul style="list-style-type: none; border: 2px solid white; border-radius: 5px;" class="pa-2 headline font-weight-regular">
                    <li>{{song.general.title.toUpperCase()}} / {{song.general.artist.toUpperCase()}}</li>
                  </ul>
                </li>
              </ul>
            </v-flex>
            <!-- show detailed score -->
            <!-- <v-flex shrink hidden-sm-and-down>
              <ul style="list-style-type: none;">
                <li class="pb-2"><h3 class="title font-weight-bold">STATUS</h3></li>
                <table style="border: 2px solid white; border-radius: 5px;" class="pl-2 pr-2 title font-weight-regular">
                  <tbody>
                    <tr>
                      <td class="label">PERFECT</td>
                      <td>{{perfect}}</td>
                      <td class="label lRight">MISS</td>
                      <td>{{miss}}</td>
                    </tr>
                    <tr>
                      <td class="label">AWESOME</td>
                      <td>{{awesome}}</td>
                      <td class="label lRight">COMBO</td>
                      <td>{{combo}}</td>
                    </tr>
                    <tr>
                      <td class="label">GOOD</td>
                      <td>{{good}}</td>
                      <td class="label lRight">MAXCOMBO</td>
                      <td>{{maxCombo}}</td>
                    </tr>
                  </tbody>
                </table>
              </ul>
            </v-flex> -->
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <loading-screen :dialog="loading"></loading-screen>
  </div>
</template>

<script>
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
import giveFeedback from '../tools/game/give-feedback'
import LoadingScreen from '../components/LoadingScreen.vue'

const YTPlayer = require('yt-player')

export default {
  components: {
    'loading-screen': LoadingScreen
  },
  data () {
    return {
      // pixi app
      app: null,
      // object that holds all containers
      containers: {},
      // object that holds all textures and other PIXI instances
      textures: {},
      // pixi ticker
      ticker: null,
      // youtube player
      player: null,
      // song manager that does calculations based on youtube video
      songManager: null,
      // starter index to show cues on screen
      moveIndex: 0,
      // webcam video to be passed as a parameter to posenet
      stream: null,
      // pose detection helpers
      holdingLeft: false,
      holdingRight: false,
      // detailed score
      perfect: 0,
      awesome: 0,
      good: 0,
      miss: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      displayScore: 0,
      // report should be deprecated - shows right and left hand misses
      report: {
        rightHand: [],
        leftHand: []
      },
      // holds all requests to be done to posenet as regarding the pose detection of a particular frame
      promiseArray: [],
      // camera latency that should be considered for taking the correct frame from the camera stream and make the pose detection
      cameraLatency: 0,
      // stores the value of if there is a pose being detected by posenet
      noPose: false,
      loading: false
    }
  },
  // creates a new ticker, and app, containers and textures if necessary
  created () {
    if (this.gameOptions.showAnimation) {
      this.app = new PIXI.Application(pixiConfig)
      createTextures(this.app, this.textures, gameConfig)
      addContainers(this.app, this.containers)
      addGraphics(this.containers, this.textures)
    }
  },
  // after mounting elements
  mounted () {
    this.loading = true
    // create video capture to use stream as a parameter to posenet
    this.createCapture().then(response => {
      // if create capture returns true, create the player, load the video, add graphics and all
      // if it returns false, create capture is already responsible for throwing an error and go back to previous scene
      if (response) {
        // Create ticker
        this.ticker = new PIXI.ticker.Ticker()
        // append youtube player
        this.player = new YTPlayer('#player', playerConfig)
        // load video
        this.player.load(this.$store.state.selectedChart.videoId, false)
        // create song manager based on player loaded song
        this.songManager = new SongManager(this.player, this.$store.state.selectedChart)
        // add graphics if the user chose so
        this.addCanvasAndGraphics()
        // camera latency is transformed in quarter beats to make sense in game calculations
        this.cameraLatency = (this.gameOptions.latency / this.songManager.tempo) * 4
        // Game logic is added to ticker here
        this.ticker.add(() => this.detectAndGrade())

        this.player.on('ended', () => {
          this.endGame()
        })

        // force ticker stop to assure it will only start when the video is playing
        this.ticker.stop()

        // if there is a videoStart specified on the danceChart when the player first start playing, the player should seek to that time
        this.player.on('playing', () => {
          if (parseFloat(this.videoStart) !== 0 && this.player.getCurrentTime() < 0.5) this.player.seek(parseFloat(this.videoStart))
          this.ticker.start()
        })

        // stop the ticker when the player is paused, as it is not necessary to continue doing this process
        this.player.on('paused', () => {
          this.ticker.stop()
        })

        this.player.on('cued', () => {
          this.loading = false
        })

        // set volume to 0 on mount to fade music in when video starts
        this.player.setVolume(0)
      }
    })
  },
  methods: {
    restartTest: function () {
      if (this.$store.state.previousScene === 'editor') {
        this.moveIndex = 0
        this.holdingLeft = false
        this.holdingRight = false
        this.player.seek(this.videoStart)
        this.cueManager.index = 0
        this.cueManager.holdIndex = 0
        this.score = 0
        this.displayScore = 0
      }
    },
    fadeIn: function () {
      if (this.player.getCurrentTime() <= parseFloat(this.videoStart) + 5) {
        this.player.setVolume(this.player.getVolume() + 1)
      }
    },
    fadeOut: function () {
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) - 2 && parseFloat(this.videoEnd) !== 0) {
        this.player.setVolume(this.player.getVolume() - 1)
      }
    },
    endGame: function () {
      if (this.$store.state.previousScene !== 'editor') {
        this.goToResults()
        this.ticker.stop()
      } else {
        this.backToPrevious()
        this.ticker.stop()
      }
    },
    addCanvasAndGraphics: function () {
      // if user chose to have animations
      if (this.gameOptions.showAnimation && this.app !== null) {
        // append app view to canvas
        document.getElementById('canvas').appendChild(this.app.view)
        // create cueManager and add drawDynamicCues to ticker
        this.cueManager = new CueManager(this.songManager, gameConfig, grid, this.gameOptions.speed)
        this.ticker.add(() => {
          this.cueManager.drawDynamicCues(this.moves, this.textures.cues)
        })
        // always resize canvas conserving aspect ratio
        window.addEventListener('resize', this.resizeWindow())
        this.resize()
      }
    },
    goToResults: function () {
      this.loading = true
      // change detailed results in score
      this.$store.commit('changeResults', {
        perfect: this.perfect,
        awesome: this.awesome,
        good: this.good,
        miss: this.miss,
        maxCombo: this.maxCombo,
        score: this.score,
        maxPoints: this.maxPoints,
        report: this.report
      })

      if (this.$store.state.user !== null) { // if the user is registered
        let saveScore = firebase.functions.httpsCallable('saveScore')
        let toUpdate = {
          difficulty: this.$store.state.selectedDifficulty,
          songId: this.$store.state.selectedSongId,
          userScore: this.score
        }
        saveScore(toUpdate).then(results => {
          this.$store.dispatch('updateSongScores', results.data.scoreId)
        }).catch(err => {
          this.$store.commit('somethingWentWrong')
          this.$store.commit('changeWrongMessage', `Couldn't save scores at this time. \n ${err.message}`)
        }).finally(() => {
          this.loading = false
          this.stopAndDestroy()
          // go to results scene
          this.$store.commit('goToScene', 'results')
        })
      } else { // for non registered users
        if (this.$store.state.selectedSong.hasOwnProperty('scores')) { // if has scores
          if (this.$store.state.selectedSong.scores.hasOwnProperty(this.$store.state.selectedDifficulty)) { // if there are scores for the difficulty
            this.$store.dispatch('updateSongScores', this.$store.state.selectedSong.scores[this.$store.state.selectedDifficulty])
          } else { // no scores for difficulty
            this.$store.commit('changeSongScores', 'No scores here yet. Register and be the first in the scoreboard!')
          }
        } else { // if no scores at all
          this.$store.commit('changeSongScores', 'No scores here yet. Register and be the first in the scoreboard!')
        }
        this.loading = false
        this.stopAndDestroy()
        // go to results scene
        this.$store.commit('goToScene', 'results')
      }
    },
    // stop capture of the webcam
    stopCapture: function () {
      if (this.stream !== null) {
        this.stream.srcObject.getVideoTracks().forEach((track) => {
          track.stop()
        })
      }
    },
    // listen to window resize
    resizeWindow: function () {
      window.onresize = (event) => {
        this.resize()
      }
    },
    // resize app.view based on window resize preserving aspect ratio
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
    // creates webcam capture - making our own function was more effective than using libraries
    createCapture: function () {
      let constraints = {
        audio: false,
        video: {
          deviceId: this.gameOptions.videoDeviceId,
          frameRate: 30,
          facingMode: 'user',
          width: 300,
          height: 300
        }
      }

      if (!navigator.mediaDevices) { // if there is no mediaDevices try to use getUserMedia (fallback for older browsers)
        navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia

        if (navigator.getUserMedia) { // if we were able to access getUserMedia
          return navigator.getUserMedia({ audio: false, video: { width: 300, height: 300 } }).then(stream => {
            // create stream
            this.stream = document.getElementById('videoStream')
            this.stream.srcObject = stream
            this.stream.onloadedmetadata = (e) => {
              this.stream.play()
              /* as there is a delay in posenet first estimations, 2 estimations are done at the time the stream starts
              to prevent delay when estimations are supposed to occur quickly during the game */
              this.$store.state.net.estimatePoses(this.stream)
              setTimeout(() => {
                this.$store.state.net.estimatePoses(this.stream)
              }, 2000)
            }
            return true
          }).catch(err => {
            let errorMessage = 'The following error occurred: ' + err.name
            this.stopAndDestroy()
            this.$store.commit('changeWrongMessage', errorMessage)
            this.$store.commit('somethingWentWrong')
            this.$store.commit('goToScene', 'song-selection')
            return false
          })
        } else {
          let errorMessage = 'This browser has no camera support. Check your browser settings or try another browser.'
          this.stopAndDestroy()
          this.$store.commit('changeWrongMessage', errorMessage)
          this.$store.commit('somethingWentWrong')
          this.$store.commit('goToScene', 'song-selection')
          return Promise.resolve(false)
        }
      } else {
        return navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            this.stream = document.getElementById('videoStream')
            // make sure stream is autoplay with no audio
            this.stream.setAttribute('autoplay', '')
            this.stream.setAttribute('muted', '')
            this.stream.setAttribute('playsinline', '')
            this.stream.srcObject = stream
            this.stream.onloadedmetadata = (e) => {
              this.stream.width = 300
              this.stream.height = 300
              this.stream.play()
              // estimate poses to prevent delays on first estimation in game
              this.$store.state.net.estimatePoses(this.stream)
              setTimeout(() => {
                this.$store.state.net.estimatePoses(this.stream)
              }, 2000)
            }
            return true
          })
          .catch((err) => { // catch error from mediaDevices
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
            return false
          })
      }
    },
    stopAndDestroy: function () {
      /* stop player ticker and capture
      destroy player, ticker and animation helpers if necessary
      remove resize event listener */
      this.stopCapture()

      if (this.ticker !== null) {
        this.ticker.stop()
      }

      if (this.player !== null) {
        this.player.stop()
        this.player.destroy()
      }

      if (this.gameOptions.showAnimation) {
        for (let texture in this.textures) {
          this.textures[texture].destroy()
        }
        for (let container in this.containers) {
          this.containers[container].destroy(true)
        }
        this.app.destroy()
      }

      window.removeEventListener('resize', this.resizeWindow)
      window.onresize = null

      if (this.ticker !== null) {
        this.ticker.destroy()
      }

      if (this.loading === true) {
        this.loading = false
      }
    },
    backToPrevious: function () {
      // interrupts the game and goes back to previous scene
      this.stopAndDestroy()
      // change the current results to be displayed if going back to results
      if (this.$store.state.previousScene === 'results') {
        this.$store.commit('changeResults', {
          perfect: this.perfect,
          awesome: this.awesome,
          good: this.good,
          miss: this.miss,
          maxCombo: this.maxCombo,
          score: this.score,
          maxPoints: this.maxPoints,
          report: this.report
        })
      }
      this.$store.commit('goToScene', this.$store.state.previousScene)
    },
    detectAndGrade: function () {
      if (this.moveIndex < this.moves.length) { // index value is not higher than the array length
        if (this.moves[this.moveIndex][0] + 1 <= this.songManager.currentQuarterBeat - this.cameraLatency) { // if the beat of the current index has passed the current beat
          if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
            !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
            this.promiseArray.push(this.$store.state.net.estimatePoses(this.stream))
            // add the reference move to the end of the promiseArray
            this.promiseArray.push(this.moves[this.moveIndex])
            Promise.all(this.promiseArray).then((values) => {
              // separate reference values for each hand
              let handMove = values.splice(values.length - 1, 1)[0]
              let rightHandMove = handMove[3]
              let leftHandMove = handMove[2]
              let rightHit = []
              let leftHit = []
              let rightHitType = ''
              let leftHitType = ''

              values.forEach((pose, i) => {
                let rightHandDetected = false
                let leftHandDetected = false

                if (pose[0].score > 0.4) { // set a minimum confidence for poses. Less than the value will be ignored
                  this.noPose = false
                  if (leftHandMove !== 'X') {
                    if (leftHandMove[0] === 'S') { // evaluate Sharp move
                      leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose[0])
                    } else if (leftHandMove[0] === 'H' && leftHandMove.length > 2) { // evaluate Hold move
                      if (leftHandMove[2] === 'S') this.holdingLeft = true // if it is the first of a hold, holding left is true
                      leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose[0])
                    } else if (leftHandMove[0] === 'M' && leftHandMove.length > 2) { // evaluate Motion move
                      if (leftHandMove[2] === 'S') this.holdingLeft = true // if it is the first of a motion, holding left is true
                      leftHandDetected = detectionManager.detect('L', leftHandMove[1], pose[0])
                    }
                    if (leftHandDetected) leftHit.push(i)
                  }

                  if (rightHandMove !== 'X') {
                    if (rightHandMove[0] === 'S') { // evaluate Sharp move
                      rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose[0])
                    } else if (rightHandMove[0] === 'H' && rightHandMove.length > 2) { // evaluate Hold move
                      if (rightHandMove[2] === 'S') this.holdingRight = true // if it is the first of a hold, holding right is true
                      rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose[0])
                    } else if (rightHandMove[0] === 'M' && rightHandMove.length > 2) { // evaluate Motion move
                      if (rightHandMove[2] === 'S') this.holdingRight = true // if it is the first of a motion, holding right is true
                      rightHandDetected = detectionManager.detect('R', rightHandMove[1], pose[0])
                    }
                    if (rightHandDetected) rightHit.push(i)
                  }
                } else {
                  this.noPose = true
                }
              })

              if (rightHit.length > 0) {
                if (rightHandMove[0] === 'S') {
                  if (rightHit[0] === 0) {
                    rightHitType = 'perfect'
                    this.perfect++
                    this.score += 1000
                  } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                    rightHitType = 'good'
                    this.good++
                    this.score += 600
                  } else {
                    rightHitType = 'awesome'
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                } else if ((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && this.holdingRight === true) { // check only if holding is true
                  if (rightHit[0] === 0) {
                    rightHitType = 'perfect'
                    this.perfect++
                    this.score += 1000
                  } else if (rightHit[0] === values.length - 1 && values.length > 2) {
                    rightHitType = 'good'
                    this.good++
                    this.score += 600
                  } else {
                    rightHitType = 'awesome'
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                  if ((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove[2] === 'E') this.holdingRight = false // if it is the last of the move, set back to false
                } else if ((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && this.holdingRight === false) {
                  rightHitType = 'miss'
                  this.miss++
                  this.report.rightHand.push(handMove)
                  this.combo = 0
                  this.holdingRight = false
                }
              } else if (rightHit.length === 0 && rightHandMove !== 'X' && !((rightHandMove[0] === 'H' || rightHandMove[0] === 'M') && rightHandMove.length === 2)) {
                rightHitType = 'miss'
                this.miss++
                this.report.rightHand.push(handMove)
                this.combo = 0
                this.holdingRight = false
              }

              if (leftHit.length > 0) {
                if (leftHandMove[0] === 'S') {
                  if (leftHit[0] === 0) {
                    leftHitType = 'perfect'
                    this.perfect++
                    this.score += 1000
                  } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                    leftHitType = 'good'
                    this.good++
                    this.score += 600
                  } else {
                    leftHitType = 'awesome'
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                } else if ((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && this.holdingLeft === true) { // check only if holding is true
                  if (leftHit[0] === 0) {
                    leftHitType = 'perfect'
                    this.perfect++
                    this.score += 1000
                  } else if (leftHit[0] === values.length - 1 && values.length > 2) {
                    leftHitType = 'good'
                    this.good++
                    this.score += 600
                  } else {
                    leftHitType = 'awesome'
                    this.awesome++
                    this.score += 800
                  }
                  this.combo++
                  if (this.combo > this.maxCombo) this.maxCombo = this.combo
                  if ((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove[2] === 'E') this.holdingLeft = false // if it is the last of the move, set back to false
                } else if ((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && this.holdingLeft === false) {
                  leftHitType = 'miss'
                  this.miss++
                  this.report.leftHand.push(handMove)
                  this.combo = 0
                  this.holdingLeft = false
                }
              } else if (leftHit.length === 0 && leftHandMove !== 'X' && !((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove.length === 2)) {
                leftHitType = 'miss'
                this.miss++
                this.report.leftHand.push(handMove)
                this.combo = 0
                this.holdingLeft = false
              }
              if (this.gameOptions.showAnimation) giveFeedback(leftHandMove, rightHandMove, leftHitType, rightHitType, this.containers.feedback, this.textures)
            }).catch(() => {
              this.$store.commit('somethingWentWrong')
              this.$store.commit('changeWrongMessage', `Something went wrong trying to detect poses.`)
            })
            this.promiseArray = []
          }
          this.moveIndex++
        }
        if (this.moveIndex < this.moves.length) {
          if (this.moves[this.moveIndex][0] <= this.songManager.currentQuarterBeat - this.cameraLatency) { // push estimate pose to promise array if it is a move with length > 2 (except Sharp)
            if (!(this.moves[this.moveIndex][2][0] === 'H' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'H' && this.moves[this.moveIndex][3].length === 2) &&
              !(this.moves[this.moveIndex][2][0] === 'M' && this.moves[this.moveIndex][2].length === 2) && !(this.moves[this.moveIndex][3][0] === 'M' && this.moves[this.moveIndex][3].length === 2)) {
              this.promiseArray.push(this.$store.state.net.estimatePoses(this.stream))
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
      // fade in near the start of the video
      this.fadeIn()
      // fade out near the video end
      this.fadeOut()
      // take action when the video ends
      if (this.player.getCurrentTime() >= parseFloat(this.videoEnd) && parseFloat(this.videoEnd) !== 0) {
        this.endGame()
      }
    }
  },
  computed: {
    // get moves from store and parse it to an array
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
    // returns maximum number of points of the selected chart
    maxPoints () {
      if (this.moves === []) {
        return 0
      } else {
        let points = 0
        // adds 1000 for each valid move - it considerates 'nodes' but not 'progress'
        this.moves.forEach(move => {
          if (move[2].length === 3 || move[2][0] === 'S') {
            points += 1000
          }
          if (move[3].length === 3 || move[3][0] === 'S') {
            points += 1000
          }
        })
        return points
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
  .noPoseWarning {
    position: absolute;
    top: 40%;
    z-index: 5;
    color: white;
    font-size: 30px;
  }
  .label {
    padding-right: 80px;

  }
  .lRight {
    padding-left: 80px;
  }
</style>
