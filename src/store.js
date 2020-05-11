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
    songs: [],
    showSongs: [],
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
    previousScene: '',
    queryState: null,
    lastQuery: null,
    pageCounter: 1,
    currentSongFilter: 'Most Popular'
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
    resetSongs: state => {
      state.songs = []
    },
    resetShowSongs: state => {
      state.showSongs = []
    },
    // add song to songs - set initially or if a song is pushed to the database
    addSong: (state, data) => {
      state.songs.push(data)
    },
    addSongToShowSongs: (state, data) => {
      state.showSongs.push(data)
    },
    // make changes to a song and updates it
    changeSong: (state, data) => {
      // remove song from its original place
      for (let i = 0; i < state.songs.length; i++) {
        if (data.song.general.songId === state.songs[i].general.songId) {
          state.songs.splice(i, 1)
          break
        }
      }
      // if prevChild is null, this song is the first in the array
      if (data.prevChild === null) {
        state.songs.splice(0, 0, data.song)
      } else {
        // place the song after the previous child
        for (let i = 0; i < state.songs.length; i++) {
          if (data.prevChild === state.songs[i].general.songId) {
            state.songs.splice(i + 1, 0, data.song)
            return
          }
        }
      }
    },
    changeSongToShowInPlace: (state, data) => {
      // place new data in place of old song data
      for (let i = 0; i < state.showSongs.length; i++) {
        if (data.general.songId === state.showSongs[i].general.songId) {
          state.showSongs.splice(i, 1, data)
          return
        }
      }
    },
    // remove song locally
    removeSong: (state, data) => {
      for (let i = 0; i < state.songs.length; i++) {
        if (data.general.songId === state.songs[i].general.songId) {
          state.songs.splice(i, 1)
          return
        }
      }
    },
    // manually like a song if it was removed from the songs list
    manuallyToggleLike: (state, data) => {
      // look for the removed songId
      for (let i = 0; i < state.showSongs.length; i++) {
        if (data.songId === state.showSongs[i].general.songId) {
          // if the song was liked, add 1
          if (data.likeState === 'like') {
            if (state.showSongs[i].general.likedBy) {
              state.showSongs[i].general.likedBy++
            } else {
              state.showSongs[i].general.likedBy = 1
            }
          } else {
            // remove 1 if unliked
            state.showSongs[i].general.likedBy--
          }
        }
      }
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
    },
    changeQueryState: (state, data) => {
      state.queryState = data
    },
    changeLastQuery: (state, data) => {
      state.lastQuery = data
    },
    changePage: (state, data) => {
      state.pageCounter = state.pageCounter + data
    },
    resetPage: state => {
      state.pageCounter = 1
    },
    changeSongFilter: (state, data) => {
      state.currentSongFilter = data
    }
  },
  actions: {
    // load songs from database in batches - payload should have properties filter, loadMore, requestedPage
    loadSongs: (context, payload) => {
      // ignore calls for previous if in page 1 and for next if in the last page
      if ((payload.requestedPage === 'next' && context.state.queryState === 'last') || (payload.requestedPage === 'previous' && context.state.pageCounter === 1)) {
        return
      }
      let oldQuery = context.state.showSongs.slice(0)
      let pageSize = 25
      let query = null
      if (payload.requestedPage === 'first') {
        // indicate that this is the first request and first page
        context.commit('changeQueryState', 'first')
        // reset page counter to 1
        context.commit('resetPage')
        // change query according to the selected filter
        if (payload.filter === 'Recently Updated') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').limitToLast(pageSize)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').limitToFirst(pageSize)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').limitToLast(pageSize)
        }
      } else if (payload.requestedPage === 'next') {
        // indicate that this is not the first request
        context.commit('changeQueryState', 'cont')
        // add 1 to page counter
        context.commit('changePage', 1)
        // change query according to the selected filter
        if (payload.filter === 'Recently Updated') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').endAt(context.state.songs[0].general.updatedAt, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').startAt(context.state.songs[context.state.songs.length - 1].general.title, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').endAt(context.state.songs[0].general.likedBy, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        }
      } else { // previous page
        // indicate that this is not the first request
        context.commit('changeQueryState', 'cont')
        // remove one from page counting
        context.commit('changePage', -1)
        // change query according to the selected filter
        if (payload.filter === 'Recently Updated') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').startAt(context.state.songs[context.state.songs.length - 1].general.updatedAt, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').endAt(context.state.songs[0].general.title, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').startAt(context.state.songs[context.state.songs.length - 1].general.likedBy, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        }
      }
      // reset loaded songs, sonce we will not listen for their changes anymore
      context.commit('resetSongs')
      context.commit('resetShowSongs')
      // get the required page from database
      query.once('value', data => {
        data.forEach(value => {
          let song = value.val()
          song.general.songId = value.key
          context.commit('addSong', song)
          context.commit('addSongToShowSongs', song)
        })
      }).then(() => {
        // check number of repeated items in new query (expected to be one)
        let repeatedItems = 0
        for (let i = 0; i < context.state.songs.length; i++) {
          for (let j = 0; j < oldQuery.length; j++) {
            if (context.state.songs[i].general.songId === oldQuery[j].general.songId) {
              repeatedItems++
            }
          }
        }
        // if all items of the new query were included in the old query
        if (repeatedItems === context.state.songs.length) {
          // this is the last page and the old query should be kept
          context.commit('changeQueryState', 'last')
          // remove all songs from the array
          context.commit('resetSongs')
          context.commit('resetShowSongs')
          // put back all songs from old query and keep listeners
          oldQuery.forEach(song => {
            context.commit('addSong', song)
            context.commit('addSongToShowSongs', song)
          })
        } else {
          if (context.state.songs.length < pageSize) {
            // if there are less items than expected in the query this is the last page and the last query
            context.commit('changeQueryState', 'last')
          }
          if (context.state.lastQuery !== null) {
            context.state.lastQuery.off()
          }
          query.on('child_removed', data => {
            let song = data.val()
            song.general.songId = data.key
            context.commit('removeSong', song)
          })
          // listen for child changed events
          query.on('child_changed', (data, prevChild) => {
            let song = data.val()
            song.general.songId = data.key
            context.commit('changeSong', { song: song, prevChild: prevChild })
            context.commit('changeSongToShowInPlace', song)
          })
          // listen for child moved events
          query.on('child_moved', (data, prevChild) => {
            let song = data.val()
            song.general.songId = data.key
            context.commit('changeSong', { song: song, prevChild: prevChild })
          })
          context.commit('changeLastQuery', query)
        }
      })
    },
    // load specific chart from firebase
    changeSelectedChart: (context, payload) => {
      return firebase.database.ref(`charts/${payload}`).once('value', (data) => {
        context.commit('changeSelectedChart', data.val())
      }, (err) => {
        context.commit('somethingWentWrong')
        context.commit('changeWrongMessage', err.message)
      })
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
