export default function disableSelection (containers) {
  // disable selection of circles when needed - used when all circles already have been selected.
  containers.auxiliary.selectionCircles.children.forEach(circle => {
    circle.interactive = false
  })
}
