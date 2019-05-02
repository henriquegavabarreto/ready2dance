<template>
  <div>
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
      <v-btn @click="goToEditor">EDITOR</v-btn>
      <v-btn>LOGOUT</v-btn>
    </v-toolbar>
    <v-container mx-0>
      <v-layout row wrap justify-space-between>
        <v-flex xs5 class="blue">
          <v-card>
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
                :key="song.chartId"
                @click="selectSong(song.chartId)">
                  <v-card
                    style="border-radius: 15px;"
                    hover
                    :class="selectedSong === song.chartId ? 'blue lighten' : ''">
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
          <v-card>
            <v-card-title primary-title>
              <div class="mr-5">
                <h3 class="headline mb-0">{{currentSelection.title}} {{filteredSongs.title}}</h3>
                <div>{{currentSelection.artist}}</div>
              </div>
              <v-btn class="ml-5" @click="goToGame"><v-icon>play_arrow</v-icon></v-btn>
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
      search: ''
    }
  },
  methods: {
    goToEditor: function () {
      this.$store.commit('goToEditor')
    },
    selectSong: function (value) {
      this.$store.commit('selectSong', value)
      this.$store.dispatch('changeSelectedChart', this.selectedSong)
    },
    goToGame: function () {
      if (this.selectedSong !== null) {
        this.$store.commit('goToGame')
      }
    }
  },
  computed: {
    currentSelection: function () {
      let value = {}
      if (this.selectedSong === null) {
        value = {
          title: '',
          artist: ''
        }
      } else {
        for (let song in this.songs) {
          if (this.songs[song].chartId === this.selectedSong) {
            value = {
              title: this.songs[song].title,
              artist: this.songs[song].artist
            }
            break
          }
        }
      }
      return value
    },
    songs: function () {
      return this.$store.state.songs
    },
    selectedSong: function () {
      return this.$store.state.selectedSong
    },
    filteredSongs: function () {
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
    }
  }
}
</script>
