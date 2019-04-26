export default {
  sortDanceChart: function (danceChart) {
    danceChart.moves.sort(function (a, b) {
      return a.split(',')[0] - b.split(',')[0]
    })
  },
  checkVideoId: function (player, data) {
    let id = -1
    for (var chartId in data) {
      if (data[chartId].videoId === player.videoId) {
        id = chartId
        break
      }
    }
    return id
  },
  saveNewChart: function (danceChart, player, ref) {
    ref.push({ title: danceChart.title,
      artist: danceChart.artist,
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoId: player.videoId,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      createdAt: new Date().getTime()
    })
  },
  overwriteChart: function (player, charts, danceChart, ref) {
    let chartId = this.checkVideoId(player, charts)
    ref.child(`${chartId}`).update({ title: danceChart.title,
      artist: danceChart.artist,
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      updatedAt: new Date().getTime()
    })
  },
  updateChartAndSettings: function (danceChart, settings, loadedChart) {
    danceChart.offset = parseFloat(loadedChart.offset)
    danceChart.artist = loadedChart.artist
    danceChart.title = loadedChart.title
    danceChart.moves = loadedChart.moves.split(' ')
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
    cueManager.update(songManager, moveManager)
  }
}
