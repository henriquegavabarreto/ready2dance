export default function updateTimeline (currentBeat, containers) {
  containers.master.dynamicContainer.y = -56 * currentBeat
  // eslint-disable-next-line
  containers.master.dynamicContainer.children.forEach ((container) => {
    let parentY = container.parent.y
    if (container !== containers.auxiliary.copyPasteSelection) {
      container.children.forEach((child) => { // hide every child offscreen
        if (child.y + parentY < -56 || child.y + parentY > 700) {
          child.visible = false
        } else {
          child.visible = true
        }
      })
    }
  })
}
