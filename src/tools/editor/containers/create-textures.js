import * as PIXI from 'pixi.js'
import editorConfig from '../config/editor-config'
import Staff from './../../../../public/img/staff.png'
import Note from './../../../../public/img/move.png'
import GuideLine from './../../../../public/img/guideline.png'

export default function createTextures (app, textures) {
  textures.staff = PIXI.Texture.from(Staff)
  textures.note = PIXI.Texture.from(Note)
  textures.guideLine = PIXI.Texture.from(GuideLine)

  let draw = new PIXI.Graphics()
  draw.lineStyle(editorConfig.cue.lineWidth, editorConfig.colors.grid)
  draw.drawCircle(0, 0, editorConfig.cue.size)

  textures.circle = app.renderer.generateTexture(draw)

  draw.destroy()

  textures.selection = new PIXI.Graphics()
  textures.cues = new PIXI.Graphics()
}
