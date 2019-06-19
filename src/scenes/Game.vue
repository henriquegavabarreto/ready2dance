<template>
  <div @keyup.esc="backToPrevious" tabindex="0" style="height: 100vh;" class="black">
    <v-container fluid class="pa-0">
      <v-layout row wrap class="black" justify-center align-center style="height: 100vh;">
        <v-flex md12 lg6 order-xs3 order-md3 order-lg1 v-if="gameOptions.showAnimation" class="text-xs-center">
          <v-layout row wrap style="position: relative;">
            <span v-if="noPose" class="noPoseWarning" :style="$vuetify.breakpoint.mdAndUp ? 'left: 10%; right: 10%;' : ''">MAKE SURE YOU ARE FAR ENOUGH FROM THE CAMERA</span>
            <v-flex xs12 id="canvas" class="black">
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex id="player" :class="gameOptions.showAnimation ? 'md12 lg6 order-xs1 order-md1 order-lg2 text-xs-center' : 'xs12 text-xs-center'" style="width: 100%; z-index: 1;"></v-flex>
        <span v-if="noPose && !gameOptions.showAnimation" style="color: white; font-size: 30px;">MAKE SURE YOU ARE FAR ENOUGH FROM THE CAMERA</span>
        <v-flex xs12 order-xs2 order-md2 order-lg3 class="white--text">
          <v-layout row wrap justify-center align-center class="pr-2">
            <v-flex shrink :style="displayWebcam" class="pl-2">
              <video id="videoStream" style="width: 10vh; height: 10vh; border: 2px solid black;">
              </video>
            </v-flex>
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
            <v-flex hidden-xs-only xs3>
              <ul style="list-style-type: none;">
                <li class="pb-2"><h3 class="title font-weight-bold">SONG</h3></li>
                <li>
                  <ul style="list-style-type: none; border: 2px solid white; border-radius: 5px;" class="pa-2 headline font-weight-regular">
                    <li>{{song.title}} / {{song.artist}}</li>
                  </ul>
                </li>
              </ul>
            </v-flex>
            <v-flex shrink hidden-sm-and-down>
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
import detectionManager from '../tools/game/detection-manager'
import pixiConfig from '../tools/game/config/pixi-config'
import createTextures from '../tools/game/create-textures'
import addContainers from '../tools/game/add-containers'
import addGraphics from '../tools/game/add-graphics'
import * as PIXI from 'pixi.js'
import firebase from '../tools/config/firebase'
import giveFeedback from '../tools/game/give-feedback'

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
      cameraLatency: 0,
      noPose: false
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
      window.addEventListener('resize', this.resizeWindow())
      this.resize()
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
              let rightHitType = ''
              let leftHitType = ''

              values.forEach((pose, i) => {
                let rightHandDetected = false
                let leftHandDetected = false

                if (pose.score > 0.6) { // set a minimum confidence for poses. Less than 0.6 shall not pass!
                  this.noPose = false
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
                }
              } else if (leftHit.length === 0 && leftHandMove !== 'X' && !((leftHandMove[0] === 'H' || leftHandMove[0] === 'M') && leftHandMove.length === 2)) {
                leftHitType = 'miss'
                this.miss++
                this.report.leftHand.push(handMove)
                this.combo = 0
                this.holdingLeft = false
              }
              if (this.gameOptions.showAnimation) giveFeedback(leftHandMove, rightHandMove, leftHitType, rightHitType, this.containers.feedback, this.textures)
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
        if (this.$store.state.previousScene !== 'editor') {
          this.goToResults()
        } else {
          this.backToPrevious()
        }
      }
    })

    this.player.on('ended', () => {
      if (this.$store.state.previousScene !== 'editor') {
        this.goToResults()
      } else {
        this.backToPrevious()
      }
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

    this.createCapture()
  },
  methods: {
    goToResults: function () {
      this.stopAndDestroy()

      if (this.$store.state.user !== null) { // if the user is not anonymous
        for (let song in this.$store.state.songs) {
          if (this.$store.state.selectedSong.videoId === this.$store.state.songs[song].videoId && this.$store.state.songs[song].charts[this.$store.state.selectedDifficulty].draft !== true) {
            if (!this.$store.state.songs[song].hasOwnProperty('scores')) { // if there are no scores for this song
              firebase.database.ref('scores').push({
                [this.$store.state.user.username]: this.score
              }).then((scoreRef) => {
                this.$store.dispatch('updateSongScores', scoreRef.key)
                firebase.database.ref(`songs/${song}`).update({
                  scores: {
                    [this.$store.state.selectedDifficulty]: scoreRef.key
                  }
                }).catch((err) => { console.log(err) })
              }).catch((err) => { console.log(err) })
            } else { // if there are scores for the song
              if (this.$store.state.songs[song].scores.hasOwnProperty(this.$store.state.selectedDifficulty)) { // if selected difficulty is part of the score node
                let scoreId = this.$store.state.songs[song].scores[this.$store.state.selectedDifficulty]
                firebase.database.ref(`scores/${scoreId}`).orderByKey().equalTo(this.$store.state.user.username).once('value', data => {
                  if (data.val() === null) { // if the user has no scores
                    firebase.database.ref(`scores/${scoreId}`).update({
                      [this.$store.state.user.username]: this.score
                    }).then(() => {
                      this.$store.dispatch('updateSongScores', scoreId)
                    }).catch((err) => { console.log(err) })
                  } else { // if the user has a score
                    let currentScore = data.val()[this.$store.state.user.username]
                    if (this.score > currentScore) { // update only if score is larger
                      firebase.database.ref(`scores/${scoreId}`).update({
                        [this.$store.state.user.username]: this.score
                      }).then(() => {
                        this.$store.dispatch('updateSongScores', scoreId)
                      }).catch((err) => { console.log(err) })
                    } else {
                      this.$store.dispatch('updateSongScores', scoreId)
                    }
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
                  }).catch((err) => { console.log(err) })
                }).catch((err) => { console.log(err) })
              }
            }
          }
        }
      } else { // for anonymous users
        if (this.$store.state.selectedSong.hasOwnProperty('scores')) { // if has scores
          if (this.$store.state.selectedSong.scores.hasOwnProperty(this.$store.state.selectedDifficulty)) { // if there are scores for the dif
            this.$store.dispatch('updateSongScores', this.$store.state.selectedSong.scores[this.$store.state.selectedDifficulty])
          } else { // no scores for dif
            this.$store.commit('changeSongScores', 'No scores here yet. Register and be the first in the scoreboard!')
          }
        } else { // if no scores
          this.$store.commit('changeSongScores', 'No scores here yet. Register and be the first in the scoreboard!')
        }
      }

      this.$store.commit('goToScene', 'results')
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
            console.log(err.name, err.message)
            this.$store.commit('changeWrongMessage', errorMessage)
            this.$store.commit('somethingWentWrong')
            this.$store.commit('goToScene', 'song-selection')
          })
      }
    },
    stopAndDestroy: function () {
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

      window.removeEventListener('resize', this.resizeWindow)
      window.onresize = null
    },
    backToPrevious: function () {
      // interrupts the game and goes back to previous scene
      this.stopAndDestroy()
      this.$store.commit('goToScene', this.$store.state.previousScene)
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
    maxPoints () {
      if (this.moves === []) {
        return 0
      } else {
        let points = 0
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
