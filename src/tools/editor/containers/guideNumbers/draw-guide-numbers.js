import * as PIXI from 'pixi.js'
import { guideNumbers } from '../../config/containers'
import editorConfig from '../../config/editor'

// Use when options are saved and numbers need to be drawn again
function drawGuideNumbers (player, danceChart, songManager) {
  if (guideNumbers.children.length > 0) guideNumbers.removeChildren()

  var videoStart = 0
  var videoEnd = player.getDuration()

  var firstNumber = Math.round((videoStart - danceChart.offset) / songManager.tempo)
  var lastNumber = Math.round((videoEnd - danceChart.offset) / songManager.tempo)

  for (let i = firstNumber; i <= lastNumber; i += 1) {
    var text = new PIXI.Text(i + 1, {
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#1ec503',
      align: 'center',
      stroke: '#1ec503'
    })

    text.x = 195
    text.y = 56 + (56 * i)

    text.cacheAsBitmap = true
    guideNumbers.addChild(text)
  }
  player.seek(songManager.getNearestBeatTime())
}

export { drawGuideNumbers }
