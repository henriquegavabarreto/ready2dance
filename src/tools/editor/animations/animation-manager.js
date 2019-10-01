import updateTimeline from './update-timeline'

// helper function to animate timeline on editor view
export default {
  animate: function (songManager, containers, cueManager, danceChart) {
    updateTimeline(songManager.currentBeat, containers)
    // cueManager.drawCues(danceChart)
  }
}
