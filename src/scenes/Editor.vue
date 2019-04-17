<template>
  <div>
    <button v-on:click="loadVideo">Load Video</button>
    <button v-on:click="pauseVideo">Pause Video</button>
    <div id="canvas"></div>
    <div id="player"></div>
  </div>
</template>

<script>
import playerConfig from '../tools/editor/config/youtube-player'
const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      player: null
    }
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
  },
  methods: {
    loadVideo: function () {
      this.player.load('YOtKiiUrIvk')
    },
    pauseVideo: function () {
      this.player.pause()
    }
  }
}
</script>
