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
  overwriteChart: function (chartId, danceChart, ref) {
    ref.child(`${chartId}`).update({ title: danceChart.title,
      artist: danceChart.artist,
      offset: danceChart.offset,
      bpm: danceChart.bpm,
      videoStart: danceChart.videoStart,
      videoEnd: danceChart.videoEnd,
      moves: danceChart.moves.join(' '),
      updatedAt: new Date().getTime()
    })
  }
}
