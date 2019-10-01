export default function disableSelection (containers) {
  // disable selection of circles when necessary
  containers.auxiliary.selectionCircles.children.forEach(circle => {
    circle.interactive = false
  })
}
