// import * as PIXI from 'pixi.js'

/*
!!!!ATTENTION!!!!

drawGuideNumbers was used in the begining of the editor, however it is not good for
the memory management to use PIXI.Text for every number. From what I've read every text would be a new texture
to be stored, and 200 textures may not be good to be creating, deleting and moving.
Until there is a bitmap font to be used to draw the numbers, which in this case would be only 10 textures being allocated in the memory,
this function will not be used.
*/

// Use when options are saved and numbers need to be drawn again
function drawGuideNumbers (player, danceChart, songManager) {
  // if (guideNumbers.children.length > 0) guideNumbers.removeChildren()
  //
  // var videoStart = 0
  // var videoEnd = player.getDuration()
  //
  // var firstNumber = Math.round((videoStart - danceChart.offset) / songManager.tempo)
  // var lastNumber = Math.round((videoEnd - danceChart.offset) / songManager.tempo)
  //
  // for (let i = firstNumber; i <= lastNumber; i += 1) {
  //   var text = new PIXI.Text(i + 1, {
  //     fontSize: 14,
  //     fontFamily: 'Arial',
  //     fill: '#1ec503',
  //     align: 'center',
  //     stroke: '#1ec503'
  //   })
  //
  //   text.x = 195
  //   text.y = 56 + (56 * i)
  //
  //   text.cacheAsBitmap = true
  //   guideNumbers.addChild(text)
  // }
  // player.seek(songManager.getNearestBeatTime())
}

export default drawGuideNumbers
