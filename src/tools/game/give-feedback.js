/*
Change texture of the feedback depending on HitType, determined by
the result of posenet detection, area that hand should be placed as well
as the frame when it was recognized as positive or not
*/
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
