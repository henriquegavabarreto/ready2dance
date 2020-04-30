import firebase from '../config/firebase'

// group of helper functions to organize the danceChart and save it to the firebase
export default {
  // sorts the danceChart elements in ascending order of beat
  sortDanceChart: function (danceChart) {
    danceChart.moves.sort(function (a, b) {
      return a[0] - b[0]
    })
  },
  // save non existing song - there is no songId
  saveNewSong: function (danceChart, player, difficulty, draft, user, genre, uid) {
    this.sortDanceChart(danceChart)
    // save chart to firebase first
    let chartKey = firebase.database.ref('charts').push().key
    let songKey = firebase.database.ref('songs').push().key

    let updates = {}
    updates[`charts/${chartKey}`] = {
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdBy: user
    }

    updates[`songs/${songKey}`] = {
      general: {
        title: danceChart.title.toUpperCase(),
        artist: danceChart.artist.toUpperCase(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        createdBy: user,
        genre: genre,
        videoId: player.videoId
      },
      charts: {
        [difficulty]: {
          id: chartKey,
          draft: draft
        }
      }
    }

    updates[`users/${uid}/createdSongs/${songKey}`] = true

    return firebase.database.ref().update(updates).then(() => {
      return songKey
    })
    // return firebase.database.ref('charts').push({
    //   offset: danceChart.offset,
    //   bpm: danceChart.bpm,
    //   videoId: player.videoId,
    //   videoStart: danceChart.videoStart,
    //   videoEnd: danceChart.videoEnd,
    //   moves: danceChart.moves.join(' '),
    //   createdBy: user
    // }).then((chartRef) => {
    //   danceChart.chartId = chartRef.key
    //   // after having the chart saved, save the song
    //   return firebase.database.ref('songs').push({
    //     general: {
    //       title: danceChart.title,
    //       artist: danceChart.artist,
    //       createdAt: new Date().getTime(),
    //       updatedAt: new Date().getTime(),
    //       createdBy: user,
    //       genre: genre,
    //       videoId: player.videoId
    //     },
    //     charts: {
    //       [difficulty]: {
    //         id: chartRef.key,
    //         draft: draft
    //       }
    //     }
    //   }).then((songRef) => {
    //     danceChart.songId = songRef.key
    //     // add songId to user created songs
    //     return firebase.database.ref(`users/${uid}/createdSongs`).update({ [songRef.key]: true })
    //   })
    // })
  },
  // save new chart to existing song - songId exists
  saveNewChart: function (danceChart, player, songId, difficulty, draft, user) {
    this.sortDanceChart(danceChart)
    let chartKey = firebase.database.ref('charts').push().key

    let updates = {}
    updates[`charts/${chartKey}`] = {
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdBy: user
    }

    updates[`songs/${songId}/charts/${difficulty}`] = {
      id: chartKey,
      draft: draft
    }

    updates[`songs/${songId}/general/updatedAt`] = new Date().getTime()

    return firebase.database.ref().update(updates)
    // return firebase.database.ref('charts').push({
    //   offset: danceChart.offset,
    //   bpm: danceChart.bpm,
    //   videoId: player.videoId,
    //   videoStart: danceChart.videoStart,
    //   videoEnd: danceChart.videoEnd,
    //   moves: danceChart.moves.join(' '),
    //   createdBy: user
    // }).then((chartRef) => {
    //   danceChart.chartId = chartRef.key
    //   // add the created chartId to the existing songId
    //   return firebase.database.ref('songs/' + songId).child('charts').update({
    //     [difficulty]: {
    //       id: chartRef.key,
    //       draft: draft
    //     }
    //   }).then(() => {
    //     danceChart.songId = songId
    //     return firebase.database.ref('songs/' + songId + '/general').update({
    //       updatedAt: new Date().getTime()
    //     })
    //   })
    // })
  },
  // overwrites an existing danceChart
  overwriteChart: function (danceChart, chartId, songId, difficulty, draft, genre) {
    this.sortDanceChart(danceChart)

    let updates = {}
    let chartPath = `charts/${chartId}`
    updates[`${chartPath}/offset`] = danceChart.offset
    updates[`${chartPath}/bpm`] = danceChart.bpm
    updates[`${chartPath}/videoStart`] = danceChart.videoStart
    updates[`${chartPath}/videoEnd`] = danceChart.videoEnd
    updates[`${chartPath}/moves`] = danceChart.moves.join(' ')

    let songPath = `songs/${songId}`
    updates[`${songPath}/charts/${difficulty}/draft`] = draft
    updates[`${songPath}/general/title`] = danceChart.title.toUpperCase()
    updates[`${songPath}/general/artist`] = danceChart.artist.toUpperCase()
    updates[`${songPath}/general/genre`] = genre
    updates[`${songPath}/general/updatedAt`] = new Date().getTime()

    return firebase.database.ref().update(updates)
  },
  // updates danceChart locally based on a loadedChart
  // updates settings based on the updated danceChart
  updateChartAndSettings: function (danceChart, settings, loadedChart) {
    danceChart.offset = parseFloat(loadedChart.offset)
    danceChart.artist = loadedChart.artist
    danceChart.title = loadedChart.title
    danceChart.moves = this.parseChart(loadedChart.moves)
    danceChart.videoEnd = parseFloat(loadedChart.videoEnd)
    danceChart.videoStart = parseFloat(loadedChart.videoStart)
    danceChart.videoId = loadedChart.videoId
    danceChart.bpm = parseFloat(loadedChart.bpm)
    settings.offset = danceChart.offset.toString()
    settings.videoStart = danceChart.videoStart.toString()
    settings.videoEnd = danceChart.videoEnd.toString()
    settings.bpm = danceChart.bpm.toString()
    settings.title = danceChart.title
    settings.artist = danceChart.artist
  },
  // update danceChart based on settings
  updateDanceChart: function (danceChart, settings) {
    danceChart.offset = parseFloat(settings.offset)
    danceChart.videoStart = parseFloat(settings.videoStart)
    danceChart.videoEnd = parseFloat(settings.videoEnd)
    danceChart.bpm = parseFloat(settings.bpm)
  },
  // update all managers
  // used when there are changes on the danceChart
  updateManagers: function (danceChart, songManager, moveManager, noteManager, cueManager) {
    songManager.update(danceChart)
    moveManager.update(songManager)
    noteManager.update(songManager)
    cueManager.update(songManager)
  },
  // parse chart for when it is loaded from the database
  parseChart: function (moves) {
    if (moves === '') {
      return []
    } else {
      let newChart = []
      moves = moves.split(' ')
      moves.forEach((move) => {
        move = move.split(',')
        move[0] = parseInt(move[0])
        move[1] = parseInt(move[1])
        newChart.push(move)
      })
      return newChart
    }
  }
}
