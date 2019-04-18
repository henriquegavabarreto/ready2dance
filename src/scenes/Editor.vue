<template>
  <div>
    <editorheader></editorheader>
    <button v-on:click="loadVideo">Load Video</button>
    <button v-on:click="pauseVideo">Pause Video</button>
    <button v-on:click="drawNumbers">Draw Numbers</button>
    <div id="canvas" tabindex = "0"
      @keydown.arrow-down="moveToNextQuarterBeat"
      @keydown.arrow-up="moveToPreviousQuarterBeat"
      @keydown.arrow-right="moveToNextBeat"
      @keydown.arrow-left="moveToPreviousBeat"
    ></div>
    <div id="player"></div>
  </div>
</template>

<script>
import Editorheader from '../components/Editorheader'
import playerConfig from '../tools/editor/config/youtube-player'
import pixiConfig from '../tools/editor/config/pixi-config'
import setViewAndContainers from '../tools/editor/containers/set-view-and-containers'
import setInitialGraphics from '../tools/editor/containers/set-initial-graphics'
import SongManager from '../tools/config/song-manager'
import danceChart from '../tools/editor/data/dance-chart'
import editorConfig from '../tools/editor/config/editor-config'
import drawGuideNumbers from '../tools/editor/containers/guideNumbers/draw-guide-numbers'
import * as PIXI from 'pixi.js'

const YTPlayer = require('yt-player')

export default {
  components: {
    'editorheader': Editorheader
  },
  data () {
    return {
      player: null,
      editorView: null,
      songManager: null,
      danceChart: danceChart
    }
  },
  created () {
    this.editorView = new PIXI.Application(pixiConfig)
  },
  mounted () {
    setViewAndContainers(this.editorView)
    setInitialGraphics()
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.danceChart)
  },
  methods: {
    loadVideo: function () {
      this.player.load('YOtKiiUrIvk')
      editorConfig.status = true
    },
    pauseVideo: function () {
      this.player.pause()
      console.log(this.songManager.nearestBeat)
    },
    drawNumbers: function () {
      drawGuideNumbers(this.player, this.danceChart, this.songManager)
    },
    moveToNextQuarterBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = 1
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
      //   createNoteWhenSelected(skippedBeats)
      //   setTimeout(function () {
      //     showMoveInfo()
      //     drawCues()
      //     if (editor.selectingMoves) drawSelectionRectangle()
      // }, 200)
      }
    },
    moveToPreviousQuarterBeat: function () {
      let skippedBeats = -1
      this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
      // createNoteWhenSelected(skippedBeats)
      // setTimeout(function () {
      //   showMoveInfo()
      //   drawCues()
      //   if (editor.selectingMoves) drawSelectionRectangle()
      // }, 200)
    },
    moveToNextBeat: function () {
      let skippedBeats = 4
      this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
      // createNoteWhenSelected(skippedBeats)
      // setTimeout(function () {
      //   showMoveInfo()
      //   drawCues()
      //   if (editor.selectingMoves) drawSelectionRectangle()
      // }, 200)
    },
    moveToPreviousBeat: function () {
      let skippedBeats = -4
      this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
      // createNoteWhenSelected(skippedBeats)
      // setTimeout(function () {
      //   showMoveInfo()
      //   drawCues()
      //   if (editor.selectingMoves) drawSelectionRectangle()
      // }, 200)
    }
  }
}
</script>
