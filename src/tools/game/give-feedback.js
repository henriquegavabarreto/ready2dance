/*
Change texture of the feedback depending on HitType, determined by
the result of posenet detection, area that hand should be placed as well
as the frame when it was recognized as positive or not
*/
export default function giveFeedback (leftHand, rightHand, leftPosition, rightPosition, leftHitType, rightHitType, container, textures) {
  if (leftHand !== 'X' && leftHand !== 'MP') {
    let feedback = container.getChildAt(leftPosition - 1)
    feedback.texture = textures[leftHitType].texture
    feedback.visible = true
    setTimeout(() => {
      feedback.visible = false
    }, 300)
  }
  if (rightHand !== 'X' && rightHand !== 'MP') {
    let feedback = container.getChildAt(rightPosition - 1)
    feedback.texture = textures[rightHitType].texture
    feedback.visible = true
    setTimeout(() => {
      feedback.visible = false
    }, 300)
  }
}
