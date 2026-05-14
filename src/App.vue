<!-- App - where components are loaded dynamicaly -->
<template>
  <v-app>
    <div data-app=true>
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
        <!-- Add download chart button if video was unplayable in game -->
        <v-btn
          v-if="$store.state.unplayableVideo && $store.state.selectedChart"
          flat
          @click="downloadUnplayable"
          >
          Download Chart
        </v-btn>
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
import Maintenance from './scenes/Maintenance'

export default {
  name: 'App',
  components: {
    'editor': Editor,
    'song-selection': SongSelection,
    'game': Game,
    'results': Results,
    'home': Home,
    'latency-test': LatencyTest,
    'error': ErrorPage,
    'maintenance': Maintenance
  },
  data () {
    return {
      maintenanceMode: false
    }
  },
  created () {
    if (this.maintenanceMode) {
      this.$store.commit('goToScene', 'maintenance')
    } else {
      this.$store.commit('goToScene', 'home')
      this.$store.commit('loadLocalStorage')
      this.$store.dispatch('onStateChange')
    }
  },
  beforeDestroy () {
    if (this.$store.state.lastQuery !== null) {
      this.$store.state.lastQuery.off()
    }
    if (this.$store.state.likedSongsRef !== null) {
      this.$store.state.likedSongsRef.off()
    }
  },
  methods: {
    // close snackbar and toggle unplayableVideo if necessary
    toggleWrong: function () {
      this.$store.commit('somethingWentWrong')
      // reset unplayable chart and state on dismiss
      if (this.$store.state.unplayableVideo) {
        this.$store.commit('toggleUnplayableState')
        this.$store.commit('setUnplayableChart', null)
      }
    },
    downloadUnplayable: function () {
      // get unplayable chart from store
      let chart = this.$store.state.unplayableChart

      // download as JSON file
      const a = document.createElement('a')
      const file = new Blob([JSON.stringify(chart)], { type: 'text/plain' })
      a.href = URL.createObjectURL(file)
      a.download = `${chart.artist} - ${chart.title}.json`
      a.click()

      // reset unplayable chart after download
      this.$store.commit('setUnplayableChart', null)
      this.toggleWrong()
    }
  }
}
</script>
