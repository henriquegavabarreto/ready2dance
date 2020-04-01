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
          <v-list-tile v-if="$store.state.user.type === 'admin'" @click="manageUsers = true">
            <v-list-tile-title><v-icon left>assignment_ind</v-icon><span>Users</span></v-list-tile-title>
          </v-list-tile>
          <!-- OLD CONDITION: v-if="$store.state.user.type === 'admin' || $store.state.user.type === 'editor'" -->
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
    <!-- user management dialog - fill text field with user name and click button with the desired user type -->
    <v-dialog
      v-model="manageUsers"
      max-width="400"
      min-height="500"
    >
      <v-card style="border-radius: 10px;">
        <v-card-title class="cyan headline justify-center white--text font-weight-medium">
          Manage Users
        </v-card-title>

        <v-card-text class="mb-0 pb-0">
          <v-text-field
            label="username"
            outline
            v-model="usernameToChange"
          ></v-text-field>
        </v-card-text>
        <v-card-text class="mt-0 pt-0 subheading font-weight-bold justify-center">
          Change user status to:
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn dark small @click="changeUserStatus('user')">user</v-btn>
          <v-btn dark small @click="changeUserStatus('editor')">editor</v-btn>
          <v-btn dark small @click="changeUserStatus('admin')">admin</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    <!-- welcome dialog that describes some of the apps functionalities and warnings -->
    <v-dialog
      v-model="$store.state.welcome"
      persistent
      max-width="400"
    >
      <v-card style="border-radius: 10px;">
        <v-card-title class="black headline justify-center white--text font-weight-medium">
          Welcome to Ready2Dance!
        </v-card-title>

        <v-card-text class="subheading scroll-y" style="max-height: 60vh;">
          <p class="text-xs-center pb-3">Thank you for login in! If this is your first time here please read the instructions below!</p>
          <ul>
            <li>This website use a lot of data (22~90MB PoseNet + video streaming), so you may prefer to use it on Wi-Fi only to avoid charges from your carrier.</li>
            <li>This game uses your front camera, so remember to allow it to be used so the game can begin - sometimes adblock or pop-up blockers get on the way.</li>
            <li>Stay at least 1.8m (6ft) away from the camera, otherwise the movement detection won't work properly.</li>
            <li>Static clear backgrounds work best for detection as well as good lighting conditions.</li>
            <li>Every device has a different camera latency. Check your current device latency using your prefered method (<a href="https://www.youtube.com/watch?v=WXud3F-Cuac">this is one</a>) and change it in the settings or try the calibration on settings.</li>
            <li>Options in settings are not stored, so you will need to set all your preferences again if the page is reloaded or whenever you visit this website again.</li>
            <li>If you have any problems or suggestions, please contact us.</li>
          </ul>
          <p class="text-xs-center pt-3 pb-0 mb-0">Have fun!</p>
        </v-card-text>

        <v-card-actions class="black justify-center">

          <v-btn
            class="white"
            color="green darken-1"
            flat
            @click="$store.commit('toggleWelcome', false)"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- settings dialog - where user can change options regarding in game animations and
    posenet configuration
    TODO: when updated to posenet 2.0, change these options to match the package as well -->
    <v-dialog
      v-model="settings"
      max-width="400"
    >
      <v-card style="border-radius: 10px;">
        <v-card-title class="cyan headline justify-center white--text font-weight-medium">
          Settings
        </v-card-title>

        <v-card-text>
          <h3>Animations</h3>
          <v-checkbox
            color="blue"
            v-model="options.showAnimation">
            <template v-slot:label>
              <div class="black--text">
                Show animations
              </div>
            </template>
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
          <h3 class="mt-4">Camera</h3>
          <v-checkbox
            color="blue"
            v-model="options.showWebcam">
            <template v-slot:label>
              <div class="black--text">
                Show webcam video
              </div>
            </template>
          </v-checkbox>
          <v-text-field
            outline
            label="Camera Latency"
            v-model="options.latency"
            hint="ex: 0.32"
          >
          </v-text-field>
          <a href="https://www.youtube.com/watch?v=WXud3F-Cuac"><p>Check out this video if you are having any trouble to find your camera's latency</p></a>
          <p class="text-xs-center">OR</p>
          <v-btn block @click="goToLatencyCalibration">Calibrate Latency (WIP)</v-btn>
          <v-divider></v-divider>
          <h3 class="mt-4">Change pose detection precision <a href="https://www.npmjs.com/package/@tensorflow-models/posenet">(advanced)</a></h3>
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
                  large
                  left
                  color="black"
                >
                  queue_music
                </v-icon>
                <span class="display-1 font-weight-medium">Select a Song</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-container style="max-height: 75vh;" fluid grid-list-lg class="scroll-y">
                <v-layout row wrap>
                  <v-flex
                  xs12
                  v-for="song in filteredSongs"
                  :key="song.videoId"
                  @click="selectSong(song)">
                    <v-card
                      style="border-radius: 15px;"
                      hover
                      id="cardBackground"
                      :class="selectedSong.title === song.title ? 'pink darken-1 white--text' : 'blue lighten-4'">
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0 font-weight-bold">{{song.title}}</h3>
                          <div class="pt-2 title font-weight-regular">{{song.artist}}</div>
                        </div>
                      </v-card-title>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
          <!-- v-flex that show videos and available chart difficulties for the selected song -->
          <v-flex sm12 md6 :class="!$vuetify.breakpoint.smAndDown ? 'pl-3' : 'pt-3'" v-show="selectedSong.title">
            <v-layout row wrap>
              <v-flex xs12 id="currentlySelected">
                <v-card style="border-radius: 10px;" class="blue-grey lighten-5 text-xs-center">
                  <v-card-title primary-title class="justify-center cyan pb-1">
                    <div>
                      <h3 class="display-1 mb-2 font-weight-bold">{{selectedSong.title}} / {{selectedSong.artist}}</h3>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <div id="player" style="max-height: 300px;"></div>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-text style="display: inline;" class="justify-center pl-0">
                    <div style="display: inline;" v-for="(chart, dif) in songCharts" :key="dif">
                      <v-btn
                        @click="selectChart(chart.id, dif); getCreator(dif);"
                        :class="selectedChart === chart.id ? 'blue lighten' : ''"
                        :disabled="chart.draft && ($store.state.user === null || $store.state.user.type === 'user')">{{dif}}<span v-if="chart.draft">(SOON)</span></v-btn>
                    </div>
                    <div v-if="selectedChart" class="justify-center ma-1">
                      Created by: {{ createdBy }}
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn
                      dark
                      class="ml-4 lighten-2"
                      :disabled="$store.state.selectedChartId === null"
                      @click="goToGame"><v-icon left>play_arrow</v-icon>PLAY</v-btn>
                  </v-card-text>
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

const YTPlayer = require('yt-player')

export default {
  data () {
    return {
      createdBy: '',
      search: '',
      selectedSong: {},
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
      usernameToChange: '',
      usernameNotFound: false,
      userNameNotFoundText: '',
      userStatusChanged: false,
      username: '',
      manageUsers: false,
      selectedUser: '',
      users: null,
      player: null
    }
  },
  beforeCreate () {
    // load all songs from the database in the store on before create lifecicle
    if (this.$store.state.songs === null) {
      this.$store.dispatch('loadSongs')
    }
  },
  created () {
    // when this view is loaded, substitute the local setting options according to the options saved at the store
    this.options.showAnimation = this.$store.state.gameOptions.showAnimation
    this.options.showWebcam = this.$store.state.gameOptions.showWebcam
    this.options.latency = this.$store.state.gameOptions.latency
    this.options.speed = this.$store.state.gameOptions.speed
    this.options.outputStride = this.$store.state.gameOptions.outputStride
    this.options.imageScale = this.$store.state.gameOptions.imageScale
    if (this.$store.state.gameOptions.multiplier === 0) {
      // not ideal solution, but detects major mobile devices
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // load multiplier 0.5 if mobile device
        this.options.multiplier = 0.5
      } else {
        // load multiplier 0.75 if not mobile
        this.options.multiplier = 0.75
      }
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
      this.$store.commit('goToScene', 'editor')
    },
    selectSong: function (song) { // get song info from the list of filtered songs
      this.selectedSong = song
      this.selectedChart = ''
      this.$store.commit('selectSong', song)
      this.player.load(song.videoId)
      this.$store.commit('changeSongScores', 'Select a difficulty')
      this.$store.commit('selectChart', null)
      if (this.$vuetify.breakpoint.xs) document.getElementById('currentlySelected').scrollIntoView()
    },
    goToGame: function () { // goes to the game after the chart is loaded
      if (this.selectedSong !== {} && this.selectedChart !== '') { // makes sure there is a selected song and a selected chart
        this.loading = true
        /* if the local settings are different from the store, save the local options to the store
        but alter that only after the new posenet is loaded (if the local multiplier is different from the store) */
        if (this.options.multiplier !== this.$store.state.gameOptions.multiplier) {
          this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
            this.$store.commit('loadNet', response)
            this.$store.commit('changeOptions', this.options)
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
    getCreator: function (dif) {
      if (this.selectedSong.charts[dif].createdBy) {
        this.createdBy = this.selectedSong.charts[dif].createdBy
      } else {
        this.createdBy = 'unknown'
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
    changeUserStatus: function (status) { // change user status in the database
      firebase.database.ref('users').orderByChild('username').equalTo(`${this.usernameToChange}`).once('value', snapshot => {
        if (snapshot.val() !== null) { // if the user exists
          firebase.database.ref('users/' + Object.keys(snapshot.val())[0]).update({
            type: status
          }).then(() => {
            this.userStatusChanged = true
            this.manageUsers = false
          })
        } else { // if this user name was not found
          this.usernameNotFound = true
          this.usernameNotFoundText = 'There is no user with this username.'
        }
      })
    },
    goToLatencyCalibration: function () { // similar to goToGame function, but instead loads webcam latency calibration
      if (this.options.multiplier !== this.$store.state.gameOptions.multiplier) {
        this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('changeOptions', this.options)
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
    filteredSongs: function () { // Returns array of songs based on the search - filtered from the songs computed property above
      let songArray = []
      let filteredSongs = []

      for (let song in this.songs) {
        songArray.push(this.songs[song])
      }

      songArray.filter((songs) => {
        if (songs.title !== 'Latency Test') {
          if (songs.title.toLowerCase().includes(this.search.toLowerCase()) || songs.artist.toLowerCase().includes(this.search.toLowerCase())) {
            filteredSongs.push(songs)
          }
        }
      })
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
