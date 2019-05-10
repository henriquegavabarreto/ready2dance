<template>
  <div data-app=true>
    <component :is="$store.state.currentScene"></component>
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
    this.$store.dispatch('loadNet')
  }
}
</script>
