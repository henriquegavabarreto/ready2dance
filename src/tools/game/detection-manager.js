export default {
  detect: function (hand, position, pose) {
    let nose = pose.keypoints[0].position
    let leftEar = pose.keypoints[3].position
    let rightEar = pose.keypoints[4].position
    let leftShoulder = pose.keypoints[5].position
    let rightShoulder = pose.keypoints[6].position
    let leftHip = pose.keypoints[11].position
    let rightHip = pose.keypoints[12].position
    let leftHand = pose.keypoints[9].position
    let rightHand = pose.keypoints[10].position

    let shouldersY = (leftShoulder.y + rightShoulder.y) / 2
    let hipsY = (leftHip.y + rightHip.y) / 2
    let stomach = (hipsY + shouldersY) / 2
    // let neck = (nose.y + shouldersY) / 2

    // Sets which hand is being checked
    let checkingHand

    if (hand === 'R') {
      checkingHand = rightHand
    } else {
      checkingHand = leftHand
    }

    let left = false
    let center = false
    let right = false
    let top = false
    let middle = false
    let bottom = false

    if (checkingHand.x > leftEar.x) {
      left = true
    }
    if (checkingHand.x < leftShoulder.x + 20 && checkingHand.x > rightShoulder.x - 20) {
      center = true
    }
    if (checkingHand.x < rightEar.x) {
      right = true
    }
    if (checkingHand.y < shouldersY) {
      top = true
    }
    if (checkingHand.y < hipsY && checkingHand.y > nose.y) {
      middle = true
    }
    if (checkingHand.y > stomach) {
      bottom = true
    }

    // Check the position for the hand
    switch (position) {
      case '1':
        return left && bottom
      case '2':
        return center && bottom
      case '3':
        return right && bottom
      case '4':
        return left && middle
      case '5':
        return center && middle
      case '6':
        return right && middle
      case '7':
        return left && top
      case '8':
        return center && top
      case '9':
        return right && top
    }
  }
}
