import * as PIXI from 'pixi.js'
import editorConfig from '../../config/editor-config'

// This sets the staff in the backgroundStaff container. To use when the scene is mounted or timing modified.
export default function drawStaff (containers, textures, player, danceChart, songManager) {
  /* since this can be called when the editor first starts,
  there is no need for a player, danceChart or SongManager in the first draw */
  if (!player) player = undefined
  if (!danceChart) danceChart = undefined
  if (!songManager) songManager = undefined
  // j will be used as a counter to the elements of backgroundStaff container, so they can be altered properly
  let j = 0
  let currentLength = containers.auxiliary.backgroundStaff.children.length
  // if this is the first time drawing the background staff - runs when first called on the scene and ignored after
  if (currentLength === 0) {
    for (let i = 0; i <= editorConfig.height; i += 56) {
      let staff = new PIXI.Sprite(textures.staff)
      staff.x = 20
      staff.y = i
      staff.scale.x = 0.9
      containers.auxiliary.backgroundStaff.addChild(staff)
    }
  } else {
    /*
    This calculates how many staffs the background should have
    based on the video duration - get from the player - and tempo - assigned by the user
    */
    var videoStart = 0
    var videoEnd = player.getDuration()

    var firstNumber = Math.round((videoStart - danceChart.offset) / songManager.tempo)
    var lastNumber = Math.round((videoEnd - danceChart.offset) / songManager.tempo)

    var totalElements = Math.abs(firstNumber) + Math.abs(lastNumber) + 1

    // TODO: Check if the else if currentLength === totalElements is necessary or can be included in the first condition
    // if there are less staffs than we need, modify all y of the ones in the container and add more
    if (currentLength < totalElements) {
      for (let i = firstNumber; i <= lastNumber; i += 1) {
        if (j < currentLength) {
          // this only alters the ones we have
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.y = 56 * i
          j++
        } else {
          /* this creates new sprites and add them to the backgroundStaff container
          j is not necessary in this part of the code - only i, that needs to be equal to the lastNumber */
          let staff = new PIXI.Sprite(textures.staff)
          staff.x = 20
          staff.y = 56 * i
          staff.scale.x = 0.9
          containers.auxiliary.backgroundStaff.addChild(staff)
        }
      }
    } else if (currentLength === totalElements) {
      // modify all y to keep the distances right if the number of elements is correct
      for (let i = firstNumber; i <= lastNumber; i += 1) {
        if (j < currentLength) {
          let staff = containers.auxiliary.backgroundStaff.getChildAt(j)
          staff.y = 56 * i
          j++
        }
      }
    } else {
      // only executed when there is more staffs than it should
      for (let i = firstNumber; i <= lastNumber; i += 1) {
        // change y of the elements that need to be changed, destroy and remove spare ones
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
  // Adds filter to background staff
  PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH
  var fxaaFilter = new PIXI.filters.FXAAFilter()
  containers.auxiliary.backgroundStaff.filters = [fxaaFilter]
}
