<template>
  <div data-app=true>
    <editor></editor>
    <!-- <song-selection></song-selection> -->
  </div>
</template>

<script>
import Editor from './scenes/Editor'
// import SongSelection from './scenes/SongSelection'

export default {
  name: 'App',
  components: {
    'editor': Editor
    // 'song-selection': SongSelection
  },
  data () {
    return {
      //
    }
  },
  created () {
    this.$store.dispatch('updateSongs')
  }
}
</script>
