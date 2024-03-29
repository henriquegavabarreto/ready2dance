<template>
  <div id="background">
    <!-- Toolbar shown at the top of the app -->
    <v-toolbar
      dark
      icons-and-text
      app
    >
      <!-- search textfield to filter game songs -->
      <v-text-field
        style="max-width: 45vw;"
        prepend-icon="search"
        label="Search"
        v-model="search"
        placeholder="Search by Song Title or Artist"
        solo-inverted
        class="mt-2"
        flat
      ></v-text-field>
      <!-- h3 that shows username (if registered user) or guest (if decided not to sign in / sign up) -->
      <h3 class="ml-5" v-if="$store.state.user !== null">Hello, {{$store.state.user.username}}!</h3>
      <h3 class="ml-5" v-else>Hello, Guest!</h3>
      <v-spacer></v-spacer>
      <!-- menu with settings, editor, log out and user management -->
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            icon
            v-on="on"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>

        <v-list class="py-0 title font-weight-regular">
          <v-list-tile @click="toggleSettings">
            <v-list-tile-title><v-icon left>settings</v-icon><span>Settings</span></v-list-tile-title>
          </v-list-tile>
        </v-list>
        <v-list class="py-0" v-if="$store.state.user !== null">
          <v-list-tile v-if="$store.state.user !== null" @click="goToEditor">
            <v-list-tile-title><v-icon left>edit</v-icon><span>Editor</span></v-list-tile-title>
          </v-list-tile>
        </v-list>
        <v-list class="py-0">
          <v-list-tile @click="logout">
            <v-list-tile-title><v-icon left>exit_to_app</v-icon><span>Sign Out</span></v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <Welcome />
    <!-- settings dialog - where user can change options regarding in game animations and
    posenet configuration
    TODO: when updated to posenet 2.0, change these options to match the package as well -->
    <v-dialog
      v-model="settings"
      max-width="500"
    >
      <v-card style="border-radius: 10px;">
        <v-card-title class="cyan headline justify-center white--text font-weight-medium">
          SETTINGS
        </v-card-title>

        <v-card-text>
          <h3>ANIMATIONS</h3>
          <v-checkbox
            color="blue"
            v-model="options.showAnimation"
            label="Show animations">
          </v-checkbox>
          <v-select
            :disabled="!options.showAnimation"
            outline
            :items="speed"
            v-model="options.speed"
            label="Circle Animation Speed"
            hint="Speed of the circles appearing on screen"
          ></v-select>
          <v-divider></v-divider>
          <h3 class="mt-4">CAMERA</h3>
          <v-select
            outline
            class="mt-4"
            :items="videoDevicesLabels"
            v-model="selectedDeviceLabel"
            label="devices"
            @change="selectDevice"></v-select>
          <v-checkbox
            color="blue"
            v-model="options.showWebcam"
            label="Show webcam video">
          </v-checkbox>
          <v-text-field
            outline
            label="Camera Latency"
            v-model="options.latency"
            hint="ex: 0.32"
          >
          </v-text-field>
          <v-btn block @click="goToLatencyCalibration">Calibrate Latency (WIP)</v-btn>
          <a href="https://www.youtube.com/watch?v=WXud3F-Cuac" target="_blank"><p class="mt-2">More about latency</p></a>
        </v-card-text>

        <v-card-actions class="cyan">
          <v-spacer></v-spacer>

          <v-btn
            class="white"
            color="green darken-1"
            flat
            @click="settings = false"
          >
            Close and Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- loading dialog in case it takes some time to load posenet to go into the game -->
    <loading-screen :dialog="loading"></loading-screen>
    <v-content style="min-height: 100vh;">
      <v-container fluid fill-height class="pa-2">
        <v-layout row wrap>
          <!-- v-flex that shows all current songs in the database to be chosen to play by the users -->
          <v-flex sm12 md6>
            <v-card style="max-height: 100%; border-radius: 10px;" class="blue-grey lighten-5">
              <v-card-title class="justify-center teal lighten-2">
                <v-icon
                  medium
                  left
                  color="black"
                >
                  queue_music
                </v-icon>
                <span class="headline font-weight-bold ma-0 pa-0">SELECT A SONG</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-container style="max-height: 80vh;" fluid grid-list-lg class="scroll-y">
                <v-layout row wrap>
                  <v-select
                    :items="filters"
                    v-model="filter"
                    label="order by"
                    @change="logChange(filter)"
                  ></v-select>
                  <v-flex
                  xs12
                  v-for="song in filteredSongs"
                  :key="song.general.songId"
                  @click="selectSong(song)">
                    <v-card
                      style="border-radius: 15px;"
                      hover
                      id="cardBackground"
                      :class="selectedSong.general.title === song.general.title ? 'pink darken-1 white--text' : 'blue lighten-4'">
                      <v-card-title primary-title class="px-3 py-1">
                        <div>
                          <h3 class="my-1"><span class="headline font-weight-medium">{{song.general.title.toUpperCase() + ' - ' + song.general.artist.toUpperCase()}}</span></h3>
                          <v-chip small :color="song.general.genre === 'parapara' ? 'pink' : song.general.genre === 'techpara' ? 'blue' : 'yellow'" text-color="white" class="text-xs-center">{{song.general.genre.toUpperCase()}}</v-chip>
                          <v-chip small v-for="(charts,name) in song.charts" :key="name" color="black" text-color="white" class="text-xs-center">{{name.toUpperCase()}}</v-chip>
                          <div class="body-2 font-weight-regular">
                            <span>created by {{song.general.createdBy}}</span>
                            <span class="ml-5"><v-icon :color="$store.state.user === null ? 'white' : $store.state.user.likedSongs.includes(song.general.songId) ? 'purple' : 'white'">favorite</v-icon></span><span class="ml-1">{{song.general.likedBy ? song.general.likedBy : 0 }}</span>
                          </div>
                        </div>
                      </v-card-title>
                    </v-card>
                  </v-flex>
                  <v-flex xs12 class="text-sm-center">
                    <v-btn :disabled="$store.state.pageCounter === 1 || $store.state.queryState === 'first'" color="primary" @click="loadPreviousPage()">Previous</v-btn>
                    <v-btn :disabled="$store.state.queryState === 'last'" color="primary" @click="loadNextPage()">Next</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
          <!-- v-flex that show videos and available chart difficulties for the selected song -->
          <v-flex sm12 md6 :class="!$vuetify.breakpoint.smAndDown ? 'pl-3' : 'pt-3'" v-show="selectedSong.general.title">
            <v-layout row wrap>
              <v-flex xs12 id="currentlySelected">
                <v-card style="border-radius: 10px;" class="blue-grey lighten-5 text-xs-center">
                  <v-card-title primary-title class="justify-center align-center cyan py-1">
                    <v-layout class="justify-space-between align-center">
                      <h3 v-if="selectedSong.general.title" class="headline font-weight-bold">{{selectedSong.general.title.toUpperCase()}} - {{selectedSong.general.artist.toUpperCase()}}
                      </h3>
                      <v-btn v-if="$store.state.user !== null" fab small :color="!$store.state.user ? 'red lighten-2' : !$store.state.user.likedSongs ? 'red lighten-2' : $store.state.user.likedSongs[$store.state.selectedSongId] ? 'red' : 'red lighten-2'" @click="toggleLike($store.state.selectedSongId)" :loading="processingLike" :disabled="processingLike"><v-icon color="white">favorite</v-icon></v-btn>
                    </v-layout>
                  </v-card-title>
                  <v-card-text>
                    <div id="player" style="max-height: 300px;"></div>
                  </v-card-text>
                  <v-card-text style="display: inline;" class="justify-center">
                    <div style="display: inline;" v-for="(chart, dif) in songCharts" :key="dif">
                      <v-btn
                        @click="selectChart(chart.id, dif)"
                        :class="selectedChart === chart.id ? 'blue lighten' : ''"
                        :disabled="chart.draft && ($store.state.user === null || $store.state.user.username !== selectedSong.general.createdBy)">{{dif}}<span v-if="chart.draft">{{' (SOON)'}}</span></v-btn>
                    </div>
                  </v-card-text>
                  <v-card-actions class="justify-center mt-2">
                    <v-btn
                      :disabled="$store.state.selectedChartId === null"
                      @click="goToGame"><v-icon left>play_arrow</v-icon>PLAY</v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
              <!-- scoreboard for the selected chart -->
              <v-flex xs12>
                <v-card style="border-radius: 10px;" class="mt-3 blue-grey lighten-5">
                  <v-card-title class="headline justify-center yellow darken-1 font-weight-bold" primary-title>
                    SCORE BOARD
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text v-if="typeof $store.state.songScores === 'string'" class="headline text-xs-center">
                    {{$store.state.songScores}}
                  </v-card-text>
                  <v-card-text style="max-height: 45.8vh;" class="scroll-y" v-else>
                    <table style="width: 100%; text-align: center;">
                      <thead class="headline">
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                      </thead>
                      <tbody>
                        <tr v-for="(score, index) in $store.state.songScores" :key="index" class="title text-sm-center">
                          <td>{{index + 1}}</td>
                          <td>{{score[0]}}</td>
                          <td>{{score[1]}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import playerConfig from '../tools/editor/config/youtube-player'
import firebase from '../tools/config/firebase'
import Welcome from '../components/Welcome.vue'
import LoadingScreen from '../components/LoadingScreen.vue'

const YTPlayer = require('yt-player')

export default {
  components: {
    Welcome,
    'loading-screen': LoadingScreen
  },
  data () {
    return {
      createdBy: '',
      search: '',
      selectedSong: {
        general: {},
        charts: {},
        scores: {}
      },
      selectedChart: '',
      settings: false,
      videoDevicesLabels: [],
      selectedDeviceLabel: '',
      videoDevicesIds: {},
      speed: [0.5, 1, 2],
      // local and initial setting values
      options: {
        latency: 0.32,
        showAnimation: true,
        showWebcam: true,
        speed: 1,
        videoDevice: '',
        videoDeviceId: ''
      },
      loading: false,
      processingLike: false,
      username: '',
      player: null,
      filters: ['Title (A-Z)', 'Most Recent', 'Most Popular', 'My Creations'],
      filter: 'Most Popular'
    }
  },
  created () {
    this.filter = this.$store.state.currentSongFilter
    // load all songs from the database in the store on create lifecicle
    if (this.$store.state.songs.length === 0 || this.$store.state.songs.length === 1) {
      this.loading = true
      this.$store.dispatch('loadSongs', { filter: this.filter, requestedPage: 'first' }).then(() => {
        this.loading = false
      })
    }
    if (!this.$store.state.welcomeShown) {
      this.$store.commit('toggleWelcome', true)
    }
    // when this view is loaded, substitute the local setting options according to the options saved at the store / localStorage
    this.options.showAnimation = this.$store.state.gameOptions.showAnimation
    this.options.showWebcam = this.$store.state.gameOptions.showWebcam
    this.options.latency = this.$store.state.gameOptions.latency
    this.options.speed = this.$store.state.gameOptions.speed
  },
  mounted () {
    // to make sure the player div was created, create new youtube player when the view is mounted
    this.player = new YTPlayer('#player', playerConfig)
    this.getDevices()
  },
  methods: {
    getDevices: function () {
      navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(err => {
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to get your camera devices... Make sure they are connected and refresh this webpage.\n' + err.message)
        this.$store.commit('somethingWentWrong')
      })
    },
    selectDevice: function (label) {
      this.options.videoDevice = label
      this.options.videoDeviceId = this.videoDevicesIds[label]
    },
    gotDevices: function (devicesInfo) {
      devicesInfo.forEach(device => {
        // consider only video input
        if (device.kind === 'videoinput') {
          // push labels to an array
          this.videoDevicesLabels.push(device.label)
          // add id to an object with label as key
          this.videoDevicesIds[device.label] = device.deviceId
          // the first value that comes in will be the default
          if (this.selectedDeviceLabel === '') {
            this.selectedDeviceLabel = device.label
            this.selectDevice(device.label)
          }
        }
      })
    },
    loadNextPage: function () {
      this.loading = true
      this.$store.dispatch('loadSongs', { filter: this.filter, requestedPage: 'next' }).then(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
        this.$store.commit('somethingWentWrong')
      })
    },
    loadPreviousPage: function () {
      this.loading = true
      this.$store.dispatch('loadSongs', { filter: this.filter, requestedPage: 'previous' }).then(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
        this.$store.commit('somethingWentWrong')
      })
    },
    logChange: function (selection) {
      this.loading = true
      this.$store.commit('changeSongFilter', selection)
      this.$store.dispatch('loadSongs', { filter: this.filter, requestedPage: 'first' }).then(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
        this.$store.commit('somethingWentWrong')
      })
    },
    goToEditor: function () { // go to editor
      this.loading = true
      this.player.stop()
      this.player.destroy()
      // No Song, chart or difficulty should be in the store when going to the Editor
      this.$store.commit('selectSong', null)
      this.$store.commit('selectChart', null)
      this.$store.commit('selectSongId', null)
      this.$store.commit('selectDifficulty', '')
      this.$store.commit('changeSongFilter', 'My Creations')
      if (this.filter !== 'My Creations') {
        this.$store.dispatch('loadSongs', { filter: 'My Creations', requestedPage: 'first' }).then(() => {
          this.loading = false
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.commit('goToScene', 'editor')
        }).catch(() => {
          this.loading = false
          this.$store.commit('changeWrongMessage', 'Something went wrong trying to load this page.')
          this.$store.commit('somethingWentWrong')
        })
      } else {
        this.loading = false
        this.$store.commit('changeOptions', this.options)
        this.$store.commit('saveOptionsOnStorage')
        this.$store.commit('goToScene', 'editor')
      }
    },
    selectSong: function (song) { // get song info from the list of filtered songs
      this.selectedSong = song
      this.selectedChart = ''
      this.$store.commit('selectSong', song)
      this.player.load(song.general.videoId)
      this.$store.commit('changeSongScores', 'Select a difficulty')
      this.$store.commit('selectChart', null)
      this.$store.commit('selectSongId', song.general.songId)
      if (this.$vuetify.breakpoint.xs) document.getElementById('currentlySelected').scrollIntoView()
    },
    toggleLike: function (songId) {
      this.processingLike = true
      let toggleLike = firebase.functions.httpsCallable('toggleLike')
      toggleLike({ songId: songId }).then(res => {
        this.processingLike = false
        setTimeout(() => {
          let foundSong = false
          for (let song of this.$store.state.songs) {
            if (song.general.songId === songId) {
              foundSong = true
            }
          }
          if (!foundSong) {
            this.$store.commit('manuallyToggleLike', { songId: songId, likeState: res.data })
          }
        }, 200)
      }).catch(err => {
        this.$store.commit('changeWrongMessage', `${err.message}`)
        this.$store.commit('somethingWentWrong')
        this.processingLike = false
      })
    },
    goToGame: function () { // goes to the game after the chart is loaded
      if (this.selectedSong !== {} && this.selectedChart !== '') { // makes sure there is a selected song and a selected chart
        this.loading = true
        /* if the local settings are different from the store, save the local options to the store
        but alter that only after posenet is loaded */
        if (this.$store.state.net === null) {
          this.$store.dispatch('loadNet').then(response => {
            this.$store.commit('loadNet', response)
            this.$store.commit('changeOptions', this.options)
            this.$store.commit('saveOptionsOnStorage')
            this.$store.commit('selectSong', this.selectedSong)
            this.$store.dispatch('changeSelectedChart', this.selectedChart).then(() => {
              this.player.stop()
              this.player.destroy()
              this.$store.commit('goToScene', 'game')
            })
          }, error => {
            // deal with errors when loading posenet (if they occur)
            alert(error)
            this.$store.commit('changeWrongMessage', 'Due to a problem with MoveNet the game is not available right now. Please try it again later.')
            this.$store.commit('somethingWentWrong')
            this.player.stop()
            this.player.destroy()
            this.store.commit('goToScene', 'error')
          })
        } else {
          // if there is no need to load posenet
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.commit('selectSong', this.selectedSong)
          this.$store.dispatch('changeSelectedChart', this.selectedChart).then(() => {
            this.player.stop()
            this.player.destroy()
            this.$store.commit('goToScene', 'game')
          })
        }
      }
    },
    selectChart: function (chartId, dif) { // get the id of the selected chart so it can be loaded
      this.selectedChart = chartId
      this.$store.commit('selectDifficulty', dif)
      this.$store.commit('selectChart', chartId)
      if (!this.selectedSong.scores) {
        this.$store.commit('changeSongScores', 'No scores for this song yet!')
      } else {
        if (!this.selectedSong.scores[dif]) {
          this.$store.commit('changeSongScores', 'No scores for this difficulty yet!')
        } else {
          this.$store.dispatch('updateSongScores', this.selectedSong.scores[dif])
        }
      }
    },
    toggleSettings: function () { // show settings dialog
      this.settings = !this.settings
    },
    logout: function () { // sign out
      this.loading = true
      firebase.auth.signOut().then(() => {
        this.loading = false
        this.$store.commit('changeSongScores', 'Select a Song!')
        this.player.stop()
        this.player.destroy()
        this.$store.commit('resetUser', null)
        this.$store.commit('goToScene', 'home')
      }).catch((err) => {
        this.$store.commit('changeWrongMessage', err.message)
        this.$store.commit('somethingWentWrong')
      })
    },
    goToLatencyCalibration: function () { // similar to goToGame function, but instead loads webcam latency calibration
      this.loading = true
      if (this.$store.state.net === null) {
        this.$store.dispatch('loadNet').then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.dispatch('changeSelectedChart', '-LhMV2qkovpJ_sAFWcRm').then(() => {
            this.loading = false
            this.player.stop()
            this.player.destroy()
            this.$store.commit('goToScene', 'latency-test')
          })
        }, () => {
          this.loading = false
          this.$store.commit('changeWrongMessage', 'Due to a problem with PoseNet the game is not available right now. Please try it again later.')
          this.$store.commit('somethingWentWrong')
          this.player.stop()
          this.player.destroy()
          this.store.commit('goToScene', 'error')
        })
      } else {
        this.loading = false
        this.$store.commit('changeOptions', this.options)
        this.$store.commit('saveOptionsOnStorage')
        this.$store.dispatch('changeSelectedChart', '-LhMV2qkovpJ_sAFWcRm').then(() => {
          this.player.stop()
          this.player.destroy()
          this.$store.commit('goToScene', 'latency-test')
        })
      }
    }
  },
  computed: {
    songs: function () { // loads all songs from the $store
      return this.$store.state.showSongs.slice(0)
    },
    orderedSongs: function () {
      let allSongs = this.songs.slice(0)
      let orderedSongs = []
      // do not show latency test and songs that have no playable charts (unless it was created by the user)
      allSongs.forEach(song => {
        // ignore latencyTest
        if (song.general.songId !== '-LhMV2ryLrMUmubVy8wq') {
          // check for songs with only drafts
          let onlyDrafts = true
          for (let chart in song.charts) {
            if (song.charts[chart].draft === false) {
              onlyDrafts = false
            }
          }
          // ignore songs with only drafts that were not created by the user (not playable)
          if (!onlyDrafts) {
            orderedSongs.push(song)
          } else {
            if (this.$store.state.user !== null) {
              if (song.general.createdBy === this.$store.state.user.username) {
                orderedSongs.push(song)
              }
            }
          }
        }
      })

      if (this.filter === 'Most Recent') {
        orderedSongs.sort((a, b) => {
          if (a.general.updatedAt < b.general.updatedAt) {
            return 1
          }
          if (a.general.updatedAt > b.general.updatedAt) {
            return -1
          }
          return 0
        })
        // orderedSongs = orderedSongs.reverse()
      } else if (this.filter === 'Most Popular') {
        orderedSongs.sort((a, b) => {
          if (!a.general.likedBy) a.general.likedBy = 0
          if (!b.general.likedBy) b.general.likedBy = 0
          if (a.general.likedBy < b.general.likedBy) {
            return 1
          }
          if (a.general.likedBy > b.general.likedBy) {
            return -1
          }
          return 0
        })
        // orderedSongs = orderedSongs.reverse()
      } else if (this.filter === 'Title (A-Z)') {
        orderedSongs.sort((a, b) => {
          if (a.general.title > b.general.title) {
            return 1
          }
          if (a.general.title < b.general.title) {
            return -1
          }
          return 0
        })
      } else if (this.filter === 'My Creations') {
        if (this.$store.state.user) {
          orderedSongs = orderedSongs.filter(song => song.general.createdBy === this.$store.state.user.username)
        } else {
          orderedSongs = []
        }
      }
      if (this.$store.state.queryState !== 'first' && this.$store.state.pageCounter !== 1 && orderedSongs.length > 1 && this.filter !== 'My Creations') {
        orderedSongs.shift()
      }
      return orderedSongs
    },
    filteredSongs: function () { // Returns array of songs based on the search - filtered from the songs computed property above
      let filteredSongs = []

      for (let song of this.orderedSongs) {
        if (song.general.title.toLowerCase().includes(this.search.toLowerCase()) || song.general.artist.toLowerCase().includes(this.search.toLowerCase())) {
          filteredSongs.push(song)
        }
      }
      return filteredSongs
    },
    songCharts: function () { // returns charts object with charts ordered by difficulty
      if (this.selectedSong.hasOwnProperty('charts')) {
        let order = ['easy', 'medium', 'hard']
        let sortedChart = Object.entries(this.selectedSong.charts).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
        return Object.fromEntries(sortedChart)
      } else {
        return {}
      }
    }
  }
}
</script>
<style scoped>
  html, body {
    min-height: 100vh;
  }
  li {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  th {
    padding-bottom: 25px;
  }
  td {
    padding-bottom: 15px;
  }
  #background {
    background: rgb(3,3,3);
    background: linear-gradient(140deg, rgba(3,3,3,1) 0%, rgba(139,0,232,1) 6%, rgba(211,146,255,1) 12%, rgba(139,0,232,1) 18%, rgba(0,0,0,1) 46%, rgba(0,0,0,1) 55% ,rgba(29,240,255,1) 82%, rgba(146,250,255,1) 92%, rgba(29,240,255,1) 96%, rgba(0,0,0,1) 100%);
  }
  #cardBackground {
    background: rgb(255,255,255);
    background: linear-gradient(165deg, rgba(255,255,255,0) 64%, rgba(255,255,255,1) 75%, rgba(255,255,255,0) 85%);
  }
</style>
