import firebase from '../config/firebase'

// group of helper functions to organize the danceChart and save it to the firebase
export default {
  // sorts the danceChart elements in ascending order of beat
  sortDanceChart: function (danceChart) {
    danceChart.moves.sort(function (a, b) {
      return a[0] - b[0]
    })
  },
  // returns the songId for a given videoId from the song list
  // used when loading, saving and deleting charts
  getSongIdByVideoId: function (songs, videoId) {
    if (songs !== null) {
      for (var songId in songs) {
        if (songs[songId].videoId === videoId) {
          return songId
        }
      }
    }
    return ''
  },
  // save non existing song - there is no songId
  saveNewSong: function (danceChart, player, difficulty, draft, user) {
    this.sortDanceChart(danceChart)
    // save chart to firebase first
    firebase.database.ref('charts').push({
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      updatedAt: new Date().getTime(),
      createdBy: user
    }).then((chartRef) => {
      danceChart.chartId = chartRef.key
      // after having the chart saved, save the song
      firebase.database.ref('songs').push({
        title: danceChart.title,
        artist: danceChart.artist,
        createdAt: new Date().getTime(),
        charts: {
          [difficulty]: {
            id: chartRef.key,
            draft: draft,
            createdBy: user
          }
        },
        videoId: player.videoId
      }).then((songRef) => {
        danceChart.songId = songRef.key
      }).catch(err => alert(err))
    }).catch(err => alert(err))
  },
  // save new chart to existing song - songId exists
  saveNewChart: function (danceChart, player, songId, difficulty, draft, user) {
    this.sortDanceChart(danceChart)
    firebase.database.ref('charts').push({
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      updatedAt: new Date().getTime(),
      createdBy: user
    }).then((chartRef) => {
      danceChart.chartId = chartRef.key
      // add the created chartId to the existing songId
      firebase.database.ref('songs/' + songId).child('charts').update({
        [difficulty]: {
          id: chartRef.key,
          draft: draft,
          createdBy: user
        }
      }).then(() => {
        danceChart.songId = songId
      }).catch(err => alert(err))
    }).catch(err => alert(err))
  },
  // overwrites an existing danceChart
  overwriteChart: function (danceChart, chartId, songId, difficulty, draft, user) {
    this.sortDanceChart(danceChart)
    firebase.database.ref('charts').child(`${chartId}`).update({
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      updatedAt: new Date().getTime(),
      lastUpdatedBy: user
    }).catch((err) => { alert(err) })
    firebase.database.ref(`songs/${songId}/charts`).child(`${difficulty}`).update({
      draft: draft
    }).catch((err) => { alert(err) })
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
    danceChart.title = settings.title
    danceChart.artist = settings.artist
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
