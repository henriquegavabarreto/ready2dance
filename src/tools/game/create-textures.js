import * as PIXI from 'pixi.js'

// creates textures
export default function createTextures (app, textures, gameConfig) {
  // create circle texture for reference circles
  let draw = new PIXI.Graphics()
  draw.lineStyle(gameConfig.cue.lineWidth, gameConfig.colors.grid)
  draw.drawCircle(0, 0, gameConfig.cue.size)

  textures.circle = app.renderer.generateTexture(draw)

  draw.destroy()

  // Graphics to draw dynamic cues
  textures.cues = new PIXI.Graphics()

  // creates textures for feedback text
  textures.perfect = new PIXI.Text('PERFECT', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: ['#FFB90D', '#eeeeee', '#FFB90D'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  textures.awesome = new PIXI.Text('AWESOME', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: ['#0EB800', '#eeeeee', '#0EB800'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  textures.good = new PIXI.Text('GOOD', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: ['#0051D5', '#eeeeee', '#0051D5'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  textures.miss = new PIXI.Text('MISS', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: ['#E30000', '#eeeeee', '#E30000'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  textures.perfect.updateText()
  textures.awesome.updateText()
  textures.good.updateText()
  textures.miss.updateText()
}
