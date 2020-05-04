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
      <v-select
        class="mt-3 ml-5"
        :items="filters"
        v-model="filter"
        label="order by"
      ></v-select>
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
    <!-- snackbars to show change of user status or not
    TODO: this could be only one snackbar that would change depending on the changeUserStatus response -->
    <v-snackbar
      auto-height
      v-model="usernameNotFound"
      class="black--text"
      color="yellow"
      :timeout="4000"
    >
      {{ userNameNotFoundText }}
    <v-btn dark small @click="usernameNotFound = !usernameNotFound">CLOSE</v-btn>
    </v-snackbar>
    <v-snackbar
      auto-height
      v-model="userStatusChanged"
      class="black--text"
      color="green"
      :timeout="4000"
    >
      User Status Changed.
      <v-btn dark small @click="userStatusChanged = !userStatusChanged">CLOSE</v-btn>
    </v-snackbar>
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
          <v-divider></v-divider>
          <h3 class="mt-4">POSE DETECTION <a href="https://www.npmjs.com/package/@tensorflow-models/posenet">(advanced)</a></h3>
          <v-select
            outline
            class="mt-4"
            :items="multipliers"
            v-model="options.multiplier"
            label="multiplier"
            hint="The larger the value, more accurate at the cost of speed - defaults to 0.5, which is recommended for mobiles"
          ></v-select>
          <v-select
            outline
            class="mt-4"
            :items="outputStrideValues"
            v-model="options.outputStride"
            label="output stride"
            hint="The smaller the value, more accurate at the cost of speed - defaults to 16"
          ></v-select>
          <v-slider
            class="mt-4"
            v-model="options.imageScale"
            color="blue"
            always-dirty
            label="Image Scale"
            thumb-label="always"
            :thumb-size="24"
            :min="0.2"
            :max="1"
            step="0.01"
            hint="The larger the value, more accurate at the cost of speed - defaults to 0.5"
            persistent-hint
          ></v-slider>
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
    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        style="border-radius: 10px;"
        dark
      >
        <v-card-text>
          Loading
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-content style="min-height: 100vh;">
      <v-container fluid fill-height>
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
              <v-container style="max-height: 78vh;" fluid grid-list-lg class="scroll-y">
                <v-layout row wrap>
                  <v-flex
                  xs12
                  v-for="(song, i) in orderedSongs"
                  :key="song.general.title + song.general.artist + i"
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
                            <span class="ml-5"><v-icon color="white">favorite</v-icon></span><span class="ml-1">{{song.general.likedBy ? song.general.likedBy : 0 }}</span>
                          </div>
                        </div>
                      </v-card-title>
                    </v-card>
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
                      <v-btn fab small :color="!$store.state.user ? 'red lighten-2' : !$store.state.user.likedSongs ? 'red lighten-2' : $store.state.user.likedSongs[$store.state.selectedSongId] ? 'red' : 'red lighten-2'" @click="toggleLike(song.general.songId)" :loading="processingLike" :disabled="processingLike"><v-icon color="white">favorite</v-icon></v-btn>
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

const YTPlayer = require('yt-player')

export default {
  components: {
    Welcome
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
      multipliers: [0.5, 0.75, 1.0],
      outputStrideValues: [8, 16, 32],
      speed: [0.5, 1, 2],
      // local and initial setting values
      options: {
        multiplier: 0.5,
        outputStride: 16,
        imageScale: 0.5,
        latency: 0.32,
        showAnimation: true,
        showWebcam: true,
        speed: 1
      },
      loading: false,
      processingLike: false,
      usernameToChange: '',
      usernameNotFound: false,
      userNameNotFoundText: '',
      userStatusChanged: false,
      username: '',
      manageUsers: false,
      selectedUser: '',
      users: null,
      player: null,
      filters: ['creation date', 'last updated', 'A-Z', 'favorites only', 'most popular'],
      filter: ''
    }
  },
  beforeCreate () {
    // load all songs from the database in the store on before create lifecicle
    if (this.$store.state.songs === null) {
      this.$store.dispatch('loadSongs')
    }
    if (!this.$store.state.welcomeShown) {
      this.$store.commit('toggleWelcome', true)
    }
  },
  created () {
    // when this view is loaded, substitute the local setting options according to the options saved at the store / localStorage
    this.options.showAnimation = this.$store.state.gameOptions.showAnimation
    this.options.showWebcam = this.$store.state.gameOptions.showWebcam
    this.options.latency = this.$store.state.gameOptions.latency
    this.options.speed = this.$store.state.gameOptions.speed
    this.options.outputStride = this.$store.state.gameOptions.outputStride
    this.options.imageScale = this.$store.state.gameOptions.imageScale
    if (this.$store.state.gameOptions.multiplier === 0) {
      // not ideal solution, but detects major mobile devices
      // this only happens when loading this scene for the first time, after that multiplier will be loaded from the local storage
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // load multiplier 0.5 if mobile device
        this.options.multiplier = 0.5
      } else {
        // load multiplier 0.75 if not mobile
        this.options.multiplier = 0.75
      }
      this.$store.commit('changeMultiplier', this.options.multiplier)
    } else {
      this.options.multiplier = this.$store.state.gameOptions.multiplier
    }
  },
  mounted () {
    // to make sure the player div was created, create new youtube player when the view is mounted
    this.player = new YTPlayer('#player', playerConfig)
  },
  methods: {
    goToEditor: function () { // go to editor
      this.player.stop()
      this.player.destroy()
      this.$store.commit('changeOptions', this.options)
      this.$store.commit('saveOptionsOnStorage')
      this.$store.commit('goToScene', 'editor')
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
        console.log(res.data)
        this.processingLike = false
      }).catch(err => {
        console.log(err)
        this.processingLike = false
      })
    },
    goToGame: function () { // goes to the game after the chart is loaded
      if (this.selectedSong !== {} && this.selectedChart !== '') { // makes sure there is a selected song and a selected chart
        this.loading = true
        /* if the local settings are different from the store, save the local options to the store
        but alter that only after the new posenet is loaded (if the local multiplier is different from the store) */
        if (this.options.multiplier !== this.$store.state.gameOptions.multiplier || this.$store.state.net === null) {
          this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
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
            this.$store.commit('changeWrongMessage', 'Due to a problem with PoseNet the game is not available right now. Please try it again later.')
            this.$store.commit('somethingWentWrong')
            this.player.stop()
            this.player.destroy()
            this.store.commit('goToScene', 'error')
          })
        } else {
          // if there is no need to load a new multiplier for posenet
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
      firebase.auth.signOut().then(() => {
        this.$store.commit('changeSongScores', 'Select a Song!')
        this.player.stop()
        this.player.destroy()
        this.$store.commit('changeUser', null)
        this.$store.commit('goToScene', 'home')
      }).catch((err) => {
        alert(err)
      })
    },
    goToLatencyCalibration: function () { // similar to goToGame function, but instead loads webcam latency calibration
      if (this.options.multiplier !== this.$store.state.gameOptions.multiplier || this.$store.state.net === null) {
        this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.dispatch('changeSelectedChart', '-LhMV2qkovpJ_sAFWcRm').then(() => {
            this.player.stop()
            this.player.destroy()
            this.$store.commit('goToScene', 'latency-test')
          })
        }, error => {
          alert(error)
          this.$store.commit('changeWrongMessage', 'Due to a problem with PoseNet the game is not available right now. Please try it again later.')
          this.$store.commit('somethingWentWrong')
          this.player.stop()
          this.player.destroy()
          this.store.commit('goToScene', 'error')
        })
      } else {
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
      return this.$store.state.songs
    },
    orderedSongs: function () {
      let orderedSongs = []
      for (let songId in this.filteredSongs) {
        let song = this.filteredSongs[songId]
        song.general.songId = songId
        orderedSongs.push(song)
      }
      // returns ordered from A-Z by default
      orderedSongs.sort((a, b) => {
        if (a.general.title > b.general.title) {
          return 1
        }
        if (a.general.title < b.general.title) {
          return -1
        }
        return 0
      })

      if (this.filter === 'creation date') {
        orderedSongs.sort((a, b) => {
          if (a.general.createdAt < b.general.createdAt) {
            return 1
          }
          if (a.general.createdAt > b.general.createdAt) {
            return -1
          }
          return 0
        })
      } else if (this.filter === 'last updated') {
        orderedSongs.sort((a, b) => {
          if (a.general.updatedAt < b.general.updatedAt) {
            return 1
          }
          if (a.general.updatedAt > b.general.updatedAt) {
            return -1
          }
          return 0
        })
      } else if (this.filter === 'most popular') {
        orderedSongs.sort((a, b) => {
          if (a.general.likedBy) {
            if (b.general.likedBy) {
              if (a.general.likedBy < b.general.likedBy) {
                return 1
              }
              if (a.general.likedBy > b.general.likedBy) {
                return -1
              }
            } else {
              return -1
            }
          }
          return 0
        })
      }
      return orderedSongs
    },
    filteredSongs: function () { // Returns array of songs based on the search - filtered from the songs computed property above
      let filteredSongs = {}

      for (let songId in this.songs) {
        if (songId !== '-LhMV2ryLrMUmubVy8wq') {
          if (this.songs[songId].general.title.toLowerCase().includes(this.search.toLowerCase()) || this.songs[songId].general.artist.toLowerCase().includes(this.search.toLowerCase())) {
            filteredSongs[songId] = this.songs[songId]
          }
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
