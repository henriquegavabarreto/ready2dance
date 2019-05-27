import firebase from '../config/firebase'

export default {
  sortDanceChart: function (danceChart) {
    danceChart.moves.sort(function (a, b) {
      return a[0] - b[0]
    })
  },
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
  checkForVideoId: function (songs, danceChart) {
    for (var songId in songs) {
      if (songs[songId].videoId === danceChart.videoId) {
        return true
      }
    }
    return false
  },
  searchSongByVideoId: function (songs, videoId) {
    for (var songId in songs) {
      if (songs[songId].videoId === videoId) {
        return { songId: songId, chartId: songs[songId].chartId }
      }
    }
    return null
  },
  saveNewSong: function (danceChart, player, difficulty, draft, user) { // save non existing song
    this.sortDanceChart(danceChart)
    firebase.database.ref('charts').push({
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdAt: new Date().getTime(),
      createdBy: user
    }).then((chartRef) => {
      danceChart.chartId = chartRef.key
      firebase.database.ref('songs').push({
        title: danceChart.title,
        artist: danceChart.artist,
        charts: {
          [difficulty]: {
            id: chartRef.key,
            draft: draft
          }
        },
        videoId: player.videoId
      }).then((songRef) => {
        danceChart.songId = songRef.key
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },
  saveNewChart: function (danceChart, player, songId, difficulty, draft, user) { // save new chart to existing song
    this.sortDanceChart(danceChart)
    firebase.database.ref('charts').push({
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdAt: new Date().getTime(),
      createdBy: user
    }).then((chartRef) => {
      danceChart.chartId = chartRef.key
      firebase.database.ref('songs/' + songId).child('charts').update({
        [difficulty]: {
          id: chartRef.key,
          draft: draft
        }
      }).then(() => {
        danceChart.songId = songId
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },
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
    }).catch((err) => { console.log(err) })
    firebase.database.ref(`songs/${songId}/charts`).child(`${difficulty}`).update({
      draft: draft
    }).catch((err) => { console.log(err) })
  },
  updateChartAndSettings: function (danceChart, settings, loadedChart) {
    danceChart.offset = parseFloat(loadedChart.offset)
    danceChart.artist = loadedChart.artist
    danceChart.title = loadedChart.title
    danceChart.moves = this.parseChart(loadedChart.moves)
    danceChart.videoEnd = parseFloat(loadedChart.videoEnd)
    danceChart.videoStart = parseFloat(loadedChart.videoStart)
    danceChart.videoId = loadedChart.videoId
    danceChart.bpm = parseInt(loadedChart.bpm)
    settings.offset = danceChart.offset.toString()
    settings.videoStart = danceChart.videoStart.toString()
    settings.videoEnd = danceChart.videoEnd.toString()
    settings.bpm = danceChart.bpm.toString()
    settings.title = danceChart.title
    settings.artist = danceChart.artist
  },
  updateDanceChart: function (danceChart, settings) {
    danceChart.offset = parseFloat(settings.offset)
    danceChart.videoStart = parseFloat(settings.videoStart)
    danceChart.videoEnd = parseFloat(settings.videoEnd)
    danceChart.bpm = parseInt(settings.bpm)
    danceChart.title = settings.title
    danceChart.artist = settings.artist
  },
  updateManagers: function (danceChart, songManager, moveManager, noteManager, cueManager) {
    songManager.update(danceChart)
    moveManager.update(songManager)
    noteManager.update(songManager)
    cueManager.update(songManager)
  },
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
