import * as PIXI from 'pixi.js'
import { fixedGraphics } from '../../config/containers.js'

function setGuideLine () {
  let guideLine = PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/guideline.png')
  guideLine.x = 6
  guideLine.y = 59
  guideLine.scale.x = 0.95
  guideLine.tint = '0x9400d3'
  fixedGraphics.addChild(guideLine)
}

export default setGuideLine
