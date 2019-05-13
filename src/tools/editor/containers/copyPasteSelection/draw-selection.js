import editorConfig from '../../config/editor-config'

export default function drawSelection (songManager, containers, textures) {
  textures.selection.clear()
  textures.selection.beginFill(0x0077FF, 0.3)
  textures.selection.lineStyle(2, 0x0077FF, 1)
  let x = 20
  let y = 56 * editorConfig.copySelection[0] / 4 + 56
  let h = (songManager.nearestBeat - editorConfig.copySelection[0]) * 14 + 14
  if (h <= 0) {
    y = y + 14
    h = h - 28
  }
  textures.selection.drawRect(x, y, 174, h)
}
