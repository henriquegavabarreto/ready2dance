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
                        <td>PERFECT</td>
                        <td class="resultNumbers">{{results.perfect}}</td>
                      </tr>
                      <tr>
                        <td>AWESOME</td>
                        <td class="resultNumbers">{{results.awesome}}</td>
                      </tr>
                      <tr>
                        <td>GOOD</td>
                        <td class="resultNumbers">{{results.good}}</td>
                      </tr>
                      <tr>
                        <td>MISS</td>
                        <td class="resultNumbers">{{results.miss}}</td>
                      </tr>
                      <tr>
                        <td>MAX COMBO</td>
                        <td class="resultNumbers">{{results.maxCombo}}</td>
                      </tr>
                      <tr>
                        <td>SCORE</td>
                        <td class="resultNumbers">{{results.score}}</td>
                      </tr>
                    </tbody>
                  </table>
                </v-flex>
                <v-flex class="text-xs-center" xs12 sm6>
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
              <v-btn @click="playAgain"><v-icon :class="!$vuetify.breakpoint.xs ? 'v-icon--left' : 'v-icon--center'">replay</v-icon><span class="hidden-xs-only">PLAY AGAIN</span></v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 md6 :class="!$vuetify.breakpoint.smAndDown ? 'pl-3' : 'pt-3'">
          <v-card dark style="border-radius: 10px;" v-if="typeof $store.state.songScores !== 'string'">

            <v-card-title primary-title class="display-3 font-weight-bold justify-center yellow darken-1 black--text">
              SCORE BOARD
            </v-card-title>
            <v-divider></v-divider>
            <h2 v-if="$store.state.user !== null" class="mt-3 mb-3 text-sm-center">Your ranking: # {{userPlace}}</h2>
            <h2 v-else class="mt-3 mb-3 text-sm-center">Register to have your next scores on the scoreboard!</h2>
            <v-divider></v-divider>
            <v-card-text class="scroll-y" style="max-height: 61vh;">
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
          <v-card dark style="height: 40vh; width: 100%; border-radius: 10px;" v-else>
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
  </div>
</template>

<script>
export default {
  methods: {
    goToSongSelection: function () {
      this.$store.commit('changeSongScores', 'Select a song!')
      this.$store.commit('goToSongSelection')
    },
    playAgain: function () {
      this.$store.commit('goToGame')
    }
  },
  computed: {
    results: function () {
      return this.$store.state.results
    },
    userPlace: function () {
      if (this.$store.state.user !== null) {
        let place = 1
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
    }
  }
}
</script>
<style scoped>
  #background {
    /* background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); */
    /* background: rgb(255,250,0);
    background: linear-gradient(333deg, rgba(255,250,0,1) 0%, rgba(0,251,255,1) 50%, rgba(254,0,255,1) 100%); */
    /* background: rgb(139,0,232);
    background: linear-gradient(140deg, rgba(139,0,232,1) 0%, rgba(211,146,255,1) 30%, rgba(255,255,255,1) 46%, rgba(255,255,255,1) 53%, rgba(255,146,146,1) 70%, rgba(255,29,29,1) 100%); */
    background: rgb(3,3,3);
    background: linear-gradient(40deg, rgba(3,3,3,1) 0%, rgba(139,0,232,1) 6%, rgba(211,146,255,1) 12%, rgba(139,0,232,1) 18%, rgba(0,0,0,1) 46%, rgba(0,0,0,1) 55% ,rgba(29,240,255,1) 82%, rgba(146,250,255,1) 92%, rgba(29,240,255,1) 96%, rgba(0,0,0,1) 100%);
  }
  th {
    padding-bottom: 25px;
  }
  td {
    padding-bottom: 15px;
    vertical-align: middle;
  }
  .resultNumbers {
    text-align: right;
  }
</style>
