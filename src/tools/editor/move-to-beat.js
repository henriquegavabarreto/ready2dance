import drawSelection from './containers/copyPasteSelection/draw-selection'
import editorConfig from './config/editor-config'

// move a certain number of beats (skippedBeats)
function moveToBeat (player, songManager, moveManager, noteManager, cueManager, danceChart, containers, textures, skippedBeats) {
  // only move when the player is paused and is not in areaSelect mode
  if (player.getState() === 'paused' && !editorConfig.areaSelect) {
    // seek video to the beat it is supposed to be
    player.seek(songManager.getNearestBeatTime(skippedBeats))
    // clear ToDraw before setting new index to draw new circles
    cueManager.holdsToDraw = []
    cueManager.movesToDraw = []
    cueManager.setCurrentIndex(danceChart)
    // TODO: staff scroll
    // two lines below try to implement scrolling mousewheel and using arrow keys at the same time
    // player.seek(songManager.getExactQuarterBeatTime(skippedBeats))
    // containers.master.dynamicContainer.pivot.y += (56 / 4) * skippedBeats
    // it reduces errors when using the functions inside a setTimeout
    setTimeout(() => {
      // if creating a new move
      if (editorConfig.creatingMove) {
        // create notes in the canvas
        noteManager.createNotes(editorConfig.pressedKey, containers, textures, songManager.nearestBeat, skippedBeats)
        // add selected and in between beats to array - necessary when selecting areas
        moveManager.addBeatToArray(songManager.nearestBeat, skippedBeats)
      }
      // if making a selection, draw it on screen
      if (editorConfig.selectingMoves) drawSelection(songManager, containers, textures)
    }, 200)
  }
}

export default moveToBeat
