<template>
  <div style="background-color:black; height:765px;">
    <v-layout row wrap justify-space-around class="pt-5">
      <v-flex xs5>
        <v-card dark style="height: 690px; width: 600px; border-radius: 10px;">
          <v-card-title primary-title class="display-3 font-weight-bold justify-center cyan darken-1 black--text">
            RESULTS
          </v-card-title>
          <v-divider></v-divider>
          <div class="text-xs-center headline font-weight-medium mb-3 mt-3">
            {{$store.state.selectedSong.title}} - {{$store.state.selectedSong.artist}}<br/>{{$store.state.selectedDifficulty.toUpperCase()}}
          </div>
          <v-divider></v-divider>
          <v-card-text class="display-1 font-weight-medium mb-4">
            <v-layout row nowrap>
              <v-flex xs6>
                <table class="pt-3 ml-3" style="width: 390px;">
                  <tbody>
                    <tr>
                      <td>PERFECT</td>
                      <td>{{results.perfect}}</td>
                    </tr>
                    <tr>
                      <td>AWESOME</td>
                      <td>{{results.awesome}}</td>
                    </tr>
                    <tr>
                      <td>GOOD</td>
                      <td>{{results.good}}</td>
                    </tr>
                    <tr>
                      <td>MISS</td>
                      <td>{{results.miss}}</td>
                    </tr>
                    <tr>
                      <td>MAX COMBO</td>
                      <td>{{results.maxCombo}}</td>
                    </tr>
                    <tr>
                      <td>SCORE</td>
                      <td>{{results.score}}</td>
                    </tr>
                  </tbody>
                </table>
              </v-flex>
              <v-flex class="text-xs-center mt-5 ml-5 pl-4 pt-3" xs6>
                <div style="width: 125px; height: 125px; border-radius: 15px; margin-left: 33%;" :class="[gradeColor]">
                  <p class="pt-2 display-4 font-weight-bold">{{grade}}</p>
                </div>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions icons-and-text class="justify-center">
            <v-btn class="mr-3" @click="goToSongSelection"><v-icon left>exit_to_app</v-icon>BACK TO SONG SELECTION</v-btn>
            <v-btn class="ml-3" @click="playAgain"><v-icon left>play_arrow</v-icon><span>PLAY AGAIN</span></v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs5>
        <v-card dark style="height: 690px; width: 600px; border-radius: 10px;" v-if="typeof $store.state.songScores !== 'string'">
          <v-card-title primary-title class="display-3 font-weight-bold justify-center yellow darken-1 black--text">
            SCORE BOARD
          </v-card-title>
          <v-divider></v-divider>
          <h2 v-if="$store.state.user !== null" class="mt-3 mb-3 text-sm-center">Your ranking: # {{userPlace}}</h2>
          <h2 else class="mt-3 mb-3 text-sm-center">Register to have your next scores on the scoreboard!</h2>
          <v-divider></v-divider>
          <v-card-text>
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
        <v-card dark style="height: 690px; width: 600px; border-radius: 10px;" v-else>
          <v-card-title primary-title class="display-3 font-weight-bold justify-center yellow darken-1 black--text">
            SCORE BOARD
          </v-card-title>
          <v-divider></v-divider>
          <h2 class="mt-3 mb-3 text-sm-center">{{$store.state.songScores}}</h2>
          <v-divider></v-divider>
        </v-card>
      </v-flex>
    </v-layout>
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
  th {
    padding-bottom: 25px;
  }
  td {
    padding-bottom: 15px;
    vertical-align: middle;
  }
</style>
