<template>
  <v-container fluid class="ma-0 pa-0">
    <v-layout wrap>
      <v-flex xs12 md6>
        <v-toolbar dark flat tabs width="720">
          <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn fab small v-on="on" @click="goToSongSelection">
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
            <v-container pb-0>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-card flat>
                    <v-card-title primary-title>
                      Load Video
                    </v-card-title>
                    <v-card-actions>
                      <v-form ref="videoId">
                        <v-text-field box label="Video ID" prepend-inner-icon="movie" v-model="danceChart.videoId" :rules="songIdRules"></v-text-field>
                      </v-form>
                      <v-tooltip right>
                        <template v-slot:activator="{ on }">
                          <v-btn fab dark small v-on="on" @click="loadVideoById">
                            <v-icon>forward</v-icon>
                          </v-btn>
                        </template>
                        <span class="body-2">Load Video</span>
                      </v-tooltip>
                    </v-card-actions>
                  </v-card>
                </v-flex>
                <v-flex xs12>
                  <v-card flat>
                    <v-card-title primary-title>
                      Load Chart
                    </v-card-title>
                    <v-card-text>
                      <v-list dense two-line style="max-height: 200px; max-width: 300px" class="scroll-y blue lighten-5">
                        <v-list-tile
                          v-for="song in songs"
                          :key="song.chartId"
                          :class="selectedChart === song.chartId ? 'blue lighten' : ''"
                          @click="selectChart(song.chartId)"
                        >
                          <v-list-tile-content>
                            <v-list-tile-title>{{song.title}}</v-list-tile-title>
                            <v-list-tile-sub-title>{{song.artist}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn dark @click="loadChart(dataManager.getSongId($store.state.songs, selectedChart), selectedChart)">Load</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-flex>

                <v-flex xs12>
                  <v-card flat>
                    <v-card-title primary-title>
                      Save Chart
                    </v-card-title>
                    <v-card-actions>
                      <v-btn dark @click="saveToFirebase">Save Chart</v-btn>
                    </v-card-actions>
                    <v-alert class="yellow black--text" :value="duplicateChart" style="max-height: 50px">
                      There is already a dance chart for this video. Do you want to overwrite it?
                      <v-btn dark small @click="duplicateChart = !duplicateChart">cancel</v-btn><v-btn dark small @click="overwriteChart">overwrite</v-btn>
                    </v-alert>
                    <v-snackbar
                      v-model="saved"
                      left
                      color="green"
                      :timeout="3000"
                    >
                    <v-icon dark>done_outline</v-icon>
                      SAVED
                      <v-btn
                        flat
                        @click="saved = false"
                      >
                      Close
                      </v-btn>
                    </v-snackbar>
                    <v-snackbar
                      v-model="missingInfo"
                      left
                      warning
                      :timeout="3000"
                    >
                    <v-icon dark left>warning</v-icon>
                      Can't save if any information is missing. Check all fields.
                      <v-btn
                        flat
                        @click="missingInfo = false"
                      >
                      Close
                      </v-btn>
                    </v-snackbar>
                    <v-snackbar
                      v-model="existingChart"
                      left
                      warning
                      :timeout="3000"
                    >
                    <v-icon dark left>warning</v-icon>
                      There's a chart for this video already. It will be loaded.
                      <v-btn
                        flat
                        @click="existingChart = false"
                      >
                      Close
                      </v-btn>
                    </v-snackbar>
                  </v-card>
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
                    <v-btn dark block @click="saveInfo" :disabled="selectingArea">APPLY</v-btn>
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
      <v-flex xs12 md6>
        <v-container id="player"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
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
import animationManager from '../tools/editor/animations/animation-manager'
import drawSelection from '../tools/editor/containers/copyPasteSelection/draw-selection'
import enableSelection from '../tools/editor/circleSelection/enable-selection'
import disableSelection from '../tools/editor/circleSelection/disable-selection'
import copy from '../tools/editor/copyPaste/copy'
import paste from '../tools/editor/copyPaste/paste'
import moveToBeat from '../tools/editor/move-to-beat'
import * as PIXI from 'pixi.js'
import firebase from '../tools/config/firebase'
import dataManager from '../tools/editor/data-manager'

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
      dataManager: dataManager,
      gameTicker: null,
      selectingArea: false,
      duplicateChart: false,
      saved: false,
      missingInfo: false,
      charts: null,
      selectedChart: null,
      existingChart: false,
      settings: { offset: '0', videoStart: '0', videoEnd: '0', bpm: '150', title: '', artist: '' },
      timingRules: [ v => !!/\d*(\.)?\d+$/g.test(v) || 'input must be a valid number.' ],
      songInfoRules: [ v => !!v || 'Required.' ],
      songIdRules: [ v => v.length === 11 || 'Video IDs have 11 characters.' ]
    }
  },
  created () {
    this.editorView = new PIXI.Application(pixiConfig)
    this.gameTicker = new PIXI.ticker.Ticker()
    this.gameTicker.stop()
  },
  mounted () {
    setViewAndContainers(this.editorView)
    setInitialGraphics()
    setCueGraphics()
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.danceChart)
    this.moveManager = new MoveManager(this.songManager)
    this.noteManager = new NoteManager(this.songManager)
    this.cueManager = new CueManager(this.songManager, this.moveManager)

    this.gameTicker.add((deltaTime) => {
      animationManager.animate(this.player, this.songManager, this.cueManager, this.danceChart)
    })
    this.gameTicker.stop()

    this.player.on('paused', () => {
      this.gameTicker.stop()
      this.player.seek(this.songManager.getNearestBeatTime())
    })

    this.player.on('playing', () => {
      this.gameTicker.start()
    })
  },
  methods: {
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
      if (!this.selectingArea) {
        if (this.player.getState() === 'playing') {
          this.player.pause()
        } else {
          this.player.play()
        }
      }
    },
    startCopySelection: function () {
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        copy.start(this.songManager)
        drawSelection(this.songManager)
      }
    },
    endCopySelection: function () {
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        copy.end(this.songManager)
        copy.addSelectionToClipboard(this.danceChart)
      }
    },
    pasteMoves: function () {
      paste(this.danceChart, this.songManager, this.moveManager, this.noteManager)
    },
    startCreation: function (event) {
      if (this.player.getState() === 'paused' && !this.selectingArea && editorConfig.pressedKey === '') {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = event.key
        this.moveManager.addBeatToArray()
        this.noteManager.createNotes(event.key)
      }
    },
    stopCreation: function (event) {
      if (this.player.getState() === 'paused' && !this.selectingArea && editorConfig.pressedKey === event.key) {
        if (this.moveManager.isValidInsert(this.danceChart)) {
          this.moveManager.sortBeatArray()
          this.moveManager.addRequiredMoves(this.danceChart, event.key)
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[0]))
          this.moveManager.setCircleCount()
          this.selectingArea = true
          enableSelection()
        } else {
          this.noteManager.removeInvalidNotes(this.danceChart)
          this.moveManager.clearBeatArray()
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
        }
      }
      setTimeout(() => (animationManager.animate(this.player, this.songManager, this.cueManager, this.danceChart)), 200)
    },
    createNode: function (event) {
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        let moveType = this.moveManager.getCreatedMoveType(this.danceChart, event.key)
        if (moveType === 'H') {
          this.moveManager.setHoldNode(this.danceChart, event.key)
        } else if (moveType === 'M') {
          editorConfig.changingMove = true
          editorConfig.pressedKey = event.key
          this.selectingArea = true
          enableSelection()
        }
      }
    },
    deleteMove: function (event) {
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        this.moveManager.deleteMove(this.danceChart, event.key)
        this.noteManager.redraw(this.danceChart)
        animationManager.animate(this.player, this.songManager, this.cueManager, this.danceChart)
      }
    },
    dealWithSelection: function () {
      if (editorConfig.creatingMove) {
        if (editorConfig.selectedCircles.length === 1 && editorConfig.circleCount > 1) {
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[editorConfig.beatArray.length - 1]))
        } else if (editorConfig.selectedCircles.length === editorConfig.circleCount) {
          this.moveManager.addHandInfo(this.danceChart)
          this.noteManager.tintNotes()
          this.selectingArea = false
          disableSelection()
          this.moveManager.clearBeatArray()
          editorConfig.selectedCircles = []
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
        }
      } else if (editorConfig.changingMove) {
        if (editorConfig.selectedCircles.length === 1) {
          this.moveManager.changeMove(this.danceChart, this.songManager.nearestBeat, editorConfig.pressedKey, editorConfig.selectedCircles[0])
          this.selectingArea = false
          disableSelection()
          editorConfig.selectedCircles = []
          editorConfig.pressedKey = ''
          editorConfig.changingMove = false
        }
      }
      this.dataManager.sortDanceChart(this.danceChart)
      setTimeout(() => (animationManager.animate(this.player, this.songManager, this.cueManager, this.danceChart)), 200)
    },
    saveInfo: function () {
      if (this.$refs.timing.validate()) {
        this.moveManager.updateMoves(this.danceChart, parseInt(this.settings.bpm), danceChart.offset - parseFloat(this.settings.offset))
        this.dataManager.updateDanceChart(this.danceChart, this.settings)
        this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
        this.noteManager.redraw(this.danceChart)
        drawGuideNumbers(this.player, this.danceChart, this.songManager)
        redrawStaff(this.player, this.danceChart, this.songManager)
      }
    },
    saveToFirebase: function () {
      if (this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate()) {
        if (!this.dataManager.checkForVideoId(this.$store.state.songs, this.danceChart)) {
          this.dataManager.saveNewChart(this.danceChart, this.player)
          this.saved = true
        } else {
          this.duplicateChart = true
        }
      } else {
        this.missingInfo = true
      }
    },
    loadVideoById: function () {
      if (this.$refs.videoId.validate()) {
        let info = this.dataManager.searchSongByVideoId(this.$store.state.songs, this.danceChart.videoId)
        if (info !== null) {
          this.existingChart = true
          this.loadChart(info.songId, info.chartId)
        } else {
          this.player.load(this.danceChart.videoId, true)
          setTimeout(() => {
            drawGuideNumbers(this.player, this.danceChart, this.songManager)
            redrawStaff(this.player, this.danceChart, this.songManager)
          }, 4000)
        }
      }
    },
    selectChart: function (value) {
      this.selectedChart = value
    },
    loadChart: function (songId, chartId) {
      if (chartId !== '') {
        let p1 = firebase.database.ref(`charts/${chartId}`).once('value')
        let p2 = firebase.database.ref(`songs/${songId}`).once('value')

        Promise.all([p1, p2]).then((values) => {
          let loadedChart = {}
          values.forEach((value, i) => {
            value = value.val()
            if (value.hasOwnProperty('bpm')) {
              loadedChart.offset = value.offset
              loadedChart.moves = value.moves
              loadedChart.videoEnd = value.videoEnd
              loadedChart.videoStart = value.videoStart
              loadedChart.videoId = value.videoId
              loadedChart.bpm = value.bpm
            } else {
              loadedChart.title = value.title
              loadedChart.artist = value.artist
              this.danceChart.songId = songId
              this.danceChart.chartId = chartId
            }
          })
          this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
          this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
          this.noteManager.redraw(this.danceChart)
          drawGuideNumbers(this.player, this.danceChart, this.songManager)
          redrawStaff(this.player, this.danceChart, this.songManager)
          this.player.load(this.danceChart.videoId, true)
          setTimeout(() => {
            drawGuideNumbers(this.player, this.danceChart, this.songManager)
            redrawStaff(this.player, this.danceChart, this.songManager)
          }, 3000)
        }).catch(err => console.log(err))
      }
    },
    overwriteChart: function () {
      if (this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate()) {
        this.dataManager.overwriteChart(this.danceChart)
        this.duplicateChart = false
        this.saved = true
      } else {
        this.missingInfo = true
      }
    },
    goToSongSelection: function () {
      this.$store.commit('goToSongSelection')
    }
  },
  computed: {
    songs: function () {
      return this.$store.state.songs
    }
  }
}
</script>
