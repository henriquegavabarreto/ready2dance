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
import pixiConfig from '../tools/editor/config/pixi-config'
import setViewAndContainers from '../tools/editor/containers/set-view-and-containers'
import SongManager from '../tools/config/song-manager'
import danceChart from '../tools/editor/data/dance-chart'
import * as PIXI from 'pixi.js'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      player: null,
      editorView: null,
      songManager: null
    }
  },
  created () {
    this.editorView = new PIXI.Application(pixiConfig)
  },
  mounted () {
    this.player = new YTPlayer('#player', playerConfig)
    setViewAndContainers(this.editorView)
    this.songManager = new SongManager(this.player, danceChart)
  },
  methods: {
    loadVideo: function () {
      this.player.load('YOtKiiUrIvk')
    },
    pauseVideo: function () {
      this.player.pause()
      console.log(this.songManager.nearestBeat)
    }
  }
}
</script>
