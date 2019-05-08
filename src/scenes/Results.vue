<template>
  <div>
    <h1>RESULTS</h1>
    <p>Perfect: {{results.perfect}}</p>
    <p>Awesome: {{results.awesome}}</p>
    <p>Good: {{results.good}}</p>
    <p>Max Combo: {{results.maxCombo}}</p>
    <p>Miss: {{results.miss}}</p>
    <p>{{results.report}}</p>
    <v-btn @click="goToSongSelection">BACK TO SONG SELECTION</v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    goToSongSelection: function () {
      this.$store.commit('goToSongSelection')
    }
  },
  computed: {
    results: function () {
      return this.$store.state.results
    }
  }
}
</script>
