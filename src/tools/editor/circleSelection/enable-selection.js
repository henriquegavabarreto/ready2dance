export default function enableSelection (containers) {
  containers.auxiliary.selectionCircles.children.forEach(circle => {
    circle.interactive = true
  })
}
