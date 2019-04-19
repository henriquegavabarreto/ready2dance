<template>
  <div>
    <editorheader></editorheader>
    <button v-on:click="loadVideo">Load Video</button>
    <button v-on:click="pauseVideo">Pause Video</button>
    <button v-on:click="drawNumbers">Draw Numbers</button>
    <div id="wrapper">
      <div id="canvas" tabindex = "0"
        @keydown.arrow-down="moveToNextQuarterBeat"
        @keydown.arrow-up="moveToPreviousQuarterBeat"
        @keydown.arrow-right="moveToNextBeat"
        @keydown.arrow-left="moveToPreviousBeat"
        @keyup.p="playAndPause"
        @keydown.c="startCopySelection"
        @keyup.c="endCopySelection"
        @keydown.x="startRightHandCreation"
        @keydown.z="startLeftHandCreation"
        @keyup.x="stopRightHandCreation"
        @keyup.z="stopLeftHandCreation"
      ></div>
      <div id="player"></div>
    </div>
  </div>
</template>

<script>
import Editorheader from '../components/Editorheader'
import playerConfig from '../tools/editor/config/youtube-player'
import pixiConfig from '../tools/editor/config/pixi-config'
import setViewAndContainers from '../tools/editor/containers/set-view-and-containers'
import setInitialGraphics from '../tools/editor/containers/set-initial-graphics'
import SongManager from '../tools/config/song-manager'
import MoveManager from '../tools/editor/moves/move-manager'
import NoteManager from '../tools/editor/notes/note-manager'
import danceChart from '../tools/editor/data/dance-chart'
import editorConfig from '../tools/editor/config/editor-config'
import drawGuideNumbers from '../tools/editor/containers/guideNumbers/draw-guide-numbers'
import redrawStaff from '../tools/editor/containers/backgroundStaff/redraw-staff'
import updateTimeText from '../tools/editor/animations/update-time-text'
import updateTimeline from '../tools/editor/animations/update-timeline'
import drawSelection from '../tools/editor/containers/copyPasteSelection/draw-selection'
import enableSelection from '../tools/editor/circleSelection/enable-selection'
import copy from '../tools/editor/copyPaste/copy'
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
      danceChart: danceChart,
      noteManager: null,
      moveManager: null
    }
  },
  created () {
    this.editorView = new PIXI.Application(pixiConfig)
  },
  mounted () {
    setViewAndContainers(this.editorView)
    setInitialGraphics()
    this.player = new YTPlayer('#player', playerConfig)
    this.player.on('paused', () => { this.player.seek(this.songManager.getNearestBeatTime()) })
    this.songManager = new SongManager(this.player, this.danceChart)
    this.moveManager = new MoveManager(this.songManager)
    this.noteManager = new NoteManager(this.songManager)
  },
  methods: {
    loadVideo: function () {
      this.player.load('YOtKiiUrIvk')
      // expected behaviours after the video is loaded
      editorConfig.status = true
      this.editorView.ticker.add(() => {
        updateTimeText(this.player)
        updateTimeline(this.songManager.currentBeat)
      })
    },
    pauseVideo: function () {
      this.player.pause()
      console.log(this.songManager.nearestBeat)
    },
    drawNumbers: function () {
      drawGuideNumbers(this.player, this.danceChart, this.songManager)
      redrawStaff(this.player, this.danceChart, this.songManager)
    },
    moveToNextQuarterBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = 1
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        if (editorConfig.selectingMoves) drawSelection(this.songManager)
        // createNoteWhenSelected(skippedBeats)
        setTimeout(function () {
          // showMoveInfo()
          // drawCues()
        }, 200)
      }
    },
    moveToPreviousQuarterBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = -1
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        if (editorConfig.selectingMoves) drawSelection(this.songManager)
        // createNoteWhenSelected(skippedBeats)
        setTimeout(function () {
          // showMoveInfo()
          // drawCues()
        }, 200)
      }
    },
    moveToNextBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = 4
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        if (editorConfig.selectingMoves) drawSelection(this.songManager)
        // createNoteWhenSelected(skippedBeats)
        setTimeout(function () {
          // showMoveInfo()
          // drawCues()
        }, 200)
      }
    },
    moveToPreviousBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = -4
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        if (editorConfig.selectingMoves) drawSelection(this.songManager)
        // createNoteWhenSelected(skippedBeats)
        setTimeout(function () {
          // showMoveInfo()
          // drawCues()
        }, 200)
      }
    },
    playAndPause: function () {
      if (editorConfig.status && !editorConfig.areaSelect) {
        if (this.player.getState() === 'playing') {
          this.player.pause()
          // setTimeout(function () {
          //   showMoveInfo()
          //   drawCues()
          // }, 200)
        } else {
          this.player.play()
        }
      }
    },
    startCopySelection: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        copy.start(this.songManager)
        drawSelection(this.songManager)
      }
    },
    endCopySelection: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        copy.end(this.songManager)
        copy.addSelectionToClipboard(this.danceChart)
      }
    },
    startRightHandCreation: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = 'x'
        editorConfig.beatArray.push(this.songManager.nearestBeat)
        this.noteManager.createNote('x')
      }
    },
    startLeftHandCreation: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = 'z'
        editorConfig.beatArray.push(this.songManager.nearestBeat)
        this.noteManager.createNote('z')
      }
    },
    stopRightHandCreation: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        if (this.moveManager.isValidInsert(this.danceChart)) {
          this.moveManager.addRequiredMoves(danceChart, 'x')
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[0]))
          enableSelection()
        }
        editorConfig.creatingMove = false
        editorConfig.pressedKey = ''
      }
    },
    stopLeftHandCreation: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        editorConfig.creatingMove = false
        editorConfig.pressedKey = ''
      }
    }
  }
}
</script>
<style scoped>
  #wrapper {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
  }
  #player {
    top: 0;
    right: 0;
    z-index: -1;
  }

  #canvas {
    display: flex;
    flex-wrap: wrap;
    width: 50%;
    margin: 0;
    outline: none;
  }
</style>
