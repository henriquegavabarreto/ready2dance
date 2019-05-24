export default function giveFeedback (leftHand, rightHand, leftHitType, rightHitType, container, textures) {
  if (leftHand !== 'X') {
    let feedback = container.getChildAt(parseInt(leftHand[1]) - 1)
    feedback.texture = textures[leftHitType]
    feedback.visible = true
    setTimeout(() => {
      feedback.visible = false
    }, 300)
  }
  if (rightHand !== 'X') {
    let feedback = container.getChildAt(parseInt(rightHand[1]) - 1)
    feedback.texture = textures[rightHitType]
    feedback.visible = true
    setTimeout(() => {
      feedback.visible = false
    }, 300)
  }
}
