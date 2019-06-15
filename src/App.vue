<template>
  <v-app>
    <div style="font-family: Arial;" data-app=true>
      <component :is="$store.state.currentScene"></component>
      <v-snackbar
        auto-height
        v-model="$store.state.somethingWentWrong"
        center
        :timeout="0"
      >
      <v-icon color="yellow" dark left>warning</v-icon>
      <span class="red--text"></span>
        {{$store.state.wrongMessage}}
        If this problem persists or this is not your problem, contact the webmaster.
        <v-btn
          flat
          @click="toggleWrong"
        >
        Close
        </v-btn>
      </v-snackbar>
    </div>
  </v-app>
</template>

<script>
import Editor from './scenes/Editor'
import SongSelection from './scenes/SongSelection'
import Game from './scenes/Game'
import Results from './scenes/Results'
import Home from './scenes/Home'
import LatencyTest from './scenes/LatencyTest'
import ErrorPage from './scenes/ErrorPage'

export default {
  name: 'App',
  components: {
    'editor': Editor,
    'song-selection': SongSelection,
    'game': Game,
    'results': Results,
    'home': Home,
    'latency-test': LatencyTest,
    'error': ErrorPage
  },
  beforeCreate () {
    this.$store.dispatch('onStateChange')
  },
  methods: {
    toggleWrong: function () {
      this.$store.commit('somethingWentWrong')
    }
  }
}
</script>
