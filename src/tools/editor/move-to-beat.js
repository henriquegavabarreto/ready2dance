import drawSelection from './containers/copyPasteSelection/draw-selection'
import editorConfig from './config/editor-config'

function moveToBeat (player, songManager, moveManager, noteManager, cueManager, danceChart, containers, textures, skippedBeats) {
  if (player.getState() === 'paused' && !editorConfig.areaSelect) {
    player.seek(songManager.getNearestBeatTime(skippedBeats))
    setTimeout(() => {
      if (editorConfig.creatingMove) {
        noteManager.createNotes(editorConfig.pressedKey, containers, textures, songManager.nearestBeat, skippedBeats)
        moveManager.addBeatToArray(songManager.nearestBeat, skippedBeats)
      }
      if (editorConfig.selectingMoves) drawSelection(songManager, containers, textures)
    }, 200)
  }
}

export default moveToBeat
