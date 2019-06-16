import * as PIXI from 'pixi.js'
import editorConfig from '../config/editor-config'

export default function createTextures (app, textures) {
  textures.staff = PIXI.Texture.from('../../../assets/staff.png')
  textures.note = PIXI.Texture.from('../../../assets/move.png')
  textures.guideLine = PIXI.Texture.from('../../../assets/guideline.png')

  let draw = new PIXI.Graphics()
  draw.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.grid)
  draw.drawCircle(0, 0, editorConfig.cue.size)

  textures.circle = app.renderer.generateTexture(draw)

  draw.destroy()

  textures.selection = new PIXI.Graphics()
  textures.cues = new PIXI.Graphics()
}
