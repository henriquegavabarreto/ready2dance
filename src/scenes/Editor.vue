<template>
  <div style="min-height: 100vh;" id="background">
    <v-container fluid class="ma-0 pa-0">
      <v-layout row wrap justify-center>
        <v-flex xs12 md6 style="height: 100%;">
          <v-toolbar dark flat tabs>
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
                show-arrows
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
              <v-container fluid>
                <v-layout row wrap class="scroll-y">
                  <v-flex xs12>
                    <v-card style="border-radius: 10px;">
                      <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pt-2 pb-2">
                        <v-icon
                          left
                          color="black"
                        >
                        video_library
                        </v-icon>
                        Load Video
                      </v-card-title>
                      <v-card-actions class="justify-center pb-0 mb-0">
                        <v-form ref="videoId">
                          <v-text-field box label="Video ID" prepend-inner-icon="movie" v-model="danceChart.videoId" :rules="songIdRules"></v-text-field>
                        </v-form>
                        <v-tooltip right>
                          <template v-slot:activator="{ on }">
                            <v-btn fab dark small v-on="on" @click="loadVideoById"  class="mb-4 ml-3">
                              <v-icon>forward</v-icon>
                            </v-btn>
                          </template>
                          <span class="body-2">Load Video</span>
                        </v-tooltip>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                  <v-flex xs12>
                    <v-card class="mt-2" style="border-radius: 10px;">
                      <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pt-2 pb-2">
                        <v-icon
                          left
                          color="black"
                        >
                          queue_music
                        </v-icon>
                        Load Chart
                      </v-card-title>
                      <v-card-text class="ma-0 pa-0">
                        <v-container fluid class="ma-0 pa-0">
                          <v-layout row wrap justify-space-between class="scroll-y ma-0 pa-3" style="max-height: 32vh;">
                            <v-flex xs5 class="ma-1"
                              v-for="(song, name) in songs"
                              :key="song.chartId">
                              <v-card style="border-radius: 10px;" class="blue-grey lighten-5">
                                <v-card-title class="title font-weight-bold pb-1">
                                    {{song.title}}
                                </v-card-title>
                                <v-card-text class="pt-0 mt-0 body-2 pb-1">
                                  {{song.artist}}
                                </v-card-text>
                                <v-card-actions class="ma-0">
                                  <v-btn
                                    v-for="(chart, dif) in song.charts"
                                    :key="dif"
                                    @click="selectSong(name, chart.id)"
                                    :class="[selectedChartId === chart.id ? 'darken-1' : '', chart.draft ? 'yellow lighten-4 font-weight-bold' : 'green lighten-4 font-weight-bold']"
                                    small
                                    style="min-width: 0; width: 75px;"
                                    >{{dif}}</v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-card-actions class="justify-space-around">
                        <v-btn dark @click="loadChart(selectedSong, selectedChartId)">Load</v-btn>
                        <v-btn dark v-if="$store.state.user.type === 'admin'" color="red" @click="deleteChart = true">Delete</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>

                  <v-flex xs12>
                    <v-card style="border-radius: 10px;" class="mt-2">
                      <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pt-2 pb-2">
                        <v-icon
                          left
                          color="black"
                        >
                        done_outline
                        </v-icon>
                        Save Chart
                      </v-card-title>
                      <v-card-actions class="pb-0 mb-0">
                        <v-layout row wrap justify-space-between align-center>
                          <v-flex xs4>
                            <v-select
                               color="white"
                               :items="difficulties"
                               label="Difficulty"
                               outline
                               v-model="difficulty"
                               style="max-width: 150px; margin-right: 10px;"
                             ></v-select>
                          </v-flex>
                          <v-flex xs4>
                            <v-checkbox class="ml-5" color="blue" v-model="draft">
                              <template v-slot:label><span class="font-weight-bold">draft</span></template>
                            </v-checkbox>
                          </v-flex>
                          <v-flex xs4>
                            <v-btn dark @click="saveToFirebase" class="pt-0">Save Chart</v-btn>
                          </v-flex>
                        </v-layout>
                      </v-card-actions>
                      <v-snackbar
                        auto-height
                        v-model="duplicateChart"
                        class="black--text"
                        left
                        color="yellow"
                        :timeout="0"
                      >
                      This action will overwrite the existing version of this chart. Do you want do continue?
                      <v-btn dark small @click="overwriteChart">YES</v-btn><v-btn dark small @click="duplicateChart = !duplicateChart">NO</v-btn>
                      </v-snackbar>
                      <v-snackbar
                        auto-height
                        v-model="deleteChart"
                        class="black--text"
                        left
                        color="yellow"
                        :timeout="0"
                      >
                      This action will delete the selected chart. Do you want do continue?
                      <v-btn dark small @click="deleteSelectedChart(selectedSong, selectedChartId)">YES</v-btn><v-btn dark small @click="deleteChart = !deleteChart">NO</v-btn>
                      </v-snackbar>
                      <v-snackbar
                        auto-height
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
                        auto-height
                        v-model="missingInfo"
                        left
                        :timeout="5000"
                      >
                      <v-icon color="yellow" left>warning</v-icon>
                        Can't save if any information is missing. Check all fields.
                        <v-btn
                          flat
                          @click="missingInfo = false"
                        >
                        Close
                        </v-btn>
                      </v-snackbar>
                      <v-snackbar
                        auto-height
                        v-model="existingChart"
                        left
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
              <v-container fluid>
                <v-layout row wrap justify-space-around>
                  <v-flex xs5>
                    <v-card style="border-radius: 10px;">
                      <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pt-2 pb-2">
                        <v-icon
                          left
                          color="black"
                        >
                          timer
                        </v-icon>
                        Timing
                      </v-card-title>
                      <v-form ref="timing">
                        <v-card-text>
                          <v-text-field box label="Video Starting Point" prepend-inner-icon="movie" :placeholder="settings.videoStart" v-model="settings.videoStart" :rules="timingRules">
                            <template v-slot:append-outer>
                              <v-tooltip right>
                                <template v-slot:activator="{ on }">
                                  <v-btn fab dark small v-on="on" @click="settings.videoStart = player.getCurrentTime().toString()">
                                    <v-icon>schedule</v-icon>
                                  </v-btn>
                                </template>
                                <span class="body-2">Get Current Video Time</span>
                              </v-tooltip>
                            </template>
                          </v-text-field>
                          <v-text-field box label="Video Ending Point" prepend-inner-icon="movie" :placeholder="settings.videoEnd" v-model="settings.videoEnd" :rules="timingRules">
                            <template v-slot:append-outer>
                              <v-tooltip right>
                                <template v-slot:activator="{ on }">
                                  <v-btn fab dark small v-on="on" @click="settings.videoEnd = player.getCurrentTime().toString()">
                                    <v-icon>schedule</v-icon>
                                  </v-btn>
                                </template>
                                <span class="body-2">Get Current Video Time</span>
                              </v-tooltip>
                            </template>
                          </v-text-field>
                          <v-text-field box label="Song Offset" prepend-inner-icon="audiotrack" :placeholder="settings.offset" v-model="settings.offset" :rules="timingRules">
                            <template v-slot:append-outer>
                              <v-tooltip right>
                                <template v-slot:activator="{ on }">
                                  <v-btn fab dark small v-on="on" @click="settings.offset = player.getCurrentTime().toString()">
                                    <v-icon>schedule</v-icon>
                                  </v-btn>
                                </template>
                                <span class="body-2">Get Current Video Time</span>
                              </v-tooltip>
                            </template>
                          </v-text-field>
                          <v-text-field style="width: 74%;" box label="Song BPM" prepend-inner-icon="audiotrack" :placeholder="settings.bpm" v-model="settings.bpm" :rules="timingRules"></v-text-field>
                        </v-card-text>
                      </v-form>
                    </v-card>
                  </v-flex>
                  <v-flex xs5>
                    <v-card style="border-radius: 10px;">
                      <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pt-2 pb-2">
                        <v-icon
                          left
                          color="black"
                        >
                          music_note
                        </v-icon>
                        Song
                      </v-card-title>
                      <v-form ref="songInfo">
                        <v-card-text>
                          <v-text-field box label="Title" prepend-inner-icon="audiotrack" :placeholder="settings.title" v-model="settings.title" :rules="songInfoRules" error--text="red"></v-text-field>
                          <v-text-field box label="Artist" prepend-inner-icon="audiotrack" :placeholder="settings.artist" v-model="settings.artist" :rules="songInfoRules"></v-text-field>
                        </v-card-text>
                      </v-form>
                    </v-card>
                  </v-flex>
                  <v-flex xs12>
                    <v-btn block large class="mt-5" @click="saveInfo" :disabled="selectingArea">APPLY</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-tab-item>

            <v-tab-item>
              <v-card flat>
                <v-card-text>HOW TO USE THIS EDITOR</v-card-text>
              </v-card>
            </v-tab-item>

            <v-tab-item>
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
            </v-tab-item>
          </v-tabs-items>
        </v-flex>
        <v-flex xs12 md6 class="text-xs-center ma-0 pa-0" id="player">
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import playerConfig from '../tools/editor/config/youtube-player'
import pixiConfig from '../tools/editor/config/pixi-config'
import addContainers from '../tools/editor/containers/add-containers'
import createTextures from '../tools/editor/containers/create-textures'
import setInitialGraphics from '../tools/editor/containers/set-initial-graphics'
import SongManager from '../tools/config/song-manager'
import MoveManager from '../tools/editor/moves/move-manager'
import NoteManager from '../tools/editor/notes/note-manager'
import CueManager from '../tools/config/cue-manager'
import danceChart from '../tools/editor/data/dance-chart'
import editorConfig from '../tools/editor/config/editor-config'
import drawGuideNumbers from '../tools/editor/containers/guideNumbers/draw-guide-numbers'
import drawStaff from '../tools/editor/containers/backgroundStaff/draw-staff'
import animationManager from '../tools/editor/animations/animation-manager'
import drawSelection from '../tools/editor/containers/copyPasteSelection/draw-selection'
import enableSelection from '../tools/editor/circleSelection/enable-selection'
import disableSelection from '../tools/editor/circleSelection/disable-selection'
import copy from '../tools/editor/copyPaste/copy'
import paste from '../tools/editor/copyPaste/paste'
import moveToBeat from '../tools/editor/move-to-beat'
import grid from '../tools/editor/config/grid'
import * as PIXI from 'pixi.js'
import firebase from '../tools/config/firebase'
import dataManager from '../tools/editor/data-manager'

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      tabs: null,
      difficulties: [ 'easy', 'medium', 'hard' ],
      difficulty: '',
      draft: true,
      player: null,
      editorApp: null,
      ticker: null,
      containers: { master: {}, auxiliary: {} },
      textures: {},
      songManager: null,
      danceChart: danceChart,
      noteManager: null,
      moveManager: null,
      dataManager: dataManager,
      selectingArea: false,
      duplicateChart: false,
      deleteChart: false,
      saved: false,
      missingInfo: false,
      charts: null,
      existingChart: false,
      settings: { offset: '0', videoStart: '0', videoEnd: '0', bpm: '150', title: '', artist: '' },
      timingRules: [ v => !!/\d*(\.)?\d+$/g.test(v) || 'input must be a valid number.' ],
      songInfoRules: [ v => !!v || 'Required.' ],
      songIdRules: [ v => v.length === 11 || 'Video IDs have 11 characters.' ]
    }
  },
  created () { // creates pixi app, a ticker for the game graphics and stops the shared ticker, that will be started only when necessary (dealing with selection)
    this.editorApp = new PIXI.Application(pixiConfig)
    this.ticker = new PIXI.ticker.Ticker()
  },
  mounted () { // set containers, graphics, player and managers. Starts the ticker
    addContainers(this.editorApp, this.containers)
    document.getElementById('canvas').appendChild(this.editorApp.view)
    createTextures(this.editorApp, this.textures)
    setInitialGraphics(this.containers, this.textures)
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.danceChart)
    this.moveManager = new MoveManager(this.songManager)
    this.noteManager = new NoteManager(this.songManager)
    this.cueManager = new CueManager(this.songManager, editorConfig, grid)

    this.ticker.add(() => {
      animationManager.animate(this.songManager, this.containers, this.cueManager, this.danceChart)
      if (this.player.getState() === 'playing') this.cueManager.drawDynamicCues(this.danceChart.moves, this.textures.cues)
    })

    this.ticker.start()

    this.player.on('playing', () => {
      this.cueManager.setCurrentIndex(this.danceChart)
      this.cueManager.holdsToDraw = []
      this.cueManager.movesToDraw = []
    })

    window.addEventListener('resize', this.resizeWindow())
    this.resize()
  },
  methods: {
    moveToNextQuarterBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, 1)
    },
    moveToPreviousQuarterBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, -1)
    },
    moveToNextBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, 4)
    },
    moveToPreviousBeat: function () {
      // eslint-disable-next-line
      moveToBeat (this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, -4)
    },
    playAndPause: function () { // shortcut for play and pause when canvas is selected
      if (!this.selectingArea) {
        if (this.player.getState() === 'playing') {
          this.player.pause()
        } else {
          this.player.play()
        }
      }
    },
    startCopySelection: function () { // starts copy selection
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        copy.start(this.songManager)
        drawSelection(this.songManager, this.containers, this.textures)
        this.containers.auxiliary.copyPasteSelection.visible = true
      }
    },
    endCopySelection: function () { // gets all moves between first and last note on the selection
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        copy.end(this.songManager)
        copy.addSelectionToClipboard(this.danceChart)
        this.containers.auxiliary.copyPasteSelection.visible = false
      }
    },
    pasteMoves: function () { // paste all selection. Starts on nearestBeat
      paste(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.containers, this.textures)
    },
    startCreation: function (event) { // starts move/note creation process
      if (this.player.getState() === 'paused' && !this.selectingArea && editorConfig.pressedKey === '') {
        editorConfig.creatingMove = true
        editorConfig.pressedKey = event.key
        this.moveManager.addBeatToArray()
        this.noteManager.createNotes(event.key, this.containers, this.textures)
      }
    },
    stopCreation: function (event) { // Happens before dealWithSelection
      if (this.player.getState() === 'paused' && !this.selectingArea && editorConfig.pressedKey === event.key) {
        if (this.moveManager.isValidInsert(this.danceChart)) { // if there are no notes on top of each other, proceed to next phase
          this.moveManager.sortBeatArray()
          this.moveManager.addRequiredMoves(this.danceChart, event.key)
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[0]))
          this.moveManager.setCircleCount()
          this.selectingArea = true
          enableSelection(this.containers)
        } else { // if there are notes overlapping, delete all invalid notes
          this.noteManager.removeInvalidNotes(this.danceChart)
          this.moveManager.clearBeatArray()
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
        }
      }
    },
    createNode: function (event) { // creates a node for Hold or Motion notes
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        let moveType = this.moveManager.getCreatedMoveType(this.danceChart, event.key)
        if (moveType === 'H') {
          this.moveManager.setHoldNode(this.danceChart, event.key)
        } else if (moveType === 'M') {
          editorConfig.changingMove = true
          editorConfig.pressedKey = event.key
          this.selectingArea = true
          enableSelection(this.containers)
        }
      }
    },
    deleteMove: function (event) { // deletes a move and redraws notes
      if (this.player.getState() === 'paused' && !this.selectingArea) {
        this.moveManager.deleteMove(this.danceChart, event.key, this.noteManager, this.containers)
      }
    },
    dealWithSelection: function () { // What happens after selection occurs. this event is triggered every time the user clicks the canvas
      if (editorConfig.creatingMove) { // on creating mode
        if (editorConfig.selectedCircles.length === 1 && editorConfig.circleCount > 1) {
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[editorConfig.beatArray.length - 1]))
        } else if (editorConfig.selectedCircles.length === editorConfig.circleCount) {
          this.moveManager.addHandInfo(this.danceChart)
          this.noteManager.tintNotes(this.containers)
          this.selectingArea = false
          disableSelection(this.containers)
          this.moveManager.clearBeatArray()
          editorConfig.selectedCircles = []
          editorConfig.creatingMove = false
          editorConfig.pressedKey = ''
        }
      } else if (editorConfig.changingMove) { // on changing move mode
        if (editorConfig.selectedCircles.length === 1) {
          this.moveManager.changeMove(this.danceChart, this.songManager.nearestBeat, editorConfig.pressedKey, editorConfig.selectedCircles[0])
          this.selectingArea = false
          disableSelection(this.containers)
          editorConfig.selectedCircles = []
          editorConfig.pressedKey = ''
          editorConfig.changingMove = false
        }
      }
      this.dataManager.sortDanceChart(this.danceChart)
    },
    saveInfo: function () { // this saves the input from the options tab to the danceChart
      if (this.$refs.timing.validate()) {
        this.moveManager.updateMoves(this.danceChart, parseInt(this.settings.bpm), danceChart.offset - parseFloat(this.settings.offset))
        this.dataManager.updateDanceChart(this.danceChart, this.settings)
        this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
        this.noteManager.redraw(this.danceChart, this.containers, this.textures)
        drawGuideNumbers(this.player, this.danceChart, this.songManager)
        drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
      }
    },
    saveToFirebase: function () { // saves chart to firebase if all information is correct and videoId is unique
      if (this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate() && this.difficulties.indexOf(this.difficulty) !== -1) {
        let songId = this.dataManager.getSongIdByVideoId(this.songs, this.player.videoId)
        if (songId === '') { // if there is no song with this videoId
          this.dataManager.saveNewSong(this.danceChart, this.player, this.difficulty, this.draft, this.$store.state.user.username)
          this.saved = true
        } else {
          if (!this.songs[songId].charts.hasOwnProperty(this.difficulty)) { // if the song exists, but this difficulty has not been set
            this.dataManager.saveNewChart(this.danceChart, this.player, songId, this.difficulty, this.draft, this.$store.state.user.username)
            this.saved = true
          } else { // if there is the set difficulty for this song id
            this.duplicateChart = true
          }
        }
      } else {
        this.missingInfo = true
      }
    },
    overwriteChart: function () { // updates a danceChart with existing video Id in the database
      if (this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate()) {
        let songId = this.dataManager.getSongIdByVideoId(this.songs, this.player.videoId)
        this.dataManager.overwriteChart(this.danceChart, this.songs[songId].charts[this.difficulty].id, songId, this.difficulty, this.draft, this.$store.state.user.username)
        this.duplicateChart = false
        this.saved = true
      } else {
        this.missingInfo = true
      }
    },
    loadVideoById: function () { // loads a video according to the input. If the video already has a chart, it will be loaded
      if (this.$refs.videoId.validate()) {
        this.player.load(this.danceChart.videoId, true)
        setTimeout(() => {
          drawGuideNumbers(this.player, this.danceChart, this.songManager)
          drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
        }, 4000)
      }
    },
    selectSong: function (songId, chartId) { // changes selected song in the store with the given song id
      this.$store.commit('selectSong', songId)
      this.$store.commit('selectChart', chartId)
    },
    loadChart: function (songId, chartId) { // pulls chart info from the database and applies to the danceChart and settings tab
      if (chartId !== '') {
        let loadedChart = {}
        firebase.database.ref(`charts/${chartId}`).once('value', (data) => {
          let value = data.val()
          loadedChart.offset = value.offset
          loadedChart.moves = value.moves
          loadedChart.videoEnd = value.videoEnd
          loadedChart.videoStart = value.videoStart
          loadedChart.videoId = value.videoId
          loadedChart.bpm = value.bpm

          loadedChart.title = this.$store.state.songs[songId].title
          loadedChart.artist = this.$store.state.songs[songId].artist
          this.danceChart.songId = songId
          this.danceChart.chartId = chartId
        }).then(() => {
          this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
          this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
          this.noteManager.redraw(this.danceChart, this.containers, this.textures)
          this.player.load(this.danceChart.videoId, true)
          setTimeout(() => {
            drawGuideNumbers(this.player, this.danceChart, this.songManager)
            drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
          }, 3000)
        }).catch(err => console.log(err))
      }
    },
    deleteSelectedChart: function (songId, chartId) { // removes selected chart from the database
      if (chartId !== '') {
        let key = Object.keys(this.songs[songId].charts).find(key => this.songs[songId].charts[key].id === chartId)
        if (Object.keys(this.songs[songId].charts).length === 1) {
          firebase.database.ref(`charts/${chartId}`).remove()
          firebase.database.ref(`songs/${songId}`).remove()
        } else {
          firebase.database.ref(`charts/${chartId}`).remove()
          firebase.database.ref(`songs/${songId}/charts/${key}`).remove()
        }
        this.deleteChart = false
      }
    },
    goToSongSelection: function () { // goes back to song selection Scene
      this.player.stop()
      this.player.destroy()
      for (let texture in this.textures) {
        this.textures[texture].destroy()
      }
      for (let container in this.containers.auxiliary) {
        this.containers.auxiliary[container].destroy(true)
      }
      for (let container in this.containers.master) {
        this.containers.master[container].destroy()
      }
      this.ticker.stop()
      this.ticker.destroy()
      this.editorApp.destroy()
      window.removeEventListener('resize', this.resizeWindow)
      window.onresize = null
      this.$store.commit('goToScene', 'song-selection')
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
      if (this.$vuetify.breakpoint.mdAndUp) {
        w = (window.innerWidth) / 2
        h = (window.innerWidth / ratio) / 2
      } else {
        if (window.innerWidth / window.innerHeight >= ratio) {
          w = window.innerHeight * ratio
          h = window.innerHeight
        } else {
          w = window.innerWidth
          h = window.innerWidth / ratio
        }
      }
      this.editorApp.view.style.width = w + 'px'
      this.editorApp.view.style.height = h + 'px'
    }
  },
  computed: {
    songs: function () {
      let sortedDif = {}
      for (let song in this.$store.state.songs) {
        let info = this.$store.state.songs[song]
        let order = ['easy', 'medium', 'hard']
        let sortedChart = Object.entries(info.charts).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
        info.charts = Object.fromEntries(sortedChart)
        sortedDif[song] = info
      }
      return sortedDif
    },
    selectedSong: function () { // changes the selected song from the list
      return this.$store.state.selectedSong
    },
    selectedChartId: function () {
      return this.$store.state.selectedChartId
    }
  }
}
</script>
<style scoped>
#background {
  background: rgb(3,3,3);
  background: linear-gradient(140deg, rgba(3,3,3,1) 0%, rgba(139,0,232,1) 6%, rgba(211,146,255,1) 12%, rgba(139,0,232,1) 18%, rgba(0,0,0,1) 46%, rgba(0,0,0,1) 55% ,rgba(29,240,255,1) 82%, rgba(146,250,255,1) 92%, rgba(29,240,255,1) 96%, rgba(0,0,0,1) 100%);
}
</style>
