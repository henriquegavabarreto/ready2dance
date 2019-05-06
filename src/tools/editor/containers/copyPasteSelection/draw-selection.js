import * as PIXI from 'pixi.js'
import editorConfig from '../../config/editor-config'

export default function drawSelection (songManager, containers) {
  let selection
  if (containers.auxiliary.copyPasteSelection.children.length === 0) { // if it is the first time using it
    selection = new PIXI.Graphics()
    containers.auxiliary.copyPasteSelection.addChild(selection)
  } else { // if there is one graphic created already
    selection = containers.auxiliary.copyPasteSelection.getChildAt(0)
    selection.clear()
  }
  selection.beginFill(0x0077FF, 0.4)
  selection.lineStyle(2, 0x0077FF, 1)
  let x = 20
  let y = 56 * editorConfig.copySelection[0] / 4 + 56
  let h = (songManager.nearestBeat - editorConfig.copySelection[0]) * 14 + 14
  if (h <= 0) {
    y = y + 14
    h = h - 28
  }
  selection.drawRect(x, y, 174, h)
}
