<template>
  <div>
    RESULTS
    <v-btn @click="goToSongSelection">BACK TO SONG SELECTION</v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    goToSongSelection: function () {
      this.$store.commit('goToSongSelection')
    }
  }
}
</script>
