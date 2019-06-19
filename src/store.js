import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './tools/config/firebase'
import * as posenet from '@tensorflow-models/posenet'

Vue.use(Vuex)
Vue.use(firebase)
Vue.use(posenet)

export default new Vuex.Store({
  state: {
    welcome: false,
    user: null,
    signInState: null,
    net: null,
    songs: null,
    songScores: 'Select a song!',
    somethingWentWrong: false,
    wrongMessage: '',
    selectedSong: null,
    selectedChartId: null,
    selectedChart: null,
    selectedDifficulty: null,
    results: {},
    gameOptions: {
      showAnimation: true,
      showWebcam: true,
      latency: 0.32,
      multiplier: 0,
      outputStride: 16,
      imageScale: 0.5,
      speed: 1
    },
    currentScene: 'home',
    previousScene: ''
  },
  mutations: {
    toggleWelcome: (state, data) => {
      state.welcome = data
    },
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
    },
    changeSong: (state, data) => {
      Vue.set(state.songs, data.key, data.val)
    },
    removeSong: (state, data) => {
      Vue.delete(state.songs, data.key)
    },
    goToScene: (state, data) => {
      state.previousScene = state.currentScene
      state.currentScene = data
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
      state.somethingWentWrong = true
    },
    changeWrongMessage: (state, data) => {
      state.wrongMessage = data
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
    changeMultiplier: (state, data) => {
      state.gameOptions.multiplier = data
    },
    changeLatency: (state, data) => {
      state.gameOptions.latency = data
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
      return new Promise((resolve, reject) => {
        posenet.load(payload).then(response => {
          resolve(response)
        }, error => {
          reject(error)
        })
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
          context.commit('toggleWelcome', true)
          context.commit('goToScene', 'song-selection')
          firebase.database.ref(`users/${userState.uid}`).once('value').then((value) => {
            context.commit('changeUser', value.val())
            context.commit('changeState', userState)
          })
        } else {
          context.commit('changeState', userState)
          context.commit('goToScene', 'home')
        }
      })
    }
  }
})
