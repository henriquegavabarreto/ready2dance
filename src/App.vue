<template>
  <div data-app=true>
    <component :is="$store.state.currentScene"></component>
    <v-snackbar
      v-model="$store.state.somethingWentWrong"
      center
      :timeout="8000"
    >
    <v-icon dark left>warning</v-icon>
      Something went wrong. Make sure your camera is working or verify your browser preferences.
      <v-btn
        flat
        @click="toggleWrong"
      >
      Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import Editor from './scenes/Editor'
import SongSelection from './scenes/SongSelection'
import Game from './scenes/Game'
import Results from './scenes/Results'

export default {
  name: 'App',
  components: {
    'editor': Editor,
    'song-selection': SongSelection,
    'game': Game,
    'results': Results
  },
  data () {
    return {
      //
    }
  },
  created () {
    this.$store.dispatch('updateSongs')
    // load the net before going to the game, according to settings
    this.$store.dispatch('loadNet', 0.5)
  },
  methods: {
    toggleWrong: function () {
      this.$store.commit('somethingWentWrong')
    }
  }
}
</script>
