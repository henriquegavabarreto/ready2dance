<template>
  <div>
    <video id="videoStream" style="width: 600px; height: 600px; display: none;">
    </video>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 id="canvas">
          <p>{{pose}}</p>
        </v-flex>
        <v-flex xs6 id="player">
        </v-flex>
      </v-layout>
      <v-footer>
        <v-btn @click="estimatePose">Estimate</v-btn>
      </v-footer>
    </v-container>
  </div>
</template>

<script>
import getUserMedia from 'getusermedia'
import playerConfig from '../tools/game/config/youtube-player'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      player: null,
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
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
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
      })
    }
  }
}
</script>
