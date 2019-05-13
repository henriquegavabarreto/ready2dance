<template>
  <div style="background-color: black; height: 765px;">
    <v-toolbar
      color="primary"
      dark
    >
      <v-text-field
        prepend-icon="search"
        label="Search"
        v-model="search"
        placeholder="Search by Song Title or Artist"
        solo-inverted
        class="mx-3"
        flat
      ></v-text-field>
      <v-btn @click="toggleSettings"><v-icon>settings</v-icon></v-btn>
      <v-btn @click="goToEditor">EDITOR</v-btn>
      <v-btn>LOGOUT</v-btn>
    </v-toolbar>
    <v-container mx-0>
      <v-layout row wrap justify-space-between>
        <v-flex xs5 class="blue">
          <v-card style="width: 550px;">
            <v-card-title>
              <v-icon
                large
                left
                color="black"
              >
                queue_music
              </v-icon>
              <span class="display-1">Select a Song</span>
            </v-card-title>
            <v-container fluid grid-list-lg>
              <v-layout row wrap>
                <v-flex
                xs12
                v-for="song in filteredSongs"
                :key="song.videoId"
                @click="selectSong(song)">
                  <v-card
                    style="border-radius: 15px;"
                    hover
                    :class="selectedSong.title === song.title ? 'blue lighten' : ''">
                    <v-card-title primary-title>
                      <div>
                        <h3 class="headline mb-0">{{song.title}}</h3>
                        <div>{{song.artist}}</div>
                      </div>
                    </v-card-title>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
        <v-flex xs6 v-if="selectedSong">
          <v-card style="width: 800px;">
            <v-card-title primary-title>
              <div class="mr-5">
                <h3 class="headline mb-0">{{selectedSong.title}} {{filteredSongs.title}}</h3>
                <div>{{selectedSong.artist}}</div>
              </div>
              <div v-for="(chartId, dif) in songCharts" :key="dif">
                <v-btn
                  small
                  @click="selectChart(chartId)"
                  :class="selectedChart === chartId ? 'blue lighten' : ''">{{dif}}</v-btn>
              </div>
              <v-btn class="ml-5"
                :disabled="selectedChart === ''"
                @click="goToGame"><v-icon>play_arrow</v-icon></v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>

    </v-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      search: '',
      selectedSong: {},
      selectedChart: ''
    }
  },
  methods: {
    goToEditor: function () { // go to editor
      this.$store.commit('goToEditor')
    },
    selectSong: function (song) { // get song info from the list of filtered songs
      this.selectedSong = song
    },
    goToGame: function () { // goes to the game after the chart is loaded
      if (this.selectedSong !== {} && this.selectedChart !== '') {
        this.$store.dispatch('changeSelectedChart', this.selectedChart).then(() => {
          this.$store.commit('goToGame')
        })
      }
    },
    selectChart: function (chartId) { // get the id of the selected chart so it can be loaded
      this.selectedChart = chartId
    },
    toggleSettings: function () {
      // change model multiplier
      // don't show animation (aka youtube and feedback only - no canvas)
      // change camera latency
      console.log('show settings')
    }
  },
  computed: {
    songs: function () { // loads all songs from the $store
      return this.$store.state.songs
    },
    filteredSongs: function () { // Returns array of songs based on the search.
      let songArray = []
      let filteredSongs = []

      for (let song in this.songs) {
        songArray.push(this.songs[song])
      }

      songArray.filter((songs) => {
        if (songs.title.toLowerCase().includes(this.search.toLowerCase()) || songs.artist.toLowerCase().includes(this.search.toLowerCase())) {
          filteredSongs.push(songs)
        }
      })
      return filteredSongs
    },
    songCharts: function () { // returns charts object by order of difficulty
      if (this.selectedSong.hasOwnProperty('charts')) {
        let order = ['easy', 'medium', 'hard']
        let sortedChart = Object.entries(this.selectedSong.charts).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
        return Object.fromEntries(sortedChart)
      } else {
        return {}
      }
    }
  }
}
</script>
