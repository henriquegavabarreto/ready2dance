import * as PIXI from 'pixi.js'

export default function createTextures (app, textures, gameConfig) {
  let draw = new PIXI.Graphics()
  draw.lineStyle(gameConfig.cue.lineWidth, gameConfig.colors.grid)
  draw.drawCircle(0, 0, gameConfig.cue.size)

  textures.circle = app.renderer.generateTexture(draw)

  draw.destroy()

  textures.cues = new PIXI.Graphics()
}
