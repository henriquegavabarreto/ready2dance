import updateTimeline from './update-timeline'

export default {
  animate: function (songManager, containers, cueManager, danceChart) {
    updateTimeline(songManager.currentBeat, containers)
    // cueManager.drawCues(danceChart)
  }
}
