import { selectionCircles, guideNumbers, fixedGraphics, cueContainer, copyPasteSelection } from '../config/containers'

function destroyContainers () {
  let containers = [ selectionCircles, guideNumbers, fixedGraphics, cueContainer, copyPasteSelection ]
  containers.forEach((container) => {
    container.children.forEach((child) => {
      child.destroy(true)
    })
  })
}

export default destroyContainers
