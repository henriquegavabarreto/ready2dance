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
    // get a chart and a song key from firebase
    let chartKey = firebase.database.ref('charts').push().key
    let songKey = firebase.database.ref('songs').push().key

    let updates = {}
    // update the new chart using the chartKey
    updates[`charts/${chartKey}`] = {
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdBy: user
    }

    // update the new song using the songKey
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

    // add songKey to user createdSongs
    updates[`users/${uid}/createdSongs/${songKey}`] = true

    // return new songID
    return firebase.database.ref().update(updates).then(() => {
      return songKey
    })
  },
  // save new chart to existing song - songId exists
  saveNewChart: function (danceChart, player, songId, difficulty, draft, user) {
    this.sortDanceChart(danceChart)
    // get a new chart key
    let chartKey = firebase.database.ref('charts').push().key

    let updates = {}
    // update the new chart using the chartKey
    updates[`charts/${chartKey}`] = {
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdBy: user
    }

    // add chart key to the song
    updates[`songs/${songId}/charts/${difficulty}`] = {
      id: chartKey,
      draft: draft
    }

    // update updatedAt at the changed song
    updates[`songs/${songId}/general/updatedAt`] = new Date().getTime()

    return firebase.database.ref().update(updates)
  },
  // overwrites an existing danceChart
  overwriteChart: function (danceChart, chartId, songId, difficulty, draft, genre) {
    this.sortDanceChart(danceChart)

    let updates = {}
    // update current loaded chart
    let chartPath = `charts/${chartId}`
    updates[`${chartPath}/offset`] = danceChart.offset
    updates[`${chartPath}/bpm`] = danceChart.bpm
    updates[`${chartPath}/videoStart`] = danceChart.videoStart
    updates[`${chartPath}/videoEnd`] = danceChart.videoEnd
    updates[`${chartPath}/moves`] = danceChart.moves.join(' ')

    let songPath = `songs/${songId}`
    // update current loaded song
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
