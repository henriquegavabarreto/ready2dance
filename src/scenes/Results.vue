<template>
  <div style="min-height: 100vh; min-width: 100%;" id="background">
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs12 md6>
          <v-card dark style="border-radius: 10px;">
            <v-card-title primary-title class="display-3 font-weight-bold justify-center cyan lighten-1 black--text">
              RESULTS
            </v-card-title>
            <v-divider></v-divider>
            <div class="text-xs-center headline font-weight-medium mb-3 mt-3">
              {{$store.state.selectedSong.title}} - {{$store.state.selectedSong.artist}}<br/>{{$store.state.selectedDifficulty.toUpperCase()}}
            </div>
            <v-divider></v-divider>
            <v-card-text :class="!$vuetify.breakpoint.xs ? 'display-1 font-weight-medium' : 'headline'">
              <v-layout row wrap justify-center align-center>
                <v-flex xs12 sm6>
                  <table>
                    <tbody>
                      <tr>
                        <td class="resultNumbers">{{results.perfect}}</td>
                        <td>PERFECT</td>
                      </tr>
                      <tr>
                        <td class="resultNumbers">{{results.awesome}}</td>
                        <td>AWESOME</td>
                      </tr>
                      <tr>
                        <td class="resultNumbers">{{results.good}}</td>
                        <td>GOOD</td>
                      </tr>
                      <tr>
                        <td class="resultNumbers">{{results.miss}}</td>
                        <td>MISS</td>
                      </tr>
                      <tr>
                        <td class="resultNumbers">{{results.maxCombo}}</td>
                        <td>MAX COMBO</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 30px;">SCORE</td>
                        <td class="resultNumbers score" style="padding-top: 30px;">{{results.score}}</td>
                      </tr>
                    </tbody>
                  </table>
                </v-flex>
                <v-flex class="text-xs-center" xs12 sm3>
                  <v-layout row wrap justify-center align-center>
                    <v-flex xs12 style="max-width: 125px; max-height: 125px; border-radius: 15px;" :class="[gradeColor]">
                      <p class="pt-2 display-4 font-weight-bold">{{grade}}</p>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions icons-and-text class="justify-center">
              <v-btn @click="goToSongSelection"><v-icon :class="!$vuetify.breakpoint.xs ? 'v-icon--left' : 'v-icon--center'">queue_music</v-icon><span class="hidden-xs-only">BACK TO SONG SELECTION</span></v-btn>
              <v-btn @click="toggleSettings"><v-icon :class="!$vuetify.breakpoint.xs ? 'v-icon--left' : 'v-icon--center'">settings</v-icon><span class="hidden-xs-only">SETTINGS</span></v-btn>
              <v-btn @click="playAgain"><v-icon :class="!$vuetify.breakpoint.xs ? 'v-icon--left' : 'v-icon--center'">replay</v-icon><span class="hidden-xs-only">PLAY AGAIN</span></v-btn>
            </v-card-actions>
            <v-card-actions icons-and-text class="justify-center">
              <a
                style="text-decoration: none;"
                :href="twitterText"
                target="_blank">
                <v-btn><v-icon :class="!$vuetify.breakpoint.xs ? 'v-icon--left' : 'v-icon--center'">share</v-icon><span class="hidden-xs-only">SHARE ON TWITTER</span></v-btn></a>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 md6 :class="!$vuetify.breakpoint.smAndDown ? 'pl-3' : 'pt-3'">
          <v-card dark style="border-radius: 10px; min-height: 90vh;" v-if="typeof $store.state.songScores !== 'string'">

            <v-card-title primary-title class="display-3 font-weight-bold justify-center yellow darken-1 black--text">
              SCORE BOARD
            </v-card-title>
            <v-divider></v-divider>
            <span v-if="$store.state.user === null">
              <h2 class="mt-3 mb-3 text-sm-center">Register and try to get a place on the scoreboard!</h2>
              <v-divider></v-divider>
            </span>
            <v-card-text class="scroll-y" style="max-height: 61vh;">
              <table style="width: 100%; text-align: center;">
                <thead class="headline">
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                </thead>
                <tbody>
                  <tr v-for="(score, index) in $store.state.songScores" :key="index" :class="[($store.state.user !== null) && (score[0] === $store.state.user.username) ? 'pink lighten-1' : '', 'title']">
                    <td>{{index + 1}}</td>
                    <td>{{score[0]}}</td>
                    <td>{{score[1]}}</td>
                  </tr>
                </tbody>
              </table>
            </v-card-text>
          </v-card>
          <v-card dark style="min-height: 40vh; width: 100%; border-radius: 10px;" v-else>
            <v-card-title primary-title class="display-3 font-weight-bold justify-center yellow darken-1 black--text">
              SCORE BOARD
            </v-card-title>
            <v-divider></v-divider>
            <h2 class="mt-3 mb-3 text-sm-center">{{$store.state.songScores}}</h2>
            <v-divider></v-divider>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
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
  </div>
</template>

<script>
export default {
  data () {
    return {
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
      }
    }
  },
  created () {
    this.options.showAnimation = this.$store.state.gameOptions.showAnimation
    this.options.showWebcam = this.$store.state.gameOptions.showWebcam
    this.options.latency = this.$store.state.gameOptions.latency
    this.options.speed = this.$store.state.gameOptions.speed
    this.options.outputStride = this.$store.state.gameOptions.outputStride
    this.options.imageScale = this.$store.state.gameOptions.imageScale
    this.options.multiplier = this.$store.state.gameOptions.multiplier
  },
  methods: {
    goToSongSelection: function () {
      this.$store.commit('changeSongScores', 'Select a song!')
      this.$store.commit('goToScene', 'song-selection')
    },
    playAgain: function () {
      if (this.options.multiplier !== this.$store.state.gameOptions.multiplier) {
        this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.commit('goToScene', 'game')
        }, error => {
          this.$store.commit('changeWrongMessage', `Due to a problem with PoseNet the game is not available right now. Please try it again later. \n ${error}`)
          this.$store.commit('somethingWentWrong')
          this.store.commit('goToScene', 'error')
        })
      } else {
        this.$store.commit('changeOptions', this.options)
        this.$store.commit('saveOptionsOnStorage')
        this.$store.commit('goToScene', 'game')
      }
    },
    toggleSettings: function () {
      this.settings = !this.settings
    },
    goToLatencyCalibration: function () {
      if (this.options.multiplier !== this.$store.state.gameOptions.multiplier) {
        this.$store.dispatch('loadNet', this.options.multiplier).then(response => {
          this.$store.commit('loadNet', response)
          this.$store.commit('changeOptions', this.options)
          this.$store.commit('saveOptionsOnStorage')
          this.$store.dispatch('changeSelectedChart', '-LhMV2qkovpJ_sAFWcRm').then(() => {
            this.$store.commit('goToScene', 'latency-test')
          })
        }, error => {
          console.log(error)
          this.$store.commit('changeWrongMessage', 'Due to a problem with PoseNet the game is not available right now. Please try it again later.')
          this.$store.commit('somethingWentWrong')
          this.store.commit('goToScene', 'error')
        })
      } else {
        this.$store.commit('changeOptions', this.options)
        this.$store.commit('saveOptionsOnStorage')
        this.$store.dispatch('changeSelectedChart', '-LhMV2qkovpJ_sAFWcRm').then(() => {
          this.$store.commit('goToScene', 'latency-test')
        })
      }
    }
  },
  computed: {
    results: function () {
      return this.$store.state.results
    },
    userPlace: function () {
      if (this.$store.state.user !== null) {
        let place = 0
        this.$store.state.songScores.forEach((score, i) => {
          if (score[0] === this.$store.state.user.username) {
            place = i + 1
          }
        })
        return place
      } else {
        return null
      }
    },
    grade: function () {
      let grade = ''
      let rate = this.results.score / this.results.maxPoints
      if (rate === 1) {
        grade = 'SS'
      } else if (rate >= 0.95 && rate < 1) {
        grade = 'S'
      } else if (rate < 0.95 && rate >= 0.9) {
        grade = 'A'
      } else if (rate < 0.9 && rate >= 0.7) {
        grade = 'B'
      } else if (rate < 0.7 && rate >= 0.5) {
        grade = 'C'
      } else if (rate < 0.5 && rate >= 0.2) {
        grade = 'D'
      } else if (rate < 0.2 && rate >= 0) {
        grade = 'F'
      }
      return grade
    },
    gradeColor: function () {
      let cl = ''
      switch (this.grade) {
        case 'S':
          cl = 'red darken-2'
          break
        case 'A':
          cl = 'orange darken-2'
          break
        case 'B':
          cl = 'yellow darken-2'
          break
        case 'C':
          cl = 'green darken-2'
          break
        case 'D':
          cl = 'cyan darken-2'
          break
        case 'F':
          cl = 'black'
          break
      }
      return cl + ' mt-5'
    },
    twitterText: function () {
      return 'https://twitter.com/intent/tweet?text=' + encodeURI(`I played ${this.$store.state.selectedSong.title.toUpperCase()} (${this.$store.state.selectedDifficulty.toUpperCase()}) on Ready2Dance and scored ${this.results.score} (${this.grade})! You think you can beat me? ⭕ https://parapara-game.web.app ⭕`)
    }
  }
}
</script>
<style scoped>
  #background {
    background: rgb(3,3,3);
    background: linear-gradient(40deg, rgba(3,3,3,1) 0%, rgba(139,0,232,1) 6%, rgba(211,146,255,1) 12%, rgba(139,0,232,1) 18%, rgba(0,0,0,1) 46%, rgba(0,0,0,1) 55% ,rgba(29,240,255,1) 82%, rgba(146,250,255,1) 92%, rgba(29,240,255,1) 96%, rgba(0,0,0,1) 100%);
  }
  table {
    border-collapse: collapse;
  }
  th {
    padding-bottom: 20px;
  }
  td {
    border: none;
    padding-top: 10px;
    padding-bottom: 10px;
    vertical-align: middle;
  }
  .resultNumbers {
    text-align: right;
    padding-right: 30px;
  }
  .score {
    padding-right: 0;
  }
</style>
