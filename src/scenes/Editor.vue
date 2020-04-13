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
                    <v-expansion-panel-content class="yellow darken-1 headline font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            video_library
                          </v-icon>
                          Load Video</div>
                      </template>
                      <v-card>
                        <v-card-actions>
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
                    </v-expansion-panel-content>
                    <v-expansion-panel-content class="headline yellow darken-1 elevation-5 font-weight-medium">
                      <template v-slot:header>
                        <div>
                          <v-icon
                          left
                          color="black"
                          >
                            queue_music
                          </v-icon>
                          Load Chart</div>
                      </template>
                      <v-card>
                        <v-card-text class="ma-0 pa-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-layout row wrap justify-space-between class="scroll-y ma-0 pa-3" style="max-height: 50vh;">
                              <v-flex xs5 class="ma-1"
                                v-for="(song, name) in songs"
                                :key="song.chartId"
                                @click="selectVideoId(song)">
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
                                      @click="selectSong(name, chart.id, dif)"
                                      :class="[selectedChartId === chart.id ? 'darken-1' : '', !chart.editable ? 'red lighten-3 font-weight-bold' : chart.draft ? 'yellow lighten-3 font-weight-bold' : 'green lighten-3 font-weight-bold']"
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
                          <v-btn dark @click="loadChart(selectedSong, selectedChartId)"
                          :disabled="unableToLoad">Load</v-btn>
                          <v-btn dark v-if="$store.state.user.type === 'admin'" color="red" @click="deleteChart = true">Delete</v-btn>
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
                          Save Chart</div>
                      </template>
                      <v-card>
                        <v-card-text>
                          <v-container grid-list-xs class="ma-0 pa-0">
                            <v-layout row wrap class="ma-0 pa-0">
                              <v-flex xs6 class="body-2">
                                <div :class="danceChart.title === '' ? 'red lighten-3 mt-1 pa-1' : ''">
                                  Title: {{ danceChart.title }}
                                </div>
                                <div :class="danceChart.artist === '' ? 'red lighten-3 mt-1 pa-1' : ''">
                                  Artist: {{ danceChart.artist }}
                                </div>
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
                                  End: {{ danceChart.videoEnd }}
                                </div>
                                <div :class="danceChart.moves.length === 0 ? 'red lighten-3 mt-1 pa-1' : ''">
                                  Beats with moves: {{ danceChart.moves.length }}
                                </div>
                              </v-flex>
                              <v-flex xs6 class="body-2">
                                <div class="mt-1 pa-1">
                                  Draft: {{ draft ? 'Yes' : 'No' }}
                                </div>
                                <div :class="difficulty === '' ? 'red lighten-3 mt-1 pa-1' : ''">
                                  Difficulty: {{ difficulty === '' ? 'Not Selected' : difficulty }}
                                </div>
                              </v-flex>
                            </v-layout>
                          </v-container>
                        </v-card-text>
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
                              <v-btn @click="testChart" :disabled="testable">Test</v-btn>
                              <v-btn @click="firebaseTests">FIREBASE TESTS</v-btn>
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
                          <p class="pa-0 ma-0">This action will overwrite the existing version of the <span class="font-weight-bold">{{duplicate.difficulty}}</span> chart for <span class="font-weight-bold">{{duplicate.song.title}} / {{duplicate.song.artist}}</span>. Do you want do continue?</p>
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
                          <p class="pa-0 ma-0">This action will delete permanently the existing version of the <span class="font-weight-bold">{{$store.state.selectedDifficulty}}</span> chart for <span class="font-weight-bold">{{selectedSong.title}} / {{selectedSong.artist}}</span>. Do you want do continue?</p>
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
                          v-model="warningSnack"
                          left
                          :timeout="5000"
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
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <!-- <v-flex xs12>
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
                  </v-flex> -->
                  <!-- <v-flex xs12>
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
                              :key="song.chartId"
                              @click="selectVideoId(song)">
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
                                    @click="selectSong(name, chart.id, dif)"
                                    :class="[selectedChartId === chart.id ? 'darken-1' : '', !chart.editable ? 'red lighten-3 font-weight-bold' : chart.draft ? 'yellow lighten-3 font-weight-bold' : 'green lighten-3 font-weight-bold']"
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
                        <v-btn dark @click="loadChart(selectedSong, selectedChartId)"
                        :disabled="unableToLoad">Load</v-btn>
                        <v-btn dark v-if="$store.state.user.type === 'admin'" color="red" @click="deleteChart = true">Delete</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex> -->

                  <!-- <v-flex xs12>
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
                            <v-btn @click="testChart" :disabled="testable">Test</v-btn>
                            <v-btn @click="firebaseTests">FIREBASE TESTS</v-btn>
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
                        <p class="pa-0 ma-0">This action will overwrite the existing version of the <span class="font-weight-bold">{{duplicate.difficulty}}</span> chart for <span class="font-weight-bold">{{duplicate.song.title}} / {{duplicate.song.artist}}</span>. Do you want do continue?</p>
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
                        <p class="pa-0 ma-0">This action will delete permanently the existing version of the <span class="font-weight-bold">{{$store.state.selectedDifficulty}}</span> chart for <span class="font-weight-bold">{{selectedSong.title}} / {{selectedSong.artist}}</span>. Do you want do continue?</p>
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
                        v-model="warningSnack"
                        left
                        :timeout="5000"
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
                    </v-card>
                  </v-flex> -->
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
                          <v-checkbox class="ma-0" color="blue" v-model="enableMetronome">
                            <template v-slot:label><span class="font-weight-bold">enable metronome ({{ danceChart.bpm }} BPM)</span></template>
                          </v-checkbox>
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

const YTPlayer = require('yt-player')
const YouTube = require('simple-youtube-api')

export default {
  components: {
    'instructions': EditorInstructions
  },
  data () {
    return {
      tabs: null,
      difficulties: [ 'easy', 'medium', 'hard' ],
      difficulty: '',
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
          title: '',
          artist: ''
        }
      },
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
      songIdRules: [ v => v.length === 11 || 'Video IDs have 11 characters.' ]
    }
  },
  created () { // creates pixi app, a ticker for the game graphics and stops the shared ticker, that will be started only when necessary (dealing with selection)
    this.editorApp = new PIXI.Application(pixiConfig)
    this.ticker = new PIXI.ticker.Ticker()
    this.youtube = new YouTube(process.env.VUE_APP_YT_API)
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
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

    if (this.$store.state.previousScene === 'game') {
      let loadedChart = {}
      loadedChart.offset = this.$store.state.selectedChart.offset
      loadedChart.moves = this.$store.state.selectedChart.moves
      loadedChart.videoEnd = this.$store.state.selectedChart.videoEnd
      loadedChart.videoStart = this.$store.state.selectedChart.videoStart
      loadedChart.bpm = this.$store.state.selectedChart.bpm
      loadedChart.videoId = this.$store.state.selectedSong.videoId

      loadedChart.title = this.$store.state.selectedSong.title
      loadedChart.artist = this.$store.state.selectedSong.artist
      this.danceChart.songId = ''
      this.danceChart.chartId = ''

      this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
      this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
      this.noteManager.redraw(this.danceChart, this.containers, this.textures)
      this.player.load(this.danceChart.videoId, true)
      setTimeout(() => {
        // drawGuideNumbers(this.player, this.danceChart, this.songManager)
        drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
      }, 5000)
    } else {
      if (this.$store.state.selectedChartId && this.$store.state.user.type !== 'user') {
        this.existingChart = true
        this.loadChart(this.$store.state.selectedSong, this.$store.state.selectedChartId)
      }
    }

    this.ticker.add(() => {
      animationManager.animate(this.songManager, this.containers, this.cueManager, this.danceChart)
      // adds an oscillator to sound the metronome
      if (this.songManager.currentBeat > this.latestMetronomeBeat && this.enableMetronome && this.songManager.currentBeat !== this.lastBeat) {
        let oscillator = this.audioCtx.createOscillator()
        var gainNode = this.audioCtx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(this.audioCtx.destination)
        oscillator.start()
        // 0.05 is the length of the note played by the oscillator
        oscillator.stop(this.audioCtx.currentTime + 0.05)
        // keep track of the latest metronome beat, so the sound is played every beat
        this.latestMetronomeBeat++
        // last beat is here so the ticker is no triggered more than once per beat in case the user seeks the player (there is a delay between seek and player.on('playing') happens)
        this.lastBeat = this.songManager.currentBeat
      }
      if (this.player.getState() === 'playing') this.cueManager.drawDynamicCues(this.danceChart.moves, this.textures.cues)
    })

    this.ticker.start()

    this.player.on('playing', () => {
      this.cueManager.setCurrentIndex(this.danceChart)
      // set the latestMetronomeBeat according to the video time if the player seeks
      this.latestMetronomeBeat = this.songManager.currentRoundBeat
      this.cueManager.holdsToDraw = []
      this.cueManager.movesToDraw = []
    })

    window.addEventListener('resize', this.resizeWindow())
    this.resize()
  },
  methods: {
    firebaseTests: function () {
      // let testUsername = 'rodrigo'
      // firebase.database.ref('usernames').orderByValue().equalTo(testUsername).once('value', snapshot => {
      //   console.log(snapshot.val())
      // })
    },
    moveToNextQuarterBeat: function () {
      moveToBeat(this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, 1)
    },
    moveToPreviousQuarterBeat: function () {
      moveToBeat(this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, -1)
    },
    moveToNextBeat: function () {
      moveToBeat(this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, 4)
    },
    moveToPreviousBeat: function () {
      moveToBeat(this.player, this.songManager, this.moveManager, this.noteManager, this.cueManager, this.danceChart, this.containers, this.textures, -4)
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
        this.moveManager.updateMoves(this.danceChart, parseFloat(this.settings.bpm), this.danceChart.offset - parseFloat(this.settings.offset))
        this.dataManager.updateDanceChart(this.danceChart, this.settings)
        this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
        this.noteManager.redraw(this.danceChart, this.containers, this.textures)
        // drawGuideNumbers(this.player, this.danceChart, this.songManager)
        drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
      }
    },
    saveToFirebase: function () { // saves chart to firebase if all information is correct and videoId is unique
      let validInformation = this.validateBeforeSaving()
      let chartDuration = this.getChartDuration()
      if (validInformation && this.difficulties.indexOf(this.difficulty) !== -1 && chartDuration < 180 && chartDuration > 60) {
        let songId = this.dataManager.getSongIdByVideoId(this.songs, this.player.videoId)
        if (songId === '') { // if there is no song with this videoId
          this.dataManager.saveNewSong(this.danceChart, this.player, this.difficulty, this.draft, this.$store.state.user.username)
          this.saved = true
        } else { // TODO: TO think about: if the videoId is not unique, the title and artist should be checked too or start and end of the video. There could be a videoId that has more than one song. Should we leave this as is - one song per videoId?
          if (!this.songs[songId].charts.hasOwnProperty(this.difficulty)) { // if the song exists, but this difficulty has not been set
            this.dataManager.saveNewChart(this.danceChart, this.player, songId, this.difficulty, this.draft, this.$store.state.user.username)
            this.saved = true
          } else { // if there is the set difficulty for this song id
            // check if user is allowed to save the chart under the selected difficulty
            if (this.songs[songId].charts[this.difficulty].editable) {
              this.duplicate.song = this.songs[songId]
              this.duplicate.id = songId
              this.duplicate.difficulty = this.difficulty
              this.duplicateChart = true
            } else {
              this.warningText = 'You don\'t have permission to save to the selected difficulty.'
              this.warningSnack = true
            }
          }
        }
      } else {
        if (chartDuration > 180 || chartDuration < 60) {
          this.warningText = 'The duration of your chart has to be between 1 and 3 minutes.'
        } else {
          this.warningText = 'Can\'t save if any information is missing or inconsistent. Check all fields and apply before saving.'
        }
        this.warningSnack = true
      }
    },
    // returns true if the danceChart has at least title, artist and one move on the chart
    validateBeforeSaving: function () {
      let valid = this.danceChart.artist !== '' && this.danceChart.title !== '' && this.danceChart.moves.length !== 0 && this.danceChart.artist === this.settings.artist && this.danceChart.title === this.settings.title && this.danceChart.bpm === parseFloat(this.settings.bpm)
      return valid
    },
    getChartDuration: function () {
      if (this.danceChart.videoEnd === 0) {
        let duration = this.player.getDuration()
        return duration - this.danceChart.videoStart
      } else {
        return this.danceChart.videoEnd - this.danceChart.videoStart
      }
    },
    overwriteChart: function () { // updates a danceChart with existing video Id in the database
      let validInformation = this.validateBeforeSaving()
      if (validInformation && this.$refs.videoId.validate() && this.$refs.timing.validate() && this.$refs.songInfo.validate()) {
        this.dataManager.overwriteChart(this.danceChart, this.duplicate.song.charts[this.difficulty].id, this.duplicate.id, this.duplicate.difficulty, this.draft, this.$store.state.user.username)
        this.duplicateChart = false
        this.saved = true
      } else {
        this.warningText = 'Can\'t save if any information is missing. Check all fields.'
        this.warningSnack = true
      }
    },
    loadVideoById: function () { // loads a video according to the input id
      if (this.$refs.videoId.validate()) {
        // check if this is an existing videoId. If it is, load song settings only from one of the existing charts
        // if not, proceed as usual
        let songId = this.dataManager.getSongIdByVideoId(this.songs, this.danceChart.videoId)
        if (songId !== '') {
          let existingDif = Object.keys(this.songs[songId].charts)
          let existingChartId = this.songs[songId].charts[existingDif[0]].id

          let loadedChart = {}
          firebase.database.ref(`charts/${existingChartId}`).once('value', (data) => {
            let value = data.val()
            loadedChart.offset = value.offset
            // load no moves in this case
            loadedChart.moves = ''
            loadedChart.videoEnd = value.videoEnd
            loadedChart.videoStart = value.videoStart
            loadedChart.videoId = value.videoId
            loadedChart.bpm = value.bpm

            loadedChart.title = this.$store.state.songs[songId].title
            loadedChart.artist = this.$store.state.songs[songId].artist
            this.danceChart.songId = songId
            this.danceChart.chartId = ''
          }).then(() => {
            this.dataManager.updateChartAndSettings(this.danceChart, this.settings, loadedChart)
            this.dataManager.updateManagers(this.danceChart, this.songManager, this.moveManager, this.noteManager, this.cueManager)
            this.noteManager.redraw(this.danceChart, this.containers, this.textures)
            this.player.load(this.danceChart.videoId, true)
            setTimeout(() => {
              // drawGuideNumbers(this.player, this.danceChart, this.songManager)
              drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
            }, 5000)
          }).catch(err => {
            this.warningText = `There was an error loading information from the database. Try again later.\n${err}`
            this.warningSnack = true
          })
        } else {
          // here we should check if the video has one of the keywords in the title or description
          this.youtube.getVideoByID(this.danceChart.videoId).then(result => {
            if (this.ytKeyRg.test(result.title) || this.ytKeyRg.test(result.description)) {
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
              setTimeout(() => {
                // drawGuideNumbers(this.player, this.danceChart, this.songManager)
                drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
              }, 5000)
            } else {
              this.warningText = 'This is not a valid ParaPara video. Please try another ID.'
              this.warningSnack = true
            }
          }).catch(err => {
            this.warningText = `Something went wrong. Please try again another time. \n ${err}`
            this.warningSnack = true
          })
        }
      }
    },
    selectSong: function (songId, chartId, dif) { // changes selected song in the store with the given song id
      this.$store.commit('selectSong', this.songs[songId])
      this.$store.commit('selectDifficulty', dif)
      this.$store.commit('selectChart', chartId)
    },
    loadChart: function (song, chartId) { // pulls chart info from the database and applies to the danceChart and settings tab
      // TODO: check if user is allowed to do that?
      let songId = this.dataManager.getSongIdByVideoId(this.songs, song.videoId)
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
            // drawGuideNumbers(this.player, this.danceChart, this.songManager)
            drawStaff(this.containers, this.textures, this.player, this.danceChart, this.songManager)
          }, 5000)
        }).catch(err => {
          this.warningText = `An error occured trying to load this chart. Please try again later. \n ${err}`
          this.warningSnack = true
        })
      }
    },
    deleteSelectedChart: function (song, chartId) { // removes selected chart from the database
      // check if user is allowed to do that
      let songId = this.dataManager.getSongIdByVideoId(this.songs, song.videoId)
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
    focusOnEditor: function () {
      document.getElementById('canvas').focus()
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
        artist: this.danceChart.artist,
        title: this.danceChart.title,
        videoId: this.player.videoId
      }
      if (this.$store.state.net === null) {
        this.$store.dispatch('loadNet', this.$store.state.gameOptions.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('selectSong', dummySong)
          this.$store.commit('changeSelectedChart', dummyChart)
          this.destroyAll()
          this.$store.commit('goToScene', 'game')
        }, error => {
          console.log(error)
          this.$store.commit('changeWrongMessage', 'Due to a problem with PoseNet the game is not available right now. Please try it again later.')
          this.$store.commit('somethingWentWrong')
        })
      } else {
        this.$store.commit('selectSong', dummySong)
        this.$store.commit('changeSelectedChart', dummyChart)
        this.destroyAll()
        this.$store.commit('goToScene', 'game')
      }
    },
    selectVideoId: function (song) {
      this.danceChart.videoId = song.videoId
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

      // add information if song is editable or not - it will show up in the client as a color code
      for (let song in sortedDif) {
        for (let chart in sortedDif[song].charts) {
          if (this.$store.state.user.type === 'admin') { // admins can edit anything
            sortedDif[song].charts[chart].editable = true
          } else if (this.$store.state.user.type === 'editor') { // editors can't edit the latency test
            if (sortedDif[song].title === 'Latency Test') {
              sortedDif[song].charts[chart].editable = false
            } else {
              sortedDif[song].charts[chart].editable = true
            }
          } else {
            if (sortedDif[song].charts[chart].createdBy) {
              if (sortedDif[song].charts[chart].createdBy === this.$store.state.user.username) {
                sortedDif[song].charts[chart].editable = true
              }
            } else {
              sortedDif[song].charts[chart].editable = false
            }
          }
        }
      }
      return sortedDif
    },
    selectedSong: function () { // changes the selected song from the list
      return this.$store.state.selectedSong
    },
    selectedChartId: function () {
      return this.$store.state.selectedChartId
    },
    testable: function () {
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
    unableToLoad: function () {
      // TODO: maybe unable to load charts should be in red?
      // write in about the rules to make a chart easy, medium and hard (prerequisites) and maybe check for them before saving
      if (this.$store.state.user.type === 'admin' || this.$store.state.user.type === 'editor') {
        return false
      } else {
        if (this.$store.state.selectedSong && this.$store.state.selectedDifficulty && this.$store.state.selectedSong.charts[this.$store.state.selectedDifficulty].createdBy) {
          let condition = this.$store.state.selectedSong.charts[this.$store.state.selectedDifficulty].createdBy === this.$store.state.user.username
          return !condition
        } else {
          return true
        }
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
</style>
