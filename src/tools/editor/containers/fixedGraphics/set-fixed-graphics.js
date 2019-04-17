import * as PIXI from 'pixi.js'
import { fixedGraphics } from '../../config/containers.js'
import editorConfig from '../../config/editor-config.js'
// var showTimingModal = require('../../listeners/menus/show-timing-modal.js')
// var showMenuModal = require('../../listeners/menus/show-menu-modal.js')
// var showSongModal = require('../../listeners/menus/show-song-modal.js')

function setFixedGraphics () {
  setGuideline()
  setVideoText()
  setTimeText()
  setMenuButtons()
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
  videoText.y = editorConfig.height / 6
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

function setMenuButtons () {
  let menuHeight = editorConfig.height / 20

  let timeButton = PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/timing.png')
  timeButton.x = editorConfig.width / 2.35
  setButtonDefaults(timeButton, menuHeight)
  timeButton.on('mousedown', (event) => {
    // showTimingModal()
    console.log('show timing modal')
  })

  let songButton = PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/song.png')
  songButton.x = timeButton.x + 130
  setButtonDefaults(songButton, menuHeight)
  songButton.on('mousedown', (event) => {
    console.log('show song modal')
    // showSongModal()
  })

  let menuButton = PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/menu.png')
  menuButton.x = songButton.x + 130
  setButtonDefaults(menuButton, menuHeight)
  menuButton.on('mousedown', (event) => {
    // showMenuModal()
    console.log('show menu modal')
  })

  fixedGraphics.addChild(timeButton)
  fixedGraphics.addChild(songButton)
  fixedGraphics.addChild(menuButton)
}

function setButtonDefaults (btn, h) {
  btn.y = h
  btn.name = `${btn}`
  btn.interactive = true
  btn.buttonMode = true
  btn.scale.x = 0.8
  btn.scale.y = 0.8
}
export default setFixedGraphics
