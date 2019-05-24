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

        <v-tabs-items v-model="tabs" style="height: 698px;">
          <v-tab-item>
            <v-container pb-0>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-card>
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
                  <v-card>
                    <v-card-title primary-title>
                      Load Chart
                    </v-card-title>
                    <v-card-text>
                      <v-list dense three-line style="max-height: 200px; max-width: 400px;" class="scroll-y blue lighten-5">
                        <v-list-tile
                          v-for="(song, name) in songs"
                          :key="song.chartId"
                        >
                          <v-list-tile-content>
                            <v-list-tile-title>{{song.title}}</v-list-tile-title>
                            <v-list-tile-sub-title>{{song.artist}}</v-list-tile-sub-title>
                            <div >
                              <v-btn
                                v-for="(chartId, dif) in song.charts"
                                :key="dif"
                                small
                                @click="selectSong(name, chartId)"
                                :class="selectedChartId === chartId ? 'blue lighten' : ''">{{dif}}</v-btn>
                            </div>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn dark @click="loadChart(selectedSong, selectedChartId)">Load</v-btn>
                      <v-btn dark v-if="$store.state.user.type === 'admin'" color="red" @click="deleteChart(selectedSong, selectedChartId)">Delete</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-flex>

                <v-flex xs12>
                  <v-card>
                    <v-card-title primary-title>
                      Save Chart
                    </v-card-title>
                    <v-card-actions>
                      <v-select
                         :items="difficulties"
                         label="Difficulty"
                         outline
                         v-model="difficulty"
                         style="max-width: 150px; margin-right: 10px;"
                       ></v-select>
                      <v-btn dark @click="saveToFirebase" class="pt-0">Save Chart</v-btn>
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
      <v-flex xs12 md6 style="background-color: black;">
        <div id="player" style="width: 720px;">
        </div>
      </v-flex>
    </v-layout>
  </v-container>
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
          // should dataManager return a promise so we can toggle saved from here?
          this.dataManager.saveNewSong(this.danceChart, this.player, this.difficulty)
          this.saved = true
        } else {
          if (!this.songs[songId].charts.hasOwnProperty(this.difficulty)) { // if the song exists, but this difficulty has not been set
            this.dataManager.saveNewChart(this.danceChart, this.player, songId, this.difficulty)
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
        this.dataManager.overwriteChart(this.danceChart, this.songs[songId].charts[this.difficulty])
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
        let p1 = firebase.database.ref(`charts/${chartId}`).once('value')
        let p2 = firebase.database.ref(`songs/${songId}`).once('value')

        Promise.all([p1, p2]).then((values) => {
          let loadedChart = {}
          values.forEach((value, i) => {
            value = value.val()
            if (value.hasOwnProperty('bpm')) { // from chart node in the database
              loadedChart.offset = value.offset
              loadedChart.moves = value.moves
              loadedChart.videoEnd = value.videoEnd
              loadedChart.videoStart = value.videoStart
              loadedChart.videoId = value.videoId
              loadedChart.bpm = value.bpm
            } else { // from song node in the database
              loadedChart.title = value.title
              loadedChart.artist = value.artist
              this.danceChart.songId = songId
              this.danceChart.chartId = chartId
            }
          })
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
    deleteChart: function (songId, chartId) { // removes selected chart from the database
      if (chartId !== '') {
        let key = Object.keys(this.songs[songId].charts).find(key => this.songs[songId].charts[key] === chartId)
        if (Object.keys(this.songs[songId].charts).length === 1) {
          firebase.database.ref(`charts/${chartId}`).remove()
          firebase.database.ref(`songs/${songId}`).remove()
        } else {
          firebase.database.ref(`charts/${chartId}`).remove()
          firebase.database.ref(`songs/${songId}/charts/${key}`).remove()
        }
      }
    },
    goToSongSelection: function () { // goes back to song selection Scene
      // TODO : proper way to destroy all created pixi objects
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
      this.$store.commit('goToSongSelection')
    }
  },
  computed: { // All songs from database
    songs: function () { // return songs with sorted difficulty
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
