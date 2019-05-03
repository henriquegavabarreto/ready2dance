import updateTimeline from './update-timeline'

export default {
  animate: function (songManager, cueManager, danceChart) {
    updateTimeline(songManager.currentBeat)
    // cueManager.drawCues(danceChart)
  }
}
