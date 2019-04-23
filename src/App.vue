<template>
  <div data-app=true>
    <editor></editor>
  </div>
</template>

<script>
import Editor from './scenes/Editor'

export default {
  name: 'App',
  components: {
    'editor': Editor
  },
  data () {
    return {
      //
    }
  }
}
</script>
