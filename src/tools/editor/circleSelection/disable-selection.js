export default function disableSelection (containers) {
  containers.auxiliary.selectionCircles.children.forEach(circle => {
    circle.interactive = false
  })
}
