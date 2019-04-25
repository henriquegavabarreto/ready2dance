import drawSelection from './containers/copyPasteSelection/draw-selection'
import editorConfig from './config/editor-config'

function moveToBeat (player, songManager, moveManager, noteManager, cueManager, danceChart, skippedBeats, ticker) {
  if (player.getState() === 'paused' && !editorConfig.areaSelect) {
    player.seek(songManager.getNearestBeatTime(skippedBeats))
    setTimeout(() => {
      ticker.update()
      if (editorConfig.creatingMove) {
        noteManager.createNotes(editorConfig.pressedKey, songManager.nearestBeat, skippedBeats)
        moveManager.addBeatToArray(songManager.nearestBeat, skippedBeats)
      }
      if (editorConfig.selectingMoves) drawSelection(songManager)
      cueManager.drawCues(danceChart)
    }, 200)
  }
}

export default moveToBeat
