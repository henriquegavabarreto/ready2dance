import { fixedGraphics } from '../config/containers.js'

function updateTimeText (player) {
  let timeText = fixedGraphics.getChildByName('timeText')
  timeText.text = player.getCurrentTime()
}

export default updateTimeText
