import { cueContainer } from '../../config/containers'
import * as PIXI from 'pixi.js'

function setCueGraphics () {
  var cues = new PIXI.Graphics()
  cues.name = 'cues'
  cueContainer.addChild(cues)
}

export default setCueGraphics
