import editorConfig from '../../config/editor-config'

/*
Draws a selection to show the notes that are being selected for copy and paste functions
using textures.selection (PIXI.Graphics in textures)
*/
export default function drawSelection (songManager, containers, textures) {
  textures.selection.clear()
  textures.selection.beginFill(0x0077FF, 0.3)
  textures.selection.lineStyle(2, 0x0077FF, 1)
  let x = 20
  let y = 56 * editorConfig.copySelection[0] / 4 + 56
  // h is the height of the rectangle, being the start when the user presses the selection button and the end, the nearestBeat
  let h = (songManager.nearestBeat - editorConfig.copySelection[0]) * 14 + 14
  /* the following conditional has to be applied if the user is selecting beats going back in the song timeline,
  otherwise the rectangle won't look normal and may cause confusion on the selection */
  if (h <= 0) {
    y = y + 14
    h = h - 28
  }
  textures.selection.drawRect(x, y, 174, h)
}
