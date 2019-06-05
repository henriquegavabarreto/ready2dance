import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './tools/config/firebase'
import * as posenet from '@tensorflow-models/posenet'

Vue.use(Vuex)
Vue.use(firebase)
Vue.use(posenet)

export default new Vuex.Store({
  state: {
    user: null,
    signInState: null,
    net: null,
    songs: null,
    songScores: 'Select a song!',
    somethingWentWrong: false,
    selectedSong: null,
    selectedChartId: null,
    selectedChart: null,
    selectedDifficulty: null,
    results: {},
    gameOptions: {
      showAnimation: true,
      showWebcam: true,
      latency: 0.32,
      multiplier: 0.5,
      outputStride: 16,
      imageScale: 0.5,
      speed: 1
    },
    currentScene: 'home'
  },
  mutations: {
    changeUser: (state, data) => {
      state.user = data
    },
    selectSong: (state, data) => {
      state.selectedSong = data
    },
    selectChart: (state, data) => {
      state.selectedChartId = data
    },
    selectDifficulty: (state, data) => {
      state.selectedDifficulty = data
    },
    addSong: (state, data) => {
      if (state.songs === null) {
        state.songs = {}
      }
      Vue.set(state.songs, data.key, data.val)
      // state.songs[data.key] = data.val
    },
    changeSong: (state, data) => {
      // state.songs[data.key] = data.val
      Vue.set(state.songs, data.key, data.val)
    },
    removeSong: (state, data) => {
      // delete state.songs[data.key]
      Vue.delete(state.songs, data.key)
    },
    goToHome: state => {
      state.currentScene = 'home'
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
    goToError: state => {
      state.currentScene = 'error'
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
      state.gameOptions.speed = parseInt(data.speed)
      state.gameOptions.outputStride = parseInt(data.outputStride)
      state.gameOptions.imageScale = parseFloat(data.imageScale)
    },
    changeSongScores: (state, data) => {
      state.songScores = data
    },
    changeState: (state, data) => {
      state.signInState = state
    }
  },
  actions: {
    loadSongs: context => {
      firebase.database.ref('songs').orderByChild('title').on('child_added', (data) => {
        let values = {
          key: data.key,
          val: data.val()
        }
        context.commit('addSong', values)
      })
      firebase.database.ref('songs').on('child_changed', (data) => {
        let values = {
          key: data.key,
          val: data.val()
        }
        context.commit('changeSong', values)
      })
      firebase.database.ref('songs').on('child_removed', (data) => {
        let values = {
          key: data.key,
          val: data.val()
        }
        context.commit('removeSong', values)
      })
    },
    changeSelectedChart: (context, payload) => {
      return firebase.database.ref(`charts/${payload}`).once('value', (data) => {
        context.commit('changeSelectedChart', data.val())
      }, (err) => { console.log(err) })
    },
    loadNet: (context, payload) => {
      posenet.load(payload).then((data) => {
        context.commit('loadNet', data)
      }).catch((err) => {
        context.commit('goToError')
        console.log(err)
      })
    },
    updateSongScores: (context, payload) => {
      firebase.database.ref(`scores/${payload}`).orderByValue().limitToLast(50).once('value', (data) => {
        let scores = data.val()
        let sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
        context.commit('changeSongScores', sortedScores)
      }, (err) => console.log(err))
    },
    onStateChange: context => {
      firebase.auth.onAuthStateChanged((userState) => {
        if (userState) {
          context.commit('goToSongSelection')
          firebase.database.ref(`users/${userState.uid}`).once('value').then((value) => {
            context.commit('changeUser', value.val())
            context.commit('changeState', userState)
          })
        } else {
          context.commit('changeState', userState)
          context.commit('goToHome')
        }
      })
    }
  }
})
