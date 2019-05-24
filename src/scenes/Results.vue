<template>
  <div style="background-color:black; height:765px;">
    <v-layout row wrap justify-space-around class="pt-5">
      <v-flex xs5>
        <v-card dark style="height: 600px; width: 600px;">
          <v-card-title primary-title class="display-3 font-weight-black">
            RESULTS
          </v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-card-text class="display-1 font-weight-medium mb-4">
            <p>Perfect: {{results.perfect}}</p>
            <p>Awesome: {{results.awesome}}</p>
            <p>Good: {{results.good}}</p>
            <p>Max Combo: {{results.maxCombo}}</p>
            <p>Miss: {{results.miss}}</p>
            <p>Score: {{results.score}}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="goToSongSelection">BACK TO SONG SELECTION</v-btn>
            <v-btn @click="playAgain">PLAY AGAIN</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs5>
        <v-card dark style="height: 600px; width: 600px;" v-if="typeof $store.state.songScores !== 'string'">
          <v-card-title primary-title class="display-3 font-weight-black">
            SCORE BOARD
          </v-card-title>
          <v-divider></v-divider>
          <h2 class="mt-3 mb-3 text-sm-center">Your ranking: #{{userPlace}}</h2>
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
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  methods: {
    goToSongSelection: function () {
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
      return this.$store.state.songScores.forEach((score, index) => {
        if (score[0] === this.$store.state.user.username) {
          return index + 1
        }
      })
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
