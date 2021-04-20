import editorConfig from './config/editor-config'

// move a certain number of beats (skippedBeats)
function moveToBeat (player, songManager, cueManager, danceChart, containers, textures, skippedBeats) {
  // only move when the player is paused and is not in areaSelect mode
  if (player.getState() === 'paused' && !editorConfig.areaSelect) {
    // seek video to the beat it is supposed to be
    player.seek(songManager.getNearestBeatTime(skippedBeats))
    // clear ToDraw before setting new index to draw new circles
    cueManager.holdsToDraw = []
    cueManager.movesToDraw = []
    cueManager.setCurrentIndex(danceChart)
    // TODO: staff scroll
    // the two lines below try to implement scrolling mousewheel, while still being possible to use arrow keys
    // player.seek(songManager.getExactQuarterBeatTime(skippedBeats))
    // containers.master.dynamicContainer.pivot.y += (56 / 4) * skippedBeats
    // it reduces errors when using the functions inside a setTimeout
  }
}

export default moveToBeat
