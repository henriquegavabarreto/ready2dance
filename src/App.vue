<template>
  <div data-app=true>
    <component :is="$store.state.currentScene"></component>
  </div>
</template>

<script>
import Editor from './scenes/Editor'
import SongSelection from './scenes/SongSelection'
import Game from './scenes/Game'

export default {
  name: 'App',
  components: {
    'editor': Editor,
    'song-selection': SongSelection,
    'game': Game
  },
  data () {
    return {
      //
    }
  },
  created () {
    this.$store.dispatch('updateSongs')
    this.$store.dispatch('loadNet')
  }
}
</script>
