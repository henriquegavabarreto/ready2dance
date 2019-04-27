import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './tools/config/firebase'

Vue.use(Vuex)
Vue.use(firebase)

export default new Vuex.Store({
  state: {
    songs: null,
    currentScene: 'song-selection'
  },
  mutations: {
    updateSongs: (state, data) => {
      state.songs = data
    },
    goToEditor: state => {
      state.currentScene = 'editor'
    },
    goToSongSelection: state => {
      state.currentScene = 'song-selection'
    }
  },
  actions: {
    updateSongs: context => {
      firebase.database.ref('songs').on('value', (data) => {
        context.commit('updateSongs', data.val())
      }, (err) => { console.log(err) })
    }
  },
  getter: {
    // thingyName: state => { return Artist, Title and Key from charts to display somewhere }
  }
})
