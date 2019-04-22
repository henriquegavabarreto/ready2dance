<template>
  <div>
    <!-- <editorheader></editorheader> -->
    <button v-on:click="loadVideo">Load Video</button>
    <button v-on:click="pauseVideo">Pause Video</button>
    <button v-on:click="drawNumbers">Draw Numbers</button>
    <v-layout>
    <v-flex xs6>
      <v-toolbar color="black" dark tabs>
        <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn fab small v-on="on">
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Back to Song Selection</span>
        </v-tooltip>

          <v-tabs
            centered
            color="transparent"
            icons-and-text
            height="60"
            v-model="tabs"
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab>
              Song Settings
              <v-icon>audiotrack</v-icon>
            </v-tab>

            <v-tab>
              Save/Load
              <v-icon>video_library</v-icon>
            </v-tab>

            <v-tab>
              About
              <v-icon>info</v-icon>
            </v-tab>

            <v-tab>
              Editor
              <v-icon>info</v-icon>
            </v-tab>
          </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-card flat>
            <v-card-text>B</v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card flat>
            <v-card-text>C</v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card flat>
            <v-card-text>D</v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card flat>
            <div id="canvas" tabindex="0"
            @keydown.arrow-down="moveToNextQuarterBeat"
            @keydown.arrow-up="moveToPreviousQuarterBeat"
            @keydown.arrow-right="moveToNextBeat"
            @keydown.arrow-left="moveToPreviousBeat"
            @keyup.p="playAndPause"
            @keydown.c="startCopySelection"
            @keyup.c="endCopySelection"
            @keyup.v="pasteMoves"
            @keydown.x="startCreation"
            @keydown.z="startCreation"
            @keyup.x="stopCreation"
            @keyup.z="stopCreation"
            @keyup.a="createNode"
            @keyup.s="createNode"
            @keyup.q="deleteMove"
            @keyup.w="deleteMove"
            @click="dealWithSelection"></div>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
      <!-- <div id="canvas" tabindex = "0"
        @keydown.arrow-down="moveToNextQuarterBeat"
        @keydown.arrow-up="moveToPreviousQuarterBeat"
        @keydown.arrow-right="moveToNextBeat"
        @keydown.arrow-left="moveToPreviousBeat"
        @keyup.p="playAndPause"
        @keydown.c="startCopySelection"
        @keyup.c="endCopySelection"
        @keyup.v="pasteMoves"
        @keydown.x="startCreation"
        @keydown.z="startCreation"
        @keyup.x="stopCreation"
        @keyup.z="stopCreation"
        @keyup.a="createNode"
        @keyup.s="createNode"
        @keyup.q="deleteMove"
        @keyup.w="deleteMove"
        @click="dealWithSelection"
      ></div> -->
    </v-flex>
    <v-flex xs6>
      <v-container align-center justify-center id="player"/>
    </v-flex>
  </v-layout>
  </div>
</template>

<script>
// import Editorheader from '../components/Editorheader'
import playerConfig from '../tools/editor/config/youtube-player'
import pixiConfig from '../tools/editor/config/pixi-config'
import setViewAndContainers from '../tools/editor/containers/set-view-and-containers'
import setInitialGraphics from '../tools/editor/containers/set-initial-graphics'
import setCueGraphics from '../tools/editor/containers/cueContainer/set-cue-graphics'
import SongManager from '../tools/config/song-manager'
import MoveManager from '../tools/editor/moves/move-manager'
import NoteManager from '../tools/editor/notes/note-manager'
import CueManager from '../tools/editor/cues/cue-manager'
import danceChart from '../tools/editor/data/dance-chart'
import editorConfig from '../tools/editor/config/editor-config'
import drawGuideNumbers from '../tools/editor/containers/guideNumbers/draw-guide-numbers'
import redrawStaff from '../tools/editor/containers/backgroundStaff/redraw-staff'
import updateTimeText from '../tools/editor/animations/update-time-text'
import updateTimeline from '../tools/editor/animations/update-timeline'
import drawSelection from '../tools/editor/containers/copyPasteSelection/draw-selection'
import enableSelection from '../tools/editor/circleSelection/enable-selection'
import disableSelection from '../tools/editor/circleSelection/disable-selection'
import copy from '../tools/editor/copyPaste/copy'
import paste from '../tools/editor/copyPaste/paste'
import * as PIXI from 'pixi.js'

const YTPlayer = require('yt-player')

export default {
  // components: {
  //   'editorheader': Editorheader
  // },
  data () {
    return {
      tabs: null,
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
    setCueGraphics()
    this.player = new YTPlayer('#player', playerConfig)
    this.player.on('paused', () => { this.player.seek(this.songManager.getNearestBeatTime()) })
    this.songManager = new SongManager(this.player, this.danceChart)
    this.moveManager = new MoveManager(this.songManager)
    this.noteManager = new NoteManager(this.songManager)
    this.cueManager = new CueManager(this.songManager, this.moveManager)
  },
  methods: {
    loadVideo: function () {
      this.player.load('YOtKiiUrIvk')
      // expected behaviours after the video is loaded
      editorConfig.status = true
      this.editorView.ticker.add(() => {
        updateTimeText(this.player)
        updateTimeline(this.songManager.currentBeat)
        if (this.player.getState() === 'playing') this.cueManager.drawCues(this.danceChart)
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
        // createNoteWhenSelected(skippedBeats)
        setTimeout(() => {
          if (editorConfig.creatingMove) {
            this.noteManager.createNotes(editorConfig.pressedKey)
            this.moveManager.addBeatToArray()
          }
          if (editorConfig.selectingMoves) drawSelection(this.songManager)
          this.cueManager.drawCues(this.danceChart)
          // showMoveInfo()
        }, 200)
      }
    },
    moveToPreviousQuarterBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = -1
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        // createNoteWhenSelected(skippedBeats)
        setTimeout(() => {
          if (editorConfig.creatingMove) {
            this.noteManager.createNotes(editorConfig.pressedKey)
            this.moveManager.addBeatToArray()
          }
          if (editorConfig.selectingMoves) drawSelection(this.songManager)
          // showMoveInfo()
          this.cueManager.drawCues(this.danceChart)
        }, 200)
      }
    },
    moveToNextBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = 4
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        // createNoteWhenSelected(skippedBeats)
        setTimeout(() => {
          if (editorConfig.creatingMove) {
            this.noteManager.createNotes(editorConfig.pressedKey, this.songManager.nearestBeat, skippedBeats)
            this.moveManager.addBeatToArray(this.songManager.nearestBeat, skippedBeats)
          }
          if (editorConfig.selectingMoves) drawSelection(this.songManager)
          // showMoveInfo()
          this.cueManager.drawCues(this.danceChart)
        }, 200)
      }
    },
    moveToPreviousBeat: function () {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let skippedBeats = -4
        this.player.seek(this.songManager.getNearestBeatTime(skippedBeats))
        // createNoteWhenSelected(skippedBeats)
        setTimeout(() => {
          if (editorConfig.creatingMove) {
            this.noteManager.createNotes(editorConfig.pressedKey, this.songManager.nearestBeat, skippedBeats)
            this.moveManager.addBeatToArray(this.songManager.nearestBeat, skippedBeats)
          }
          if (editorConfig.selectingMoves) drawSelection(this.songManager)
          // showMoveInfo()
          this.cueManager.drawCues(this.danceChart)
        }, 200)
      }
    },
    playAndPause: function () {
      if (editorConfig.status && !editorConfig.areaSelect) {
        if (this.player.getState() === 'playing') {
          this.player.pause()
          setTimeout(() => {
            // showMoveInfo()
            this.cueManager.drawCues(this.danceChart)
          }, 200)
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
    pasteMoves: function () {
      paste(this.danceChart, this.songManager, this.moveManager, this.noteManager)
    },
    startCreation: function (event) {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect && editorConfig.pressedKey === '') {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = event.key
        this.moveManager.addBeatToArray()
        this.noteManager.createNotes(event.key)
      }
    },
    stopCreation: function (event) {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect && editorConfig.pressedKey === event.key) {
        if (this.moveManager.isValidInsert(this.danceChart)) {
          this.moveManager.sortBeatArray()
          this.moveManager.addRequiredMoves(this.danceChart, event.key)
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[0]))
          this.moveManager.setCircleCount()
          enableSelection()
        } else {
          this.noteManager.removeInvalidNotes(this.danceChart)
          this.moveManager.clearBeatArray()
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
        }
      }
    },
    createNode: function (event) {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        let moveType = this.moveManager.getCreatedMoveType(this.danceChart, event.key)
        if (moveType === 'H') {
          this.moveManager.setHoldNode(this.danceChart, event.key)
        } else if (moveType === 'M') {
          editorConfig.changingMove = true
          editorConfig.pressedKey = event.key
          enableSelection()
        }
      }
    },
    deleteMove: function (event) {
      if (editorConfig.status && this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        this.moveManager.deleteMove(this.danceChart, event.key)
        this.noteManager.redraw(this.danceChart)
        this.cueManager.drawCues(this.danceChart)
      }
    },
    dealWithSelection: function () {
      if (editorConfig.creatingMove) {
        if (editorConfig.selectedCircles.length === 1 && editorConfig.circleCount > 1) {
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[editorConfig.beatArray.length - 1]))
        } else if (editorConfig.selectedCircles.length === editorConfig.circleCount) {
          this.moveManager.addHandInfo(this.danceChart)
          this.noteManager.tintNotes()
          disableSelection()
          this.moveManager.clearBeatArray()
          editorConfig.selectedCircles = []
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
          this.cueManager.drawCues(this.danceChart)
        }
      } else if (editorConfig.changingMove) {
        if (editorConfig.selectedCircles.length === 1) {
          this.moveManager.changeMove(this.danceChart, this.songManager.nearestBeat, editorConfig.pressedKey, editorConfig.selectedCircles[0])
          disableSelection()
          editorConfig.selectedCircles = []
          editorConfig.pressedKey = ''
          editorConfig.changingMove = false
          this.cueManager.drawCues(this.danceChart)
        }
      }
    }
  }
}
</script>
