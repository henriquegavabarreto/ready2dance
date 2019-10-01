export default function enableSelection (containers) {
  // enable selection of circles when necessary
  containers.auxiliary.selectionCircles.children.forEach(circle => {
    circle.interactive = true
  })
}
