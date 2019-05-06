import * as PIXI from 'pixi.js'
import editorConfig from '../../config/editor-config'

// This sets the staff in the backgroundStaff container. To use when the scene is mounted or timing modified.
export default function drawStaff (containers, textures, player, danceChart, songManager) {
  if (!player) player = undefined
  if (!danceChart) danceChart = undefined
  if (!songManager) songManager = undefined
  let j = 0
  let currentLength = containers.auxiliary.backgroundStaff.children.length
  if (containers.auxiliary.backgroundStaff.children.length === 0) { // first draw
    for (let i = 0; i <= editorConfig.height; i += 56) {
      let staff = new PIXI.Sprite(textures.staff)
      staff.x = 20
      staff.y = i
      staff.scale.x = 0.9
      containers.auxiliary.backgroundStaff.addChild(staff)
    }
  } else {
    var videoStart = 0
    var videoEnd = player.getDuration()

    var firstNumber = Math.round((videoStart - danceChart.offset) / songManager.tempo)
    var lastNumber = Math.round((videoEnd - danceChart.offset) / songManager.tempo)

    var totalElements = Math.abs(firstNumber) + Math.abs(lastNumber) + 1

    if (currentLength < totalElements) { // if there are less than we need, modify all and add more
      for (let i = firstNumber; i <= lastNumber; i += 1) {
        if (j < currentLength) {
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.y = 56 * i
          j++
        } else {
          let staff = new PIXI.Sprite(textures.staff)
          staff.x = 20
          staff.y = 56 * i
          staff.scale.x = 0.9
          containers.auxiliary.backgroundStaff.addChild(staff)
        }
      }
    } else if (currentLength === totalElements) { // modify all y
      for (let i = firstNumber; i <= lastNumber; i += 1) {
        if (j < containers.auxiliary.backgroundStaff.children.length) {
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.y = 56 * i
          j++
        }
      }
    } else {
      for (let i = firstNumber; i <= lastNumber; i += 1) { // change y that needs to be changed, destroy and remove spare ones
        if (j < totalElements) {
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.y = 56 * i
          j++
        } else {
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.destroy()
          containers.auxiliary.backgroundStaff.removeChild(staff)
          j++
        }
      }
    }
  }
}
