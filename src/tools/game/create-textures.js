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

  textures.miss = new PIXI.Text('MISS', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: ['#E30000', '#eeeeee', '#E30000'],
    stroke: '#cccccc',
    strokeThickness: 2,
    align: 'center'
  })

  textures.perfect.updateText()
  textures.miss.updateText()
}
