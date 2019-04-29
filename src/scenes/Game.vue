<template>
  <v-container px-1>
    <video id="videoStream" style="width: 600px; height: 600px; display: none;">
    </video>
    <v-layout row wrap justify-center>
      <v-flex xs6 id="canvas">
      </v-flex>
      <v-flex xs6 id="player">
      </v-flex>
    </v-layout>
    <v-footer>
      <v-btn @click="estimatePose">Estimate</v-btn>
    </v-footer>
  </v-container>
</template>

<script>
import getUserMedia from 'getusermedia'
import playerConfig from '../tools/game/config/youtube-player'
import SongManager from '../tools/config/song-manager'
import CueManager from '../tools/game/cue-manager'
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
      previousBeat: 0,
      stream: null,
      streaming: false,
      poseNetOptions: {
        scale: 0.5,
        output: 16,
        flipHorizontal: false
      },
      pose: ''
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
      this.cueManager.drawMoves(this.previousBeat)
      this.previousBeat = this.songManager.nearestBeat
    })
    document.getElementById('canvas').appendChild(this.app.view)
    setCircles(this.circleContainer)
    this.player.load(this.$store.state.selectedChart.videoId, false)
    getUserMedia({ video: true, audio: false }, (err, stream) => {
      if (err) {
        console.log(err)
        this.$store.commit('goToSongSelection')
      } else {
        this.stream = document.getElementById('videoStream')
        this.stream.width = 600
        this.stream.height = 600
        this.stream.srcObject = stream
        this.stream.play()
        this.streaming = true
      }
    })
  },
  methods: {
    estimatePose: function () {
      this.$store.state.net.estimateSinglePose(this.stream, this.poseNetOptions.scale, this.poseNetOptions.flipHorizontal, this.poseNetOptions.output).then((data) => {
        console.log(data)
        this.pose = data
        console.log(this.songManager.nearestBeat)
      })
    }
  }
}
</script>
