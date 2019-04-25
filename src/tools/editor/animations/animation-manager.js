import updateTimeText from './update-time-text'
import updateTimeline from './update-timeline'

export default {
  animate: function (player, songManager, cueManager, danceChart) {
    updateTimeText(player)
    updateTimeline(songManager.currentBeat)
    cueManager.drawCues(danceChart)
  }
}
