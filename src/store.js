import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './tools/config/firebase'
import * as posenet from '@tensorflow-models/posenet'

Vue.use(Vuex)
Vue.use(firebase)
Vue.use(posenet)

export default new Vuex.Store({
  state: {
    net: null,
    songs: null,
    somethingWentWrong: false,
    selectedSong: null,
    selectedChartId: null,
    selectedChart: null,
    results: {},
    gameOptions: {
      showAnimation: true,
      showWebcam: true,
      latency: 0.32,
      multiplier: 0.5,
      speed: 1
    },
    currentScene: 'song-selection'
  },
  mutations: {
    selectSong: (state, data) => {
      state.selectedSong = data
    },
    selectChart: (state, data) => {
      state.selectedChartId = data
    },
    updateSongs: (state, data) => {
      state.songs = data
    },
    goToEditor: state => {
      state.currentScene = 'editor'
    },
    goToSongSelection: state => {
      state.currentScene = 'song-selection'
    },
    goToGame: state => {
      state.currentScene = 'game'
    },
    goToResults: state => {
      state.currentScene = 'results'
    },
    changeSelectedChart: (state, data) => {
      state.selectedChart = data
    },
    loadNet: (state, data) => {
      state.net = data
    },
    changeResults: (state, data) => {
      state.results = data
    },
    somethingWentWrong: state => {
      state.somethingWentWrong = !state.somethingWentWrong
    },
    changeOptions: (state, data) => {
      state.gameOptions.showAnimation = data.showAnimation
      state.gameOptions.showWebcam = data.showWebcam
      state.gameOptions.latency = parseFloat(data.latency)
      state.gameOptions.multiplier = data.multiplier
      state.gameOptions.speed = data.speed
    }
  },
  actions: {
    updateSongs: context => {
      firebase.database.ref('songs').on('value', (data) => {
        context.commit('updateSongs', data.val())
      }, (err) => { console.log(err) })
    },
    changeSelectedChart: (context, payload) => {
      return firebase.database.ref(`charts/${payload}`).once('value', (data) => {
        context.commit('changeSelectedChart', data.val())
      }, (err) => { console.log(err) })
    },
    loadNet: (context, payload) => {
      posenet.load(payload).then((data) => {
        context.commit('loadNet', data)
      }).catch((err) => console.log(err))
    }
  },
  getter: {
    // thingyName: state => { return Artist, Title and Key from charts to display somewhere }
  }
})
