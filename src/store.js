import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './tools/config/firebase'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

Vue.use(Vuex)
Vue.use(firebase)
Vue.use(poseDetection)

export default new Vuex.Store({
  state: {
    welcome: false,
    welcomeShown: false,
    user: {
      username: '',
      likedSongs: []
    },
    changingState: true,
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
      speed: 1,
      videoDeviceId: '',
      videoDevice: ''
    },
    currentScene: '',
    previousScene: '',
    queryState: null,
    lastQuery: null,
    pageCounter: 1,
    currentSongFilter: 'Most Popular',
    likedSongsRef: null
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
      // if (state.songs.length === 0) {
      //   state.songs.push(data)
      // } else {
      //   let repeated = false
      //   for (let song of state.songs) {
      //     if (data.general.songId === song.general.songId) {
      //       repeated = true
      //       break
      //     }
      //   }
      //   if (!repeated) state.songs.push(data)
      // }
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
    // remove song locally
    removeSongToShow: (state, data) => {
      for (let i = 0; i < state.showSongs.length; i++) {
        if (data.general.songId === state.showSongs[i].general.songId) {
          state.showSongs.splice(i, 1)
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
      state.gameOptions.speed = parseInt(data.speed)
      state.gameOptions.videoDevice = data.videoDevice
      state.gameOptions.videoDeviceId = data.videoDeviceId
      // latency is changed only if latency is a number
      if (!isNaN(data.latency)) {
        state.gameOptions.latency = parseFloat(data.latency)
      }
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
      // load items from storage and parse them or get default values if the storage does not have the item
      state.welcomeShown = JSON.parse(localStorage.getItem('welcomeShown'))
      state.gameOptions.showAnimation = JSON.parse(localStorage.getItem('showAnimation')) || state.gameOptions.showAnimation
      state.gameOptions.showWebcam = JSON.parse(localStorage.getItem('showWebcam')) || state.gameOptions.showWebcam
      state.gameOptions.latency = JSON.parse(localStorage.getItem('latency')) || state.gameOptions.latency
      state.gameOptions.speed = JSON.parse(localStorage.getItem('speed')) || state.gameOptions.speed
      state.gameOptions.videoDevice = localStorage.getItem('videoDevice') || state.gameOptions.videoDevice
      state.gameOptions.videoDeviceId = localStorage.getItem('videoDeviceId') || state.gameOptions.videoDeviceId
    },
    saveOptionsOnStorage: state => { // save game options / settings to local storage
      localStorage.setItem('showAnimation', state.gameOptions.showAnimation)
      localStorage.setItem('showWebcam', state.gameOptions.showWebcam)
      localStorage.setItem('latency', state.gameOptions.latency)
      localStorage.setItem('speed', state.gameOptions.speed)
      localStorage.setItem('videoDevice', state.gameOptions.videoDevice)
      localStorage.setItem('videoDeviceId', state.gameOptions.videoDeviceId)
    },
    changeQueryState: (state, data) => {
      state.queryState = data
    },
    changeLastQuery: (state, data) => {
      state.lastQuery = data
    },
    changePage: (state, data) => {
      if (state.pageCounter + data > 0) {
        state.pageCounter = state.pageCounter + data
      } else {
        state.pageCounter = 1
      }
    },
    resetPage: state => {
      state.pageCounter = 1
    },
    changeSongFilter: (state, data) => {
      state.currentSongFilter = data
    },
    createLikedSongsRef: (state, data) => {
      state.likedSongsRef = data
    },
    addLikedSong: (state, data) => {
      state.user.likedSongs.push(data)
    },
    removeLikedSong: (state, data) => {
      let index = state.user.likedSongs.indexOf(data)
      state.user.likedSongs.splice(index, 1)
    },
    changeUsername: (state, data) => {
      state.user.username = data
    },
    resetUser: state => {
      state.user = {}
      Vue.set(state.user, 'username', '')
      Vue.set(state.user, 'likedSongs', [])
    }
  },
  actions: {
    // load songs from database in batches - payload should have properties filter, loadMore, requestedPage
    loadSongs: (context, payload) => {
      // ignore calls for previous if in page 1 and for next if in the last page
      if ((payload.requestedPage === 'next' && context.state.queryState === 'last') || (payload.requestedPage === 'previous' && context.state.pageCounter === 1)) {
        return
      }
      // ignore calls if there is not more than one page for songs
      if (context.state.pageCounter === 1 && context.state.queryState === 'last' && payload.requestedPage !== 'first') {
        return
      }
      let oldQuery = context.state.showSongs.slice(0)
      let pageSize = 5
      let query = null
      if (payload.requestedPage === 'first') {
        // indicate that this is the first request and first page
        context.commit('changeQueryState', 'first')
        // reset page counter to 1
        context.commit('resetPage')
        // change query according to the selected filter
        if (payload.filter === 'Most Recent') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').limitToLast(pageSize)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').limitToFirst(pageSize)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').limitToLast(pageSize)
        } else if (payload.filter === 'My Creations') {
          if (context.state.user.username === null) return
          query = firebase.database.ref('songs').orderByChild('general/createdBy').equalTo(context.state.user.username).limitToLast(pageSize)
        }
      } else if (payload.requestedPage === 'next') {
        // indicate that this is not the first request
        context.commit('changeQueryState', 'cont')
        // add 1 to page counter
        context.commit('changePage', 1)
        // change query according to the selected filter
        if (payload.filter === 'Most Recent') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').endAt(context.state.songs[0].general.updatedAt, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').startAt(context.state.songs[context.state.songs.length - 1].general.title, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').endAt(context.state.songs[0].general.likedBy, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        } else if (payload.filter === 'My Creations') {
          query = firebase.database.ref('songs').orderByChild('general/createdBy').startAt(context.state.songs[0].general.createdBy).endAt(context.state.songs[0].general.createdBy, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        }
      } else { // previous page
        // indicate that this is not the first request
        context.commit('changeQueryState', 'cont')
        // remove one from page counting
        context.commit('changePage', -1)
        // change query according to the selected filter
        if (payload.filter === 'Most Recent') {
          query = firebase.database.ref('songs').orderByChild('general/updatedAt').startAt(context.state.songs[context.state.songs.length - 1].general.updatedAt, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        } else if (payload.filter === 'Title (A-Z)') {
          query = firebase.database.ref('songs').orderByChild('general/title').endAt(context.state.songs[0].general.title, context.state.songs[0].general.songId).limitToLast(pageSize + 1)
        } else if (payload.filter === 'Most Popular') {
          query = firebase.database.ref('songs').orderByChild('general/likedBy').startAt(context.state.songs[context.state.songs.length - 1].general.likedBy, context.state.songs[context.state.songs.length - 1].general.songId).limitToFirst(pageSize + 1)
        } else if (payload.filter === 'My Creations') {
          query = firebase.database.ref('songs').orderByChild('general/createdBy').startAt(context.state.songs[context.state.songs.length - 1].general.createdBy, context.state.songs[context.state.songs.length - 1].general.songId).endAt(context.state.songs[0].general.createdBy).limitToFirst(pageSize + 1)
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
          if (payload.requestedPage !== 'previous') {
            context.commit('changeQueryState', 'last')
          }
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
          if (payload.filter === 'My Creations' && context.state.pageCounter === 1) {
            query.on('child_added', data => {
              let song = data.val()
              song.general.songId = data.key
              let alreadyLoaded = false
              for (let loadedSong of context.state.songs) {
                if (loadedSong.general.songId === data.key) {
                  alreadyLoaded = true
                  break
                }
              }
              if (!alreadyLoaded) {
                context.commit('addSong', song)
                context.commit('addSongToShowSongs', song)
              }
            })
          }
          query.on('child_removed', data => {
            let song = data.val()
            song.general.songId = data.key
            firebase.database.ref('songs').orderByKey().equalTo(data.key).once('value', value => {
              if (value.val() === null) {
                // remove song from both arrays - the song doesnt exist anymore
                context.commit('removeSong', song)
                context.commit('removeSongToShow', song)
              } else {
                // remove song only from the reference array
                context.commit('removeSong', song)
              }
            })
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
    // load movenet
    loadNet: () => {
      return new Promise((resolve, reject) => {
        poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }).then(response => {
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
      context.state.changingState = true
      firebase.auth.onAuthStateChanged((userState) => {
        context.commit('resetUser')
        if (userState) {
          firebase.database.ref(`users/${userState.uid}/username`).once('value').then(value => {
            let username = value.val()
            // commit username
            context.commit('changeUsername', username)
            return username
          }).then(() => {
            let likedSongsRef = firebase.database.ref(`users/${userState.uid}/likedSongs`)
            // add listener to likedSongs
            likedSongsRef.on('child_added', data => {
              // if the current filter is my favorites, request this song to the database
              context.commit('addLikedSong', data.key)
            })
            likedSongsRef.on('child_removed', data => {
              context.commit('removeLikedSong', data.key)
            })
            context.commit('createLikedSongsRef', likedSongsRef)
            // go to song selection
            context.commit('goToScene', 'song-selection')
            context.state.changingState = false
          }).catch(err => {
            context.commit('somethingWentWrong')
            context.commit('changeWrongMessage', err.message)
            context.state.changingState = false
          })
        } else {
          context.state.changingState = false
          context.commit('changeUser', null)
          context.commit('goToScene', 'home')
        }
      })
    }
  }
})
