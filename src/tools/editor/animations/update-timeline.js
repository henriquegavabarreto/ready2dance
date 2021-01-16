export default function updateTimeline (currentBeat, containers) {
  // move container
  containers.master.dynamicContainer.pivot.y = 56 * currentBeat
  // don't show children of the container that are not on the screen (pixi memory)
  // containers.master.dynamicContainer.children.forEach((container) => {
  //   let parentY = container.parent.y
  //   if (container !== containers.auxiliary.copyPasteSelection) {
  //     container.children.forEach((child) => { // hide every child offscreen
  //       if (child.y + parentY < -56 || child.y + parentY > 700) {
  //         child.visible = false
  //       } else {
  //         child.visible = true
  //       }
  //     })
  //   }
  // })
}
