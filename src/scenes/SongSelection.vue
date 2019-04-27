<template>
  <div>
    <v-toolbar
      color="primary"
      dark
      tabs
    >
      <v-text-field
        prepend-icon="search"
        append-icon="mic"
        label="Search"
        solo-inverted
        class="mx-3"
        flat
      ></v-text-field>
      <v-btn @click="goToEditor">EDITOR</v-btn>
      <v-btn>LOGOUT</v-btn>
    </v-toolbar>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 class="blue">
          <v-list dense two-line style="max-height: 200px; max-width: 300px" class="scroll-y blue lighten-5">
            <v-list-tile
              v-for="song in songs"
              :key="song.chartId"
              :class="selectedSong === song.chartId ? 'blue lighten' : ''"
              @click="selectSong(song.chartId)"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{song.title}}</v-list-tile-title>
                <v-list-tile-sub-title>{{song.artist}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>
        <v-flex xs6 class="red">
          BBBBBBBB
        </v-flex>
      </v-layout>

    </v-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      //
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    goToEditor: function () {
      this.$store.commit('goToEditor')
    },
    selectSong: function (value) {
      this.$store.commit('selectSong', value)
    }
  },
  computed: {
    songs: function () {
      return this.$store.state.songs
    },
    selectedSong: function () {
      return this.$store.state.selectedSong
    }
  }
}
</script>
