import * as PIXI from 'pixi.js'

export default function createTextures (app, textures, gameConfig) {
  let draw = new PIXI.Graphics()
  draw.lineStyle(gameConfig.cue.lineWidth, gameConfig.colors.grid)
  draw.drawCircle(0, 0, gameConfig.cue.size)

  textures.circle = app.renderer.generateTexture(draw)

  draw.destroy()

  textures.cues = new PIXI.Graphics()

  let perfect = new PIXI.Text('PERFECT', {
    fontFamily: 'Arial',
    fontSize: 50,
    fill: ['#FFB90D', '#eeeeee', '#FFB90D'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  let great = new PIXI.Text('GREAT', {
    fontFamily: 'Arial',
    fontSize: 50,
    fill: ['#0EB800', '#eeeeee', '#0EB800'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  let good = new PIXI.Text('GOOD', {
    fontFamily: 'Arial',
    fontSize: 50,
    fill: ['#0051D5', '#eeeeee', '#0051D5'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  let miss = new PIXI.Text('MISS', {
    fontFamily: 'Arial',
    fontSize: 50,
    fill: ['#E30000', '#eeeeee', '#E30000'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  perfect.updateText()
  great.updateText()
  good.updateText()
  miss.updateText()

  textures.perfect = perfect.texture
  textures.great = great.texture
  textures.good = good.texture
  textures.miss = miss.texture

  // perfect.destroy()
  // great.destroy()
  // good.destroy()
  // miss.destroy()
}
