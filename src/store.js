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
    welcomeShown: false,
    user: null,
    uid: null,
    net: null,
    songs: null,
    songScores: 'Select a song!',
    somethingWentWrong: false,
    wrongMessage: '',
    selectedSongId: null,
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
    currentScene: '',
    previousScene: ''
  },
  mutations: {
    // show welcome message or not
    toggleWelcome: (state, data) => {
      state.welcome = data
    },
    // change user according to user that logged in
    changeUser: (state, data) => {
      state.user = data
    },
    // change selectedSongId
    selectSongId: (state, data) => {
      state.selectedSongId = data
    },
    // changes selected song object
    selectSong: (state, data) => {
      state.selectedSong = data
    },
    // change chartId so a specific chart can be loaded
    selectChart: (state, data) => {
      state.selectedChartId = data
    },
    // select difficulty to retrieve correct score board and chart
    selectDifficulty: (state, data) => {
      state.selectedDifficulty = data
    },
    // add song to songs - set initially or if a song is pushed to the database
    addSong: (state, data) => {
      if (state.songs === null) {
        state.songs = {}
      }
      Vue.set(state.songs, data.key, data.val)
    },
    // make changes to a song and updates it
    changeSong: (state, data) => {
      Vue.set(state.songs, data.key, data.val)
    },
    // remove song locally
    removeSong: (state, data) => {
      Vue.delete(state.songs, data.key)
    },
    // change scene to be dynamically loaded by vue
    goToScene: (state, data) => {
      state.previousScene = state.currentScene
      state.currentScene = data
    },
    // select a specific chart
    changeSelectedChart: (state, data) => {
      state.selectedChart = data
    },
    // loads posenet
    loadNet: (state, data) => {
      state.net = data
    },
    // change result to be shown
    changeResults: (state, data) => {
      state.results = data
    },
    // toggle something went wrong to show error message
    somethingWentWrong: state => {
      state.somethingWentWrong = !state.somethingWentWrong
    },
    // change wrong message content
    changeWrongMessage: (state, data) => {
      state.wrongMessage = data
    },
    // assign values changed in the settings to the store
    changeOptions: (state, data) => {
      state.gameOptions.showAnimation = data.showAnimation
      state.gameOptions.showWebcam = data.showWebcam
      state.gameOptions.multiplier = data.multiplier
      state.gameOptions.speed = parseInt(data.speed)
      state.gameOptions.outputStride = parseInt(data.outputStride)
      state.gameOptions.imageScale = parseFloat(data.imageScale)
      // latency is changed only if latency is a number
      if (!isNaN(data.latency)) {
        state.gameOptions.latency = parseFloat(data.latency)
      }
    },
    // change only posenet multiplier
    changeMultiplier: (state, data) => {
      state.gameOptions.multiplier = data
    },
    // change latency
    changeLatency: (state, data) => {
      state.gameOptions.latency = data
      // save latency to local storage when changed using the latency test
      localStorage.setItem('latency', data)
    },
    // change song scores locally
    changeSongScores: (state, data) => {
      state.songScores = data
    },
    dismissWelcome: state => {
      // welcome is shown one time only
      state.welcomeShown = true
      localStorage.setItem('welcomeShown', true)
    },
    loadLocalStorage: state => {
      // load items from storage or get default values if the storage does not have the item
      state.welcomeShown = JSON.parse(localStorage.getItem('welcomeShown'))
      state.gameOptions.showAnimation = localStorage.getItem('showAnimation') || state.gameOptions.showAnimation
      state.gameOptions.showWebcam = localStorage.getItem('showWebcam') || state.gameOptions.showWebcam
      state.gameOptions.latency = localStorage.getItem('latency') || state.gameOptions.latency
      state.gameOptions.multiplier = localStorage.getItem('multiplier') || state.gameOptions.multiplier
      state.gameOptions.speed = localStorage.getItem('speed') || state.gameOptions.speed
      state.gameOptions.outputStride = localStorage.getItem('outputStride') || state.gameOptions.outputStride
      state.gameOptions.imageScale = localStorage.getItem('imageScale') || state.gameOptions.imageScale

      // parse all options in case they come from storage
      state.gameOptions.showAnimation = JSON.parse(state.gameOptions.showAnimation)
      state.gameOptions.showWebcam = JSON.parse(state.gameOptions.showWebcam)
      state.gameOptions.latency = JSON.parse(state.gameOptions.latency)
      state.gameOptions.multiplier = JSON.parse(state.gameOptions.multiplier)
      state.gameOptions.speed = JSON.parse(state.gameOptions.speed)
      state.gameOptions.outputStride = JSON.parse(state.gameOptions.outputStride)
      state.gameOptions.imageScale = JSON.parse(state.gameOptions.imageScale)
    },
    saveOptionsOnStorage: state => { // save game options / settings to local storage
      localStorage.setItem('showAnimation', state.gameOptions.showAnimation)
      localStorage.setItem('showWebcam', state.gameOptions.showWebcam)
      localStorage.setItem('latency', state.gameOptions.latency)
      localStorage.setItem('multiplier', state.gameOptions.multiplier)
      localStorage.setItem('speed', state.gameOptions.speed)
      localStorage.setItem('outputStride', state.gameOptions.outputStride)
      localStorage.setItem('imageScale', state.gameOptions.imageScale)
    }
  },
  actions: {
    // update songs locally based on database changes
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
    // load specific chart from firebase
    changeSelectedChart: (context, payload) => {
      return firebase.database.ref(`charts/${payload}`).once('value', (data) => {
        context.commit('changeSelectedChart', data.val())
      }, (err) => { console.log(err) })
    },
    // load posenet based on multiplier
    loadNet: (context, payload) => {
      return new Promise((resolve, reject) => {
        posenet.load(payload).then(response => {
          resolve(response)
        }, error => {
          reject(error)
        })
      })
    },
    // load scores of a specific chart
    updateSongScores: (context, payload) => {
      firebase.database.ref(`scores/${payload}`).orderByValue().limitToLast(50).once('value', (data) => {
        let scores = data.val()
        // sort scores by value
        let sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
        context.commit('changeSongScores', sortedScores)
      }, (err) => {
        context.commit('somethingWentWrong')
        context.commit('changeWrongMessage', err.message)
      })
    },
    // react to auth state change
    onStateChange: context => {
      // TODO: this should reflect the changes done in the user node
      // onChildAdded and onChildRemoved for likedSongs and createdSongs would be nice
      firebase.auth.onAuthStateChanged((userState) => {
        if (userState) {
          firebase.database.ref(`users/${userState.uid}`).once('value').then((value) => {
            context.commit('changeUser', value.val())
            context.commit('goToScene', 'song-selection')
          })
        } else {
          context.commit('changeUser', null)
          context.commit('goToScene', 'home')
        }
      })
    }
  }
})
