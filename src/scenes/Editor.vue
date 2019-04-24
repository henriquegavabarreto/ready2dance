<template>
  <v-container fluid class="ma-0 pa-0">
    <!-- <editorheader></editorheader> -->
    <button v-on:click="loadVideo">Load Video</button>
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
              Save/Load
              <v-icon>video_library</v-icon>
            </v-tab>

            <v-tab>
              Song Settings
              <v-icon>audiotrack</v-icon>
            </v-tab>

            <v-tab>
              About
              <v-icon>info</v-icon>
            </v-tab>

            <v-tab>
              Editor
              <v-icon>edit</v-icon>
            </v-tab>
          </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-container mt-5 ml-5>
            <v-layout row wrap justify-center>
              <v-flex xs12>
                <v-card-title primary-title>
                  <h2>Load Video</h2>
                </v-card-title>
              </v-flex>
              <v-flex xs8>
                <v-text-field box label="Video ID" prepend-inner-icon="movie"></v-text-field>
              </v-flex>
              <v-flex xs4>
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" fab dark small v-on="on" @click="testFirebase">
                      <v-icon>forward</v-icon>
                    </v-btn>
                  </template>
                  <span class="body-2">Load Video</span>
                </v-tooltip>
              </v-flex>
            </v-layout>
            <v-layout column wrap>
              <v-flex xs12>
                <v-card-title primary-title>
                  <h2>Load Chart</h2>
                </v-card-title>
                <ul>
                  <li>A</li>
                  <li>B</li>
                  <li>C</li>
                </ul>
                <v-btn dark>Load Chart</v-btn>
              </v-flex>
            </v-layout>
            <v-layout column wrap>
              <v-flex xs12>
                <v-card-title primary-title>
                  <h2>Save Chart</h2>
                </v-card-title>
                <v-btn dark>Save Chart</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-tab-item>

        <v-tab-item>
          <v-container pt-5 pl-5>
            <v-layout row wrap justify-space-between>
              <v-flex xs6 justify-start>
                <v-form ref="timing">
                  <v-layout row wrap pl-2>
                    <v-flex xs12>
                      <v-card-title primary-title>
                        <h2>Timing</h2>
                      </v-card-title>
                    </v-flex>
                    <v-flex xs8>
                      <v-text-field box label="Video Starting Point" prepend-inner-icon="movie" :placeholder="settings.videoStart" v-model="settings.videoStart" :rules="timingRules"></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-tooltip nudge-top="130" right>
                        <template v-slot:activator="{ on }">
                          <v-btn color="primary" fab dark small v-on="on" @click="settings.videoStart = player.getCurrentTime().toString()">
                            <v-icon>schedule</v-icon>
                          </v-btn>
                        </template>
                        <span class="body-2">Get Current Time</span>
                      </v-tooltip>
                    </v-flex>
                    <v-flex xs8>
                      <v-text-field box label="Video Ending Point" prepend-inner-icon="movie" :placeholder="settings.videoEnd" v-model="settings.videoEnd" :rules="timingRules"></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-tooltip nudge-top="130" right>
                        <template v-slot:activator="{ on }">
                          <v-btn color="primary" fab dark small v-on="on" @click="settings.videoEnd = player.getCurrentTime().toString()">
                            <v-icon>schedule</v-icon>
                          </v-btn>
                        </template>
                        <span class="body-2">Get Current Time</span>
                      </v-tooltip>
                    </v-flex>
                    <v-flex xs8>
                      <v-text-field box label="Song Offset" prepend-inner-icon="audiotrack" :placeholder="settings.offset" v-model="settings.offset" :rules="timingRules"></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-tooltip nudge-top="130" right>
                        <template v-slot:activator="{ on }">
                          <v-btn color="primary" fab dark small v-on="on" @click="settings.offset = player.getCurrentTime().toString()">
                            <v-icon>schedule</v-icon>
                          </v-btn>
                        </template>
                        <span class="body-2">Get Current Time</span>
                      </v-tooltip>
                    </v-flex>
                    <v-flex xs8>
                      <v-text-field box label="Song BPM" prepend-inner-icon="audiotrack" :placeholder="settings.bpm" v-model="settings.bpm" :rules="timingRules"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-flex>
              <v-flex xs6>
                <v-form ref="songInfo">
                  <v-layout row wrap pl-5>
                    <v-flex xs12>
                      <v-card-title text-xs-center primary-title>
                        <h2>Song</h2>
                      </v-card-title>
                    </v-flex>
                    <v-flex xs10>
                      <v-text-field box label="Title" prepend-inner-icon="audiotrack" :placeholder="settings.title" v-model="settings.title" :rules="songInfoRules" error--text="red"></v-text-field>
                    </v-flex>
                    <v-flex xs10>
                      <v-text-field box label="Artist" prepend-inner-icon="audiotrack" :placeholder="settings.artist" v-model="settings.artist" :rules="songInfoRules"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-flex>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-btn dark block @click="saveInfo">APPLY</v-btn>
                </v-flex>
              </v-layout>

            </v-layout>
          </v-container>
        </v-tab-item>

        <v-tab-item>
          <v-card flat>
            <v-card-text>HOW TO USE THIS EDITOR</v-card-text>
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
    </v-flex>
    <v-flex xs6>
      <v-container align-center justify-center id="player"/>
    </v-flex>
  </v-layout>
  </v-container>
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
import moveToBeat from '../tools/editor/move-to-beat'
import * as PIXI from 'pixi.js'
import firebase from '../tools/config/firebase'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      tabs: null,
      player: null,
      editorView: null,
      songManager: null,
      danceChart: danceChart,
      noteManager: null,
      moveManager: null,
      settings: { offset: '0', videoStart: '0', videoEnd: '0', bpm: '150', title: '', artist: '' },
      timingRules: [ v => !!/\d*(\.)?\d+$/g.test(v) || 'input must be a valid number.' ],
      songInfoRules: [ v => !!v || 'Required.' ]
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
      this.editorView.ticker.add(() => {
        updateTimeText(this.player)
        updateTimeline(this.songManager.currentBeat)
        if (this.player.getState() === 'playing') this.cueManager.drawCues(this.danceChart)
      })
    },
    drawNumbers: function () {
      drawGuideNumbers(this.player, this.danceChart, this.songManager)
      redrawStaff(this.player, this.danceChart, this.songManager)
    },
    moveToNextQuarterBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, 1)
    },
    moveToPreviousQuarterBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, -1)
    },
    moveToNextBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, 4)
    },
    moveToPreviousBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, -4)
    },
    playAndPause: function () {
      if (!editorConfig.areaSelect) {
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
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        copy.start(this.songManager)
        drawSelection(this.songManager)
      }
    },
    endCopySelection: function () {
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect) {
        copy.end(this.songManager)
        copy.addSelectionToClipboard(this.danceChart)
      }
    },
    pasteMoves: function () {
      paste(this.danceChart, this.songManager, this.moveManager, this.noteManager)
    },
    startCreation: function (event) {
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect && editorConfig.pressedKey === '') {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = event.key
        this.moveManager.addBeatToArray()
        this.noteManager.createNotes(event.key)
      }
    },
    stopCreation: function (event) {
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect && editorConfig.pressedKey === event.key) {
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
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect) {
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
      if (this.player.getState() === 'paused' && !editorConfig.areaSelect) {
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
    },
    saveInfo: function () {
      if (this.$refs.timing.validate()) {
        this.danceChart.offset = parseInt(this.settings.offset)
        this.danceChart.videoStart = parseInt(this.settings.videoStart)
        this.danceChart.videoEnd = parseInt(this.settings.videoEnd)
        this.danceChart.bpm = parseInt(this.settings.bpm)
        this.danceChart.title = this.settings.title
        this.danceChart.artist = this.settings.artist
        this.songManager.update(this.danceChart)
        this.moveManager.update(this.songManager)
        this.noteManager.update(this.songManager)
        this.cueManager.update(this.songManager, this.moveManager)
        this.drawNumbers()
      }
    },
    testFirebase: function () {
      var ref = firebase.database.ref('danceCharts')
      ref.once('value').then(function (data) {
        console.log(data.val())
      })
    }
  }
}
</script>
