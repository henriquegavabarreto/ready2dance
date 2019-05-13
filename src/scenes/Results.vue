<template>
  <div style="background-color:black; height:765px;">
    <v-card dark style="height: 600px; width: 600px;">
      <v-card-title primary-title class="display-3 font-weight-black">
        RESULTS
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="display-1 font-weight-medium">
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
    }
  }
}
</script>
