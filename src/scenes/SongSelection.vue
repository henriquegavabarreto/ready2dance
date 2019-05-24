<template>
  <div style="background-color: black; height: 765px;">
    <v-toolbar
      color="primary"
      dark
    >
      <v-text-field
        prepend-icon="search"
        label="Search"
        v-model="search"
        placeholder="Search by Song Title or Artist"
        solo-inverted
        class="mx-3"
        flat
      ></v-text-field>
      <v-btn @click="toggleSettings"><v-icon>settings</v-icon></v-btn>
      <v-btn v-if="$store.state.user.type === 'admin'" @click="manageUsers = true"><v-icon>assignment_ind</v-icon></v-btn>
      <v-btn v-if="$store.state.user.type !== 'user'" @click="goToEditor">EDITOR</v-btn>
      <v-btn @click="logout">LOGOUT</v-btn>
    </v-toolbar>
    <v-dialog
    v-model="manageUsers"
    max-width="500"
    min-height="500"
    >
      <v-card>
        <v-card-title class="headline">Manage Users</v-card-title>

        <v-card-text>
          <v-list dense two-line style="max-height: 400px; max-width: 400px;" class="scroll-y blue lighten-5">
            <v-list-tile
              v-for="(user, name) in users"
              :key="name"
              :class="selectedUser === name ? 'blue lighten' : ''"
              @click="selectedUser = name"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{user.username}}</v-list-tile-title>
                <v-list-tile-sub-title>{{user.type}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="changeUserStatus('user')">user</v-btn>
          <v-btn @click="changeUserStatus('editor')">editor</v-btn>
          <v-btn @click="changeUserStatus('admin')">admin</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="settings"
      max-width="500"
      min-height="500"
    >
      <v-card>
        <v-toolbar flat class="cyan headline">
          Settings
        </v-toolbar>

        <v-card-text class="blue-grey lighten-5">
          <h3>Animations</h3>
          <v-checkbox
            color="blue"
            v-model="options.showAnimation">
            <template v-slot:label>
              <div class="black--text">
                Show circle animations
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
                Show video from webcam
              </div>
            </template>
          </v-checkbox>
          <v-text-field
            outline
            label="Camera Latency"
            v-model="options.latency"
            hint="ex: 0.32"
          ></v-text-field>
          <v-divider></v-divider>
          <h3 class="mt-4">Change pose detection precision (advanced)</h3>
          <v-select
            outline
            class="mt-4"
            :items="multipliers"
            v-model="options.multiplier"
            label="multiplier"
            hint="The larger the value, more accurate at the cost of speed - defaults to 0.5"
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
    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
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
    <v-container mx-0>
      <v-layout row wrap justify-space-between>
        <v-flex xs5>
          <v-card style="width: 550px; border-radius: 10px;" class="blue-grey lighten-5">
            <v-card-title>
              <v-icon
                large
                left
                color="black"
              >
                queue_music
              </v-icon>
              <span class="display-1">Select a Song</span>
            </v-card-title>
            <v-container fluid grid-list-lg style="height: 580px;" class="scroll-y">
              <v-layout row wrap>
                <v-flex
                xs12
                v-for="song in filteredSongs"
                :key="song.videoId"
                @click="selectSong(song)">
                  <v-card
                    style="border-radius: 15px;"
                    hover
                    :class="selectedSong.title === song.title ? 'blue lighten' : ''">
                    <v-card-title primary-title>
                      <div>
                        <h3 class="headline mb-0">{{song.title}}</h3>
                        <div>{{song.artist}}</div>
                      </div>
                    </v-card-title>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
        <v-flex xs6 v-if="selectedSong">
          <v-card style="width: 800px; border-radius: 10px;" class="blue-grey lighten-5">
            <v-card-title primary-title>
              <div class="mr-5">
                <h3 class="headline mb-1">{{selectedSong.title}} {{filteredSongs.title}}</h3>
                <div class="subheading">{{selectedSong.artist}}</div>
              </div>
              <div v-for="(chartId, dif) in songCharts" :key="dif">
                <v-btn
                  small
                  @click="selectChart(chartId, dif)"
                  :class="selectedChart === chartId ? 'blue lighten' : ''">{{dif}}</v-btn>
              </div>
              <v-spacer></v-spacer>
              <v-btn class="ml-5"
                :disabled="selectedChart === ''"
                @click="goToGame"><v-icon>play_arrow</v-icon></v-btn>
            </v-card-title>
          </v-card>
          <v-card v-show="selectedSong !== {}" style="width: 800px; height: 542px; border-radius: 10px;" class="mt-3 blue-grey lighten-5">
            <v-card-title class="display-2" primary-title>
              SCORE BOARD
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text v-if="typeof $store.state.songScores === 'string'">
              {{$store.state.songScores}}
            </v-card-text>
            <v-card-text v-else>
              <table class="scroll-y" style="width: 600px; max-height: 400px;">
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
    </v-container>
  </div>
</template>

<script>
import firebase from '../tools/config/firebase'

export default {
  data () {
    return {
      search: '',
      selectedSong: {},
      selectedChart: '',
      settings: false,
      multipliers: [0.5, 0.75, 1.0],
      outputStrideValues: [8, 16, 32],
      speed: [0.5, 1, 2],
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
      username: '',
      manageUsers: false,
      selectedUser: '',
      users: null
    }
  },
  created () {
    firebase.database.ref('users').on('value', (data) => {
      this.users = data.val()
    })
    this.options.showAnimation = this.$store.state.gameOptions.showAnimation
    this.options.showWebcam = this.$store.state.gameOptions.showWebcam
    this.options.latency = this.$store.state.gameOptions.latency
    this.options.multiplier = this.$store.state.gameOptions.multiplier
    this.options.speed = this.$store.state.gameOptions.speed
    this.options.outputStride = this.$store.state.gameOptions.outputStride
    this.options.imageScale = this.$store.state.gameOptions.imageScale
  },
  methods: {
    goToEditor: function () { // go to editor
      this.$store.commit('goToEditor')
    },
    selectSong: function (song) { // get song info from the list of filtered songs
      this.selectedSong = song
      this.$store.commit('selectSong', song)
      this.$store.commit('changeSongScores', 'Select a difficulty')
    },
    goToGame: function () { // goes to the game after the chart is loaded
      if (this.selectedSong !== {} && this.selectedChart !== '') {
        this.loading = true
        if (this.options.multiplier !== this.$store.state.gameOptions.multiplier) { // if there is a new multiplier
          this.$store.dispatch('loadNet', this.options.multiplier).then(() => {
            this.$store.commit('changeOptions', this.options)
            this.$store.commit('selectSong', this.selectedSong)
            this.$store.dispatch('changeSelectedChart', this.selectedChart).then(() => {
              this.$store.commit('goToGame')
            })
          })
        } else { // if the multiplier is the same as in the store
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('selectSong', this.selectedSong)
          this.$store.dispatch('changeSelectedChart', this.selectedChart).then(() => {
            this.$store.commit('goToGame')
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
    toggleSettings: function () {
      this.settings = !this.settings
    },
    logout: function () {
      firebase.auth.signOut().then(() => {
        this.$store.commit('changeSongScores', 'Select a Song!')
        this.$store.commit('goToHome')
      }).catch((err) => { console.log(err) })
    },
    changeUserStatus: function (status) {
      firebase.database.ref('users').once('value').then((value) => {
        let users = value.val()
        for (let user in users) {
          if (user === this.selectedUser) {
            firebase.database.ref(`users/${user}`).update({
              type: status
            })
            return
          }
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  },
  computed: {
    songs: function () { // loads all songs from the $store
      return this.$store.state.songs
    },
    filteredSongs: function () { // Returns array of songs based on the search.
      let songArray = []
      let filteredSongs = []

      for (let song in this.songs) {
        songArray.push(this.songs[song])
      }

      songArray.filter((songs) => {
        if (songs.title.toLowerCase().includes(this.search.toLowerCase()) || songs.artist.toLowerCase().includes(this.search.toLowerCase())) {
          filteredSongs.push(songs)
        }
      })
      return filteredSongs
    },
    songCharts: function () { // returns charts object with charts by order of difficulty
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
  th {
    padding-bottom: 25px;
  }
  td {
    padding-bottom: 15px;
  }
</style>
