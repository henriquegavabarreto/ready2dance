import { guideNumbers, noteElements, backgroundStaff, copyPasteSelection } from '../config/containers.js'

function updateTimeline (currentBeat) {
  let timelinePosition = -56 * currentBeat
  backgroundStaff.y = timelinePosition
  guideNumbers.y = timelinePosition
  noteElements.y = timelinePosition
  copyPasteSelection.y = timelinePosition
}

export default updateTimeline
