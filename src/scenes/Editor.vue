<template>
  <div style="min-height: 100vh;" id="background">
    <v-container fluid class="ma-0 pa-0">
      <v-layout row wrap justify-center>
        <v-flex xs12 md6 class="ma-0 pa-0" style="height: 100%;">
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
              height="55"
              show-arrows
              v-model="tabs"
            >
              <v-tabs-slider color="yellow"></v-tabs-slider>

              <v-tab>
                Save & Load
                <v-icon>video_library</v-icon>
              </v-tab>

              <v-tab>
                Song & Timing
                <v-icon>audiotrack</v-icon>
              </v-tab>

              <v-tab>
                Help
                <v-icon>info</v-icon>
              </v-tab>

              <v-tab @click="focusOnEditor">
                Editor
                <v-icon>edit</v-icon>
              </v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-items v-model="tabs">
            <v-tab-item>
              <v-container fluid class="ma-0 pa-0">
                <v-layout row wrap class="scroll-y">
                  <v-expansion-panel>
                    <v-expansion-panel-content class="headline yellow darken-1 elevation-5 font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            queue_music
                          </v-icon>
                          Load</div>
                      </template>
                      <v-card>
                        <v-card-text class="ma-0 pa-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-layout row wrap justify-space-between class="scroll-y ma-0 pa-3" style="max-height: 70vh;">
                              <!-- load video by id -->
                              <v-flex xs12>
                                <v-card>
                                  <v-card-title>
                                    Load Video
                                  </v-card-title>
                                  <v-card-actions class="py-0">
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
                              <v-flex xs12 class="my-3">
                                  <v-card>
                                    <v-card-title>
                                      Load From File
                                    </v-card-title>
                                    <v-card-actions>
                                      <input type="file" accept="application/json" @change="importFromJSON">
                                    </v-card-actions>
                                  </v-card>
                                </v-flex>
                              <v-card class="mt-3" style="min-width: 100%">
                                <v-card-title>
                                  Load Chart
                                </v-card-title>
                                <v-card-text>
                                  <v-layout row wrap class="justify-space-around">
                                    <v-flex xs5 class="ma-1"
                                      v-for="song in songs"
                                      :key="song.chartId"
                                      @click="selectSongAndVideoId(song, song.general.songId)">
                                      <v-card style="border-radius: 10px;" :class="song.general.videoId === danceChart.videoId ? 'blue lighten-2' : 'blue lighten-5'">
                                        <v-card-title class="title font-weight-bold pb-1">
                                          {{song.general.title}}
                                        </v-card-title>
                                        <v-card-text class="pt-0 mt-0 body-2 pb-1">
                                          {{song.general.artist}}
                                        </v-card-text>
                                        <v-card-actions class="ma-0">
                                          <v-btn
                                            v-for="(chart, dif) in song.charts"
                                            :key="dif"
                                            @click="selectChart(song, chart.id, dif)"
                                            :class="chart.draft ? 'yellow lighten-3 font-weight-bold' : 'green lighten-3 font-weight-bold'"
                                            small
                                            style="min-width: 0; width: 75px;"
                                            >{{dif}}</v-btn>
                                        </v-card-actions>
                                      </v-card>
                                    </v-flex>
                                  </v-layout>
                                  <div v-if="songs.length === 0">
                                    You didn't create a chart yet.
                                  </div>
                                </v-card-text>
                                <v-card-actions>
                                  <v-flex xs12 class="text-sm-center">
                                    <v-btn :disabled="$store.state.pageCounter === 1 || $store.state.queryState === 'first'" color="primary" @click="loadPreviousPage()">Previous</v-btn>
                                    <v-btn :disabled="$store.state.queryState === 'last'" color="primary" @click="loadNextPage()">Next</v-btn>
                                  </v-flex>
                                </v-card-actions>
                              </v-card>
                            </v-layout>
                          </v-container>
                        </v-card-text>
                        <v-card-actions class="justify-space-around">
                          <v-btn @click="loadChart(selectedChartId)">Load</v-btn>
                          <v-btn dark color="red" @click="selectToDelete()">Delete</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content class="yellow darken-1 elevation-5 headline font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            done_outline
                          </v-icon>
                          Save</div>
                      </template>
                      <v-card>
                        <v-card-text>
                          <v-card color="grey lighten-3">
                            <v-card-title primary-title class="justify-center pa-2 title">
                              Chart Information
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-card-text>
                              <v-container grid-list-xs class="ma-0 pa-0">
                                <v-layout row wrap class="ma-0 pa-0">
                                  <v-flex xs6 class="body-2 pa-1">
                                    <div class="mt-1 pa-1">
                                      BPM: {{ danceChart.bpm }}
                                    </div>
                                    <div class="mt-1 pa-1">
                                      Offset: {{ danceChart.offset }}
                                    </div>
                                    <div class="mt-1 pa-1">
                                      Start: {{ danceChart.videoStart }}
                                    </div>
                                    <div class="mt-1 pa-1">
                                      End: {{ actualVideoEnd }}
                                    </div>
                                    <div class="mt-1 pa-1">
                                      Draft: {{ draft ? 'Yes' : 'No' }}
                                    </div>
                                    <div :class="difficulty === '' ? 'red lighten-3 mt-1 pa-1' : 'mt-1 pa-1'" style="border-radius: 5px;">
                                      Difficulty: {{ difficulty === '' ? 'Not Selected' : difficulty }}
                                    </div>
                                    <div :class="danceChart.moves.length === 0 ? 'red lighten-3 mt-1 pa-1' : 'mt-1 pa-1'" style="border-radius: 5px;">
                                      Beats with moves: {{ danceChart.moves.length }}
                                    </div>
                                  </v-flex>
                                  <v-flex xs6 class="body-2 pa-1">
                                    <div :class="danceChart.title === '' ? 'red lighten-3 mt-1 pa-1' : 'mt-1 pa-1'" style="border-radius: 5px;">
                                      Title: {{ danceChart.title }}
                                    </div>
                                    <div :class="danceChart.artist === '' ? 'red lighten-3 mt-1 pa-1' : 'mt-1 pa-1'" style="border-radius: 5px;">
                                      Artist: {{ danceChart.artist }}
                                    </div>
                                    <div :class="danceGenre === '' ? 'red lighten-3 mt-1 pa-1' : 'mt-1 pa-1'" style="border-radius: 5px;">
                                      Genre: {{ danceGenre === '' ? 'Not Selected' : danceGenre }}
                                    </div>
                                  </v-flex>
                                </v-layout>
                              </v-container>
                            </v-card-text>
                          </v-card>
                        </v-card-text>
                        <v-card-text class="py-0 my-0">
                          <v-layout row wrap justify-space-between align-center>
                            <v-flex xs3 class="mr-1">
                              <v-select
                                 :items="difficulties"
                                 label="Difficulty"
                                 outline
                                 v-model="difficulty"
                                 style="max-width: 150px;"
                               ></v-select>
                            </v-flex>
                            <v-flex xs3 class="mr-1">
                              <v-select
                                 :items="danceGenres"
                                 label="Genre"
                                 outline
                                 v-model="danceGenre"
                                 style="max-width: 150px;"
                               ></v-select>
                            </v-flex>
                            <v-flex xs3 class="ml-3">
                              <v-checkbox color="blue" v-model="draft" label="draft">
                              </v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-card-text>
                        <v-card-actions class="py-3 my-0">
                          <v-layout row wrap justify-space-around align-center>
                            <v-btn color="red" dark @click="eraseAll = true">Erase all moves</v-btn>
                            <v-btn color="purple" dark @click="testChart" :disabled="testable" class="mr-3">Test</v-btn>
                            <v-btn color="green" dark @click="saveToFirebase" class="pt-0 mr-3">Save Chart</v-btn>
                            <v-btn color="blue" dark @click="exportToJSON" class="pt-0 mr-3">Export Chart</v-btn>
                          </v-layout>
                        </v-card-actions>
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-layout>
              </v-container>
            </v-tab-item>

            <v-tab-item>
              <v-container fluid class="ma-0 pa-0">
                <v-layout row wrap justify-space-around class="ma-0 pa-0">
                  <v-expansion-panel expand focusable>
                    <v-expansion-panel-content class="headline yellow darken-1 elevation-5 font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            music_note
                          </v-icon>
                          Song Details</div>
                      </template>
                      <v-card>
                        <v-form ref="songInfo">
                          <v-card-text class="ma-0 pa-2">
                            <v-text-field box label="Title" prepend-inner-icon="audiotrack" :placeholder="settings.title" v-model="settings.title" :rules="songInfoRules" error--text="red"></v-text-field>
                            <v-text-field box label="Artist" prepend-inner-icon="audiotrack" :placeholder="settings.artist" v-model="settings.artist" :rules="songInfoRules"></v-text-field>
                          </v-card-text>
                        </v-form>
                        <v-card-actions class="justify-center">
                          <v-btn block large color="primary" @click="saveSongInfo">APPLY</v-btn>
                        </v-card-actions>
                      </v-card>

                    </v-expansion-panel-content>
                    <v-expansion-panel-content class="headline yellow darken-1 elevation-5 font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            timer
                          </v-icon>
                          Timing</div>
                      </template>
                      <v-card>
                        <v-form ref="timing">
                          <v-card-text class="ma-0 pa-0">
                            <v-container class="ma-0 pa-0">
                              <v-layout row wrap class="ma-0 pa-0">
                                <v-flex xs6 class="px-3 pt-2 align-content-center">
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
                                </v-flex>
                                <v-flex xs6 class="px-3 pt-2">
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
                                  <v-text-field style="width: 74%;" box label="Song BPM" prepend-inner-icon="audiotrack" :placeholder="settings.bpm" v-model="settings.bpm" :rules="timingRules"></v-text-field>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-card-text>
                        </v-form>
                        <v-card-actions class="justify-center">
                          <v-btn block large color="primary" @click="saveTimingInfo" :disabled="selectingArea">APPLY</v-btn>
                        </v-card-actions>
                      </v-card>

                    </v-expansion-panel-content>

                    <v-expansion-panel-content class="headline yellow darken-1 elevation-5 font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            build
                          </v-icon>
                          Tools</div>
                      </template>
                      <v-card>
                        <v-container>
                          <v-layout row wrap class="justify-space-around align-center">
                            <v-flex xs5>
                              <v-card>
                                <v-card-text>
                                  <!-- metronome -->
                                  <v-checkbox class="ma-0" color="blue" v-model="enableMetronome" :label="metronomeLabel"></v-checkbox>
                                </v-card-text>
                              </v-card>
                            </v-flex>
                            <v-flex xs5>
                              <!-- tap bpm -->
                              <TapBpm></TapBpm>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-layout>
              </v-container>
            </v-tab-item>

            <v-tab-item>
              <instructions></instructions>
            </v-tab-item>

            <v-tab-item>
              <div id="canvas" tabindex="0"
              @keydown.arrow-down="moveToNextQuarterBeat"
              @keydown.arrow-up="moveToPreviousQuarterBeat"
              @keydown.arrow-right="moveToNextBeat"
              @keydown.arrow-left="moveToPreviousBeat"
              @keyup.p="playAndPause"
              @keyup.space="playAndPause"
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
        <v-flex xs12 md6 class="text-xs-center ma-0 pa-0" id="player"></v-flex>
      </v-layout>
      <v-snackbar
        auto-height
        v-model="duplicateChart"
        class="black--text"
        left
        color="yellow"
        :timeout="0"
      >
        <p class="pa-0 ma-0">This action will overwrite the existing version of the <span class="font-weight-bold">{{duplicate.difficulty}}</span> chart for <span class="font-weight-bold">{{duplicate.song.general.title}} / {{duplicate.song.general.artist}}</span>. Do you want do continue?</p>
        <v-btn dark small @click="overwriteChart">YES</v-btn><v-btn dark small @click="duplicateChart = !duplicateChart">NO</v-btn>
      </v-snackbar>
      <v-snackbar
        auto-height
        v-model="deleteChart"
        class="white--text"
        left
        color="red"
        :timeout="0"
        v-if="$store.state.selectedDifficulty"
      >
        <p class="pa-0 ma-0">This action will delete permanently the existing version of the <span class="font-weight-bold">{{toDelete.dif}}</span> chart for <span v-if="toDelete.song" class="font-weight-bold">{{toDelete.song.general.title}} / {{toDelete.song.general.artist}}</span>. Do you want do continue?</p>
      <v-btn dark small @click="deleteSelectedChart()">YES</v-btn><v-btn dark small @click="deleteChart = !deleteChart">NO</v-btn>
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
        v-model="warningSnack"
        left
        :timeout="0"
      >
      <v-icon color="yellow" left>warning</v-icon>
        {{ warningText }}
        <v-btn
          flat
          @click="warningSnack = false"
        >
        Close
        </v-btn>
      </v-snackbar>
      <v-snackbar
        v-if="$store.state.selectedSong && $store.state.selectedDifficulty"
        auto-height
        v-model="existingChart"
        color="blue"
        :timeout="8000"
      >
      <p class="pa-0 ma-0">Loading the <span class="font-weight-bold">{{$store.state.selectedDifficulty.toUpperCase()}}</span> chart for <span class="font-weight-bold">{{$store.state.selectedSong.title}} / {{$store.state.selectedSong.artist}}</span></p>
        <v-btn
          flat
          @click="existingChart = false"
        >
        Close
        </v-btn>
      </v-snackbar>
      <v-snackbar
        auto-height
        v-model="eraseAll"
        class="black--text"
        left
        color="yellow"
        :timeout="0"
      >
        <p class="pa-0 ma-0">This action will erase all moves of the current chart. If a chart is saved, this action does not affect the saved version. Do you want do continue?</p>
        <v-btn dark small @click="eraseAllMoves">YES</v-btn><v-btn dark small @click="eraseAll = !eraseAll">NO</v-btn>
      </v-snackbar>
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
import EditorInstructions from '../components/EditorInstructions'
import TapBpm from '../components/TapBpm'

const YTPlayer = require('yt-player')
const YouTube = require('simple-youtube-api')

export default {
  components: {
    'instructions': EditorInstructions,
    'TapBpm': TapBpm
  },
  data () {
    return {
      tabs: null,
      difficulties: [ 'easy', 'medium', 'hard' ],
      difficulty: '',
      danceGenres: [ 'parapara', 'techpara', 'trapara' ],
      danceGenre: '',
      draft: true,
      enableMetronome: false,
      player: null,
      editorApp: null,
      ticker: null,
      youtube: null,
      ytKeyRg: /(paralist|parapara|eurobeat|techpara|techno|trapara|trance|パラパラ|ユーロ|ユーロビート|テクパラ|テクノ|トラパラ|トランス|わたクラ|スタファ)/gi,
      containers: { master: {}, auxiliary: {} },
      textures: {},
      songManager: null,
      danceChart: danceChart,
      noteManager: null,
      moveManager: null,
      dataManager: dataManager,
      selectingArea: false,
      duplicateChart: false,
      duplicate: {
        id: '',
        difficulty: '',
        song: {
          general: {
            title: '',
            artist: ''
          }
        }
      },
      toDelete: {
        song: null,
        chartId: '',
        dif: ''
      },
      selectedSongId: '',
      deleteChart: false,
      saved: false,
      warningSnack: false,
      warningText: '',
      charts: null,
      existingChart: false,
      audioCtx: null,
      latestMetronomeBeat: 0,
      lastBeat: 0,
      settings: { offset: '0', videoStart: '0', videoEnd: '0', bpm: '200', title: '', artist: '' },
      timingRules: [ v => !!/\d*(\.)?\d+$/g.test(v) || 'input must be a valid number.' ],
      songInfoRules: [ v => !!v || 'Required.' ],
      songIdRules: [ v => v.length === 11 || 'Video IDs have 11 characters.' ],
      isScrolling: null,
      timeSum: 0,
      firstTimeLoading: true,
      eraseAll: false
    }
  },
  created () { // creates pixi app, a ticker for the game graphics and stops the shared ticker, that will be started only when necessary (dealing with selection)
    this.editorApp = new PIXI.Application(pixiConfig)
    this.ticker = new PIXI.ticker.Ticker()
    this.youtube = new YouTube(process.env.VUE_APP_YT_API)
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  },
  mounted () { // set containers, graphics, player and managers. Starts the ticker
    this.firstTimeLoading = true
    addContainers(this.editorApp, this.containers)
    document.getElementById('canvas').appendChild(this.editorApp.view)
    createTextures(this.editorApp, this.textures)
    setInitialGraphics(this.containers, this.textures)
    this.player = new YTPlayer('#player', playerConfig)
    this.songManager = new SongManager(this.player, this.danceChart)
    this.moveManager = new MoveManager(this.songManager)
    this.noteManager = new NoteManager(this.songManager)
    this.cueManager = new CueManager(this.songManager, editorConfig, grid)

    if (this.$store.state.previousScene === 'game') {
      let loadedChart = {}
      loadedChart.offset = this.$store.state.selectedChart.offset
      loadedChart.moves = this.$store.state.selectedChart.moves
      loadedChart.videoEnd = this.$store.state.selectedChart.videoEnd
      loadedChart.videoStart = this.$store.state.selectedChart.videoStart
      loadedChart.bpm = this.$store.state.selectedChart.bpm
      loadedChart.videoId = this.$store.state.selectedSong.general.videoId

      loadedChart.title = this.$store.state.selectedSong.general.title
      loadedChart.artist = this.$store.state.selectedSong.general.artist
      this.danceGenre = this.$store.state.selectedSong.general.genre
      this.danceChart.songId = ''
      this.danceChart.chartId = ''

      this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
      this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
      this.noteManager.redraw(this.danceChart, this.containers, this.textures)
      this.player.load(this.danceChart.videoId, true)
    }

    this.ticker.add(() => {
      // adds an oscillator to sound the metronome
      if (this.songManager.currentBeat !== this.lastBeat) {
        animationManager.animate(this.songManager, this.containers, this.cueManager, this.danceChart)
        if (this.songManager.currentBeat > this.latestMetronomeBeat && this.enableMetronome) {
          let oscillator = this.audioCtx.createOscillator()
          var gainNode = this.audioCtx.createGain()
          oscillator.connect(gainNode)
          gainNode.connect(this.audioCtx.destination)
          oscillator.start()
          // 0.05 is the length of the note played by the oscillator
          oscillator.stop(this.audioCtx.currentTime + 0.05)
          // keep track of the latest metronome beat, so the sound is played every beat
          this.latestMetronomeBeat++
        }

        // this is leading to unexpected behavior when a move is deleted
        this.cueManager.drawDynamicCues(this.danceChart.moves, this.textures.cues)

        if (editorConfig.creatingMove) {
          // create notes in the canvas
          this.noteManager.createNotes(editorConfig.pressedKey, this.containers, this.textures)
          // add selected and in between beats to array - necessary when selecting areas
          this.moveManager.addBeatToArray()
        }
        // if making a selection, draw it on screen
        if (editorConfig.selectingMoves) drawSelection(this.songManager, this.containers, this.textures)

        this.lastBeat = this.songManager.currentBeat
      }
    })

    this.ticker.start()

    this.player.on('playing', () => {
      // draw staff right when the video starts playing for the first time
      // this way getDuration won't return 0
      if (this.firstTimeLoading) {
        drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
      }
      this.cueManager.setCurrentIndex(this.danceChart)
      // set the latestMetronomeBeat according to the video time if the player seeks
      this.latestMetronomeBeat = this.songManager.currentRoundBeat
      this.cueManager.holdsToDraw = []
      this.cueManager.movesToDraw = []
    })

    // Seek video position to the nearest beat time when the video is paused
    this.player.on('paused', () => {
      this.player.seek(this.songManager.getNearestBeatTime())
    })

    window.addEventListener('resize', this.resizeWindow())
    // document.getElementById('canvas').addEventListener('wheel', this.scrollContainer)
    // removes context menu from canvas when right clicking
    // document.getElementById('canvas').addEventListener('contextmenu', (e) => { e.preventDefault() })
    this.resize()
  },
  methods: {
    exportToJSON: function () {
      // do not perform any action if there is no title, artist or video id
      if (this.danceChart.title === '' || this.danceChart.artist === '' || this.danceChart.videoId === '') return
      const a = document.createElement('a')
      let savableChart = {
        title: this.danceChart.title,
        artist: this.danceChart.artist,
        offset: this.danceChart.offset,
        bpm: this.danceChart.bpm,
        videoId: this.danceChart.videoId,
        videoStart: this.danceChart.videoStart,
        videoEnd: this.danceChart.videoEnd,
        moves: this.danceChart.moves
      }
      const file = new Blob([JSON.stringify(savableChart)], { type: 'text/plain' })
      a.href = URL.createObjectURL(file)
      a.download = `${savableChart.artist} - ${savableChart.title}.json`
      a.click()
    },
    importFromJSON: function (event) {
      let file = event.target.files[0]
      var reader = new FileReader()
      // when file is loaded
      reader.onload = (e) => {
        let loadedFile = JSON.parse(e.target.result)
        let requiredFields = ['artist', 'title', 'moves', 'bpm', 'videoStart', 'videoEnd', 'videoId', 'offset']
        if (this.hasProperties(loadedFile, requiredFields)) {
          if (this.validateLoadedFile(loadedFile)) {
            // Load file content in settings and danceChart
            // TODO: Preserve chartId and songId?
            this.firstTimeLoading = true
            this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedFile)
            this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
            this.noteManager.redraw(this.danceChart, this.containers, this.textures)
            this.player.load(this.danceChart.videoId, true)
          } else {
            this.showWarningMessage('This is not a valid chart. It has inconsistent moves or fields.')
          }
        } else {
          this.showWarningMessage('This is not a valid chart. Required fields are missing.')
        }
      }
      // actual file reading
      reader.readAsText(file)
    },
    hasProperties: function (obj, arr) { // checks all properties of an object based on array of given keys
      let allIncluded = true
      for (let i = 0; i < arr.length; i++) {
        if (!obj.hasOwnProperty(arr[0])) {
          allIncluded = false
          break
        }
      }
      return allIncluded
    },
    validateLoadedFile: function (chart) {
      // chart to hold types of all key values that should be checked
      let chartTypes = {
        title: 'string',
        artist: 'string',
        offset: 0,
        bpm: 100,
        videoId: 'string',
        videoStart: 0,
        videoEnd: 0,
        moves: []
      }

      let hasValidTypes = true
      let allValidMoves = true

      // check all keys of the loaded file with chart types
      let keys = Object.keys(chartTypes)
      for (let i = 0; i < keys.length; i++) {
        if (typeof chart[keys[i]] !== typeof chartTypes[keys[i]]) {
          hasValidTypes = false
          break
        }
      }

      // check move inconsistency - It does not check for Hold and Motion "sandwiches"
      if (hasValidTypes) {
        console.log('Types are valid')
        for (let j = 0; j < chart.moves.length; j++) {
          console.log(chart.moves[j].join(','))
          console.log(/^(([0-9]+),([01]),(S[0-9]|[MH](P|[0-9][SEP])|X|H[0-9]S([0-9]+)),(S[0-9]|[MH](P|[0-9][SEP])|X|H[0-9]S([0-9]+)))$/.test(chart.moves[j].join(',')))
          if (!/^(([0-9]+),([01]),(S[0-9]|[MH](P|[0-9][SEP])|X|H[0-9]S([0-9]+)),(S[0-9]|[MH](P|[0-9][SEP])|X|H[0-9]S([0-9]+)))$/.test(chart.moves[j].join(','))) {
            allValidMoves = false
            break
          }
        }
      }

      return hasValidTypes && allValidMoves
    },
    moveToNextQuarterBeat: function () {
      if (!this.selectingArea) {
        moveToBeat(this.player, this.songManager, this.cueManager, this.danceChart, this.containers, this.textures, 1)
      }
    },
    moveToPreviousQuarterBeat: function () {
      if (!this.selectingArea) {
        moveToBeat(this.player, this.songManager, this.cueManager, this.danceChart, this.containers, this.textures, -1)
      }
    },
    moveToNextBeat: function () {
      if (!this.selectingArea) {
        moveToBeat(this.player, this.songManager, this.cueManager, this.danceChart, this.containers, this.textures, 4)
      }
    },
    moveToPreviousBeat: function () {
      if (!this.selectingArea) {
        moveToBeat(this.player, this.songManager, this.cueManager, this.danceChart, this.containers, this.textures, -4)
      }
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
          let corrected = this.moveManager.correctBeatArray()
          if (corrected) {
            for (let beat of editorConfig.beatArray) {
              this.noteManager.createNotes(event.key, this.containers, this.textures, beat)
            }
          }
          this.moveManager.addRequiredMoves(this.danceChart, event.key)
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[0]))
          this.moveManager.setCircleCount()
          this.selectingArea = true
          enableSelection(this.containers)
        } else { // if there are notes overlapping, delete all invalid notes
          this.noteManager.removeInvalidNotes(this.danceChart, this.containers)
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
          this.noteManager.redraw(this.danceChart, this.containers, this.textures)
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
    dealWithSelection: function () { // What happens after a circle selection occurs. this event is triggered every time the user clicks the canvas
      if (editorConfig.creatingMove) { // on creating mode
        if (editorConfig.selectedCircles.length === 1 && editorConfig.circleCount > 1) {
          this.player.seek(this.songManager.getBeatTime(editorConfig.beatArray[editorConfig.beatArray.length - 1]))
        } else if (editorConfig.selectedCircles.length === editorConfig.circleCount) {
          this.moveManager.addHandInfo(this.danceChart)
          this.noteManager.tintNotes(this.containers, this.danceChart)
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
          this.noteManager.redraw(this.danceChart, this.containers, this.textures)
          this.selectingArea = false
          disableSelection(this.containers)
          editorConfig.selectedCircles = []
          editorConfig.pressedKey = ''
          editorConfig.changingMove = false
        }
      }
      this.dataManager.sortDanceChart(this.danceChart)
    },
    saveTimingInfo: function () { // this saves the input from the options tab to the danceChart
      if (this.$refs.timing.validate()) {
        this.moveManager.updateMoves(this.danceChart, parseFloat(this.settings.bpm), this.danceChart.offset - parseFloat(this.settings.offset))
        this.dataManager.updateDanceChart(this.danceChart, this.settings)
        this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
        this.noteManager.redraw(this.danceChart, this.containers, this.textures)
        // drawGuideNumbers(this.player, this.danceChart, this.songManager)
        drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
        this.saved = true
      }
    },
    saveSongInfo: function () { // save song details to danceChart
      if (this.$refs.songInfo.validate()) {
        this.danceChart.title = this.settings.title
        this.danceChart.artist = this.settings.artist
        this.saved = true
      }
    },
    saveToFirebase: function () { // saves chart to firebase if all information is correct and videoId is unique
      let validInformation = this.validateBeforeSaving()
      // the information needs to be valid, a difficulty must be selected and the song must have a genre if it is the first saving it (see selectedSongDanceGenre in computed properties)
      if (validInformation && this.difficulties.includes(this.difficulty)) {
        let songId = this.$store.state.selectedSongId
        // todo: song should be a query to the database instead
        let song = this.getSongById(songId)

        if (songId === '') { // if there is no song loaded
          this.dataManager.saveNewSong(this.danceChart, this.player, this.difficulty, this.draft, this.$store.state.user.username, this.danceGenre, firebase.auth.currentUser.uid).then(res => {
            this.saved = true
            this.$store.commit('selectSongId', res)
          }).catch(err => {
            this.showWarningMessage(err.message)
          })
        } else {
          if (!song.charts.hasOwnProperty(this.difficulty)) { // if the song exists, but this difficulty has not been set
            this.dataManager.saveNewChart(this.danceChart, this.player, songId, this.difficulty, this.draft, this.$store.state.user.username).then(res => {
              this.saved = true
            }).catch(err => {
              this.showWarningMessage(err.message)
            })
          } else { // if there is the set difficulty for this song id
            // check if user is allowed to save the chart under the selected difficulty
            if (song.general.createdBy === this.$store.state.user.username) {
              this.duplicate.song = song
              this.duplicate.id = songId
              this.duplicate.difficulty = this.difficulty
              this.duplicateChart = true
            } else {
              this.showWarningMessage('You don\'t have permission to save to the selected difficulty.')
            }
          }
        }
      } else {
        this.showWarningMessage('Can\'t save if any information is missing or inconsistent. Check all fields and apply before saving.')
      }
    },
    // returns true if the danceChart has at least title, artist and one move on the chart
    validateBeforeSaving: function () {
      let valid = this.danceChart.artist !== '' && this.danceChart.title !== '' && this.danceChart.moves.length !== 0 && this.danceChart.artist === this.settings.artist && this.danceChart.title === this.settings.title && this.danceChart.bpm === parseFloat(this.settings.bpm) && this.danceGenre !== ''
      return valid
    },
    overwriteChart: function () { // updates a danceChart with existing video Id in the database
      let validInformation = this.validateBeforeSaving()
      if (validInformation && this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate()) {
        this.dataManager.overwriteChart(this.danceChart, this.duplicate.song.charts[this.difficulty].id, this.duplicate.id, this.duplicate.difficulty, this.draft, this.danceGenre).then(res => {
          this.duplicateChart = false
          this.saved = true
        }).catch(err => {
          this.showWarningMessage(err.message)
        })
      } else {
        this.showWarningMessage('Can\'t save if any information is missing. Check all fields.')
      }
    },
    loadVideoById: function () { // loads a video to the iframe according to the input id
      if (this.$refs.videoId.validate()) {
        // video is loaded if it is parapara related only
        this.youtube.getVideoByID(this.danceChart.videoId).then(result => {
          if (this.ytKeyRg.test(result.title) || this.ytKeyRg.test(result.description)) {
            this.firstTimeLoading = true
            this.player.load(this.danceChart.videoId, true)
            // reset chart
            this.danceChart = {
              title: '',
              artist: '',
              offset: 0,
              bpm: 200,
              videoId: this.player.videoId,
              videoStart: 0,
              videoEnd: 0,
              moves: [],
              chartId: '',
              songId: ''
            }
            // reset settings
            this.settings = { offset: '0', videoStart: '0', videoEnd: '0', bpm: '200', title: '', artist: '' }
            this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
            this.noteManager.redraw(this.danceChart, this.containers, this.textures)
            // no song was selected
            this.$store.commit('selectSongId', '')
          } else {
            this.showWarningMessage('This is not a valid ParaPara video. Please try another ID.')
          }
        }).catch(err => {
          this.showWarningMessage(`Something went wrong. Please try again another time. \n ${err}`)
        })
      }
    },
    selectChart: function (song, chartId, dif) { // changes selected song in the store with the given song id
      this.$store.commit('selectSong', song)
      this.$store.commit('selectDifficulty', dif)
      this.$store.commit('selectChart', chartId)
    },
    loadChart: function (chartId) { // pulls chart info from the database and applies to the danceChart and settings tab
      if (chartId) {
        let songId = this.selectedSongId
        let song = this.getSongById(songId)
        this.$store.commit('selectSongId', this.selectedSongId)
        let loadedChart = {}
        firebase.database.ref(`charts/${chartId}`).once('value', (data) => {
          let value = data.val()
          loadedChart.offset = value.offset
          loadedChart.moves = value.moves
          loadedChart.videoEnd = value.videoEnd
          loadedChart.videoStart = value.videoStart
          loadedChart.videoId = value.videoId
          loadedChart.bpm = value.bpm

          loadedChart.title = song.general.title
          loadedChart.artist = song.general.artist
          this.danceChart.songId = songId
          this.danceChart.chartId = chartId
          this.danceGenre = song.general.genre
        }).then(() => {
          this.firstTimeLoading = true
          this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
          this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
          this.noteManager.redraw(this.danceChart, this.containers, this.textures)
          this.player.load(this.danceChart.videoId, true)
        }).catch(err => {
          this.showWarningMessage(`An error occured trying to load this chart. Please try again later. \n ${err}`)
        })
      } else {
        this.showWarningMessage(`There is no chart selected to be loaded.`)
      }
    },
    // select chart that user wants to delete
    selectToDelete: function () {
      this.toDelete.song = this.getSongById(this.selectedSongId)
      this.toDelete.chartId = this.$store.state.selectedChartId
      this.toDelete.dif = this.$store.state.selectedDifficulty

      if (this.toDelete.song !== null && this.toDelete.dif !== '' && this.toDelete.chartId !== '') {
        this.deleteChart = true
      }
    },
    deleteSelectedChart: function () { // removes selected chart from the database
      // check if user is allowed to do that
      if (this.toDelete.song !== null) {
        let songId = this.toDelete.song.general.songId
        let chartId = this.toDelete.chartId
        let selectedDif = this.toDelete.dif
        let uid = firebase.auth.currentUser.uid

        if (chartId !== '') {
          if (Object.keys(this.toDelete.song.charts).length === 1) {
            // scores should all be deleted if the song is deleted
            if (this.toDelete.song.scores) {
              for (let dif in this.toDelete.song.scores) {
                firebase.database.ref(`scores/${this.toDelete.song.scores[dif]}`).remove()
              }
            }
            firebase.database.ref(`charts/${chartId}`).remove()
            firebase.database.ref(`songs/${songId}`).remove()
            firebase.database.ref(`users/${uid}/createdSongs/${songId}`).remove()
            // When the songId is added to user/createdSongs, it should be removed at this time
          } else {
            // remove score if the chart is removed and if it exists
            if (this.toDelete.song.scores) {
              if (this.toDelete.song.scores[selectedDif]) {
                firebase.database.ref(`scores/${this.toDelete.song.scores[selectedDif]}`).remove()
              }
            }
            // remove chart from database
            firebase.database.ref(`charts/${chartId}`).remove()
            // remove chart reference from the song
            firebase.database.ref(`songs/${songId}/charts/${selectedDif}`).remove()
          }

          this.toDelete.song = null
          this.toDelete.chartId = ''
          this.toDelete.dif = ''

          this.deleteChart = false
          this.showWarningMessage('Chart Deleted.')
        }
      }
    },
    goToSongSelection: function () { // goes back to song selection Scene
      this.destroyAll()
      this.$store.commit('selectChart', null)
      this.$store.commit('selectSong', null)
      this.$store.commit('selectDifficulty', null)
      this.$store.commit('changeSelectedChart', null)
      this.$store.commit('goToScene', 'song-selection')
    },
    destroyAll: function () {
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
      // document.getElementById('canvas').removeEventListener('wheel', this.scrollContainer)
      window.onresize = null
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
    },
    // scrollContainer: function (e) {
    //   if (this.player.getState() !== 'playing') {
    //     window.clearTimeout(this.isScrolling)
    //     this.containers.master.dynamicContainer.pivot.y += e.deltaY
    //     let timePerPixel = this.player.getDuration() / this.containers.auxiliary.backgroundStaff.height
    //     this.timeSum += e.deltaY * timePerPixel
    //
    //     this.isScrolling = setTimeout(() => {
    //       this.player.seek(this.player.getCurrentTime() + this.timeSum)
    //       this.timeSum = 0
    //     }, 100)
    //   }
    // },
    focusOnEditor: function () {
      setTimeout(() => {
        document.getElementById('canvas').focus()
      }, 100)
    },
    testChart: function () {
      // create a dummy selected chart
      let dummyChart = {
        bpm: this.danceChart.bpm,
        moves: this.danceChart.moves.join(' '),
        offset: this.danceChart.offset,
        videoId: this.player.videoId,
        videoStart: this.danceChart.videoStart,
        videoEnd: this.danceChart.videoEnd
      }
      // create dummy selected song
      let dummySong = {
        general: {
          artist: this.danceChart.artist,
          title: this.danceChart.title,
          videoId: this.player.videoId,
          genre: this.danceGenre
        }
      }
      // if there is no posenet model loaded
      if (this.$store.state.net === null) {
        this.$store.dispatch('loadNet', this.$store.state.gameOptions.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('selectSong', dummySong)
          this.$store.commit('changeSelectedChart', dummyChart)
          this.destroyAll()
          this.$store.commit('goToScene', 'game')
        }, error => {
          this.$store.commit('changeWrongMessage', `Due to a problem with PoseNet the game is not available right now. Please try it again later. \n ${error.message}`)
          this.$store.commit('somethingWentWrong')
        })
      } else {
        this.$store.commit('selectSong', dummySong)
        this.$store.commit('changeSelectedChart', dummyChart)
        this.destroyAll()
        this.$store.commit('goToScene', 'game')
      }
    },
    selectSongAndVideoId: function (song, songId) {
      this.danceChart.videoId = song.general.videoId
      this.selectedSongId = songId
    },
    getSongById: function (id) {
      // this function should go to the database and get the song
      // because of the pagination the current loaded song can be in another page
      for (let i = 0; i < this.songs.length; i++) {
        if (this.songs[i].general.songId === id) {
          return this.songs[i]
        }
      }
    },
    loadNextPage: function () {
      this.$store.dispatch('loadSongs', { filter: 'My Creations', requestedPage: 'next' }).then(() => {
        // loaded
      }).catch(() => {
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
        this.$store.commit('somethingWentWrong')
      })
    },
    loadPreviousPage: function () {
      this.$store.dispatch('loadSongs', { filter: 'My Creations', requestedPage: 'previous' }).then(() => {
        // loaded
      }).catch(() => {
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
        this.$store.commit('somethingWentWrong')
      })
    },
    eraseAllMoves: function () {
      this.danceChart.moves = []
      this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
      this.noteManager.redraw(this.danceChart, this.containers, this.textures)
      this.eraseAll = false
    },
    showWarningMessage: function (message) {
      this.warningText = message
      this.warningSnack = true
    }
  },
  computed: {
    songs: function () {
      let allSongs = this.$store.state.showSongs.slice(0)
      let orderedSongs = []
      for (let song of allSongs) {
        let order = ['easy', 'medium', 'hard']
        let sortedChart = Object.entries(song.charts).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
        song.charts = Object.fromEntries(sortedChart)
        if (song.general.createdBy === this.$store.state.user.username) orderedSongs.push(song)
      }

      orderedSongs.sort((a, b) => {
        if (a.general.updatedAt < b.general.updatedAt) {
          return 1
        }
        if (a.general.updatedAt > b.general.updatedAt) {
          return -1
        }
        return 0
      })

      return orderedSongs
    },
    selectedSong: function () { // changes the selected song from the list
      return this.$store.state.selectedSong
    },
    selectedChartId: function () {
      return this.$store.state.selectedChartId
    },
    testable: function () {
      // check if chart can be tested (if the player has a video loaded)
      if (this.player) {
        if (this.player.videoId) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    metronomeLabel: function () {
      return `enable metronome - ${this.danceChart.bpm} BPM`
    },
    actualVideoEnd: function () {
      if (this.player) {
        if (this.danceChart.videoEnd === 0) {
          return this.player.getDuration()
        } else {
          return this.danceChart.videoEnd
        }
      } else {
        return this.danceChart.videoEnd
      }
    }
  }
}
</script>
<style scoped>
#background {
  background: rgb(3,3,3);
  background: linear-gradient(140deg, rgba(3,3,3,1) 0%, rgba(139,0,232,1) 6%, rgba(211,146,255,1) 12%, rgba(139,0,232,1) 18%, rgba(0,0,0,1) 46%, rgba(0,0,0,1) 55% ,rgba(29,240,255,1) 82%, rgba(146,250,255,1) 92%, rgba(29,240,255,1) 96%, rgba(0,0,0,1) 100%);
}

th {
  padding-bottom: 15px;
}
</style>
