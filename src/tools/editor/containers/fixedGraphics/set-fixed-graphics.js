import * as PIXI from 'pixi.js'
import { fixedGraphics } from '../../config/containers.js'
import editorConfig from '../../config/editor-config.js'

function setFixedGraphics () {
  setGuideline()
  setVideoText()
  setTimeText()
}

function setGuideline () {
  let guideline = PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/guideline.png')
  guideline.x = 6
  guideline.y = 59
  guideline.scale.x = 0.95
  guideline.tint = '0x9400d3'
  fixedGraphics.addChild(guideline)
}

function setVideoText () {
  var videoText = new PIXI.Text('Video Time:', {
    fontSize: 18,
    fontFamily: 'Arial',
    fill: '#1ec503',
    align: 'center',
    fontWeight: 500
  })

  videoText.x = editorConfig.width / 2.8
  videoText.y = 10
  videoText.name = 'videoText'

  fixedGraphics.addChild(videoText)
}

function setTimeText () {
  let videoText = fixedGraphics.getChildByName('videoText')

  var timeText = new PIXI.Text('0', {
    fontSize: 18,
    fontFamily: 'Arial',
    fill: '#1ec503',
    align: 'center',
    fontWeight: 500
  })

  timeText.x = videoText.x + videoText.width + 5
  timeText.y = videoText.y
  timeText.name = 'timeText'

  fixedGraphics.addChild(timeText)
}

export default setFixedGraphics
