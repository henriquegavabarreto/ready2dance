import drawSelection from './containers/copyPasteSelection/draw-selection'
import editorConfig from './config/editor-config'
import animationManager from './animations/animation-manager'

function moveToBeat (player, songManager, moveManager, noteManager, cueManager, danceChart, skippedBeats) {
  if (player.getState() === 'paused' && !editorConfig.areaSelect) {
    player.seek(songManager.getNearestBeatTime(skippedBeats))
    animationManager.animate(player, songManager, cueManager, danceChart)
    setTimeout(() => {
      if (editorConfig.creatingMove) {
        noteManager.createNotes(editorConfig.pressedKey, songManager.nearestBeat, skippedBeats)
        moveManager.addBeatToArray(songManager.nearestBeat, skippedBeats)
      }
      if (editorConfig.selectingMoves) drawSelection(songManager)
      animationManager.animate(player, songManager, cueManager, danceChart)
    }, 150)
  }
}

export default moveToBeat
