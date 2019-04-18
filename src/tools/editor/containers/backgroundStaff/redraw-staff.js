import * as PIXI from 'pixi.js'
import { backgroundStaff } from '../../config/containers'

function redrawStaff (player, danceChart, songManager) {
  backgroundStaff.removeChildren()

  var videoStart = 0
  var videoEnd = player.getDuration()

  var firstNumber = Math.round((videoStart - danceChart.offset) / songManager.tempo)
  var lastNumber = Math.round((videoEnd - danceChart.offset) / songManager.tempo)

  for (let i = firstNumber; i <= lastNumber; i += 1) {
    // eslint-disable-next-line
    let staff = new PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/staff.png')
    staff.x = 20
    staff.y = 56 * i
    staff.scale.x = 0.9
    backgroundStaff.addChild(staff)
  }
}

export default redrawStaff
