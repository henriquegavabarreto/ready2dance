import * as PIXI from 'pixi.js'

function setGuideLine (containers, textures) {
  let guideLine = new PIXI.Sprite(textures.guideLine)
  guideLine.x = 6
  guideLine.y = 59
  guideLine.scale.x = 0.95
  guideLine.tint = '0x9400d3'
  containers.auxiliary.guideLine.addChild(guideLine)
}

export default setGuideLine
