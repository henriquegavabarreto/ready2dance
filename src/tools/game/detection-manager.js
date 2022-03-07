// function that returns if the hand was placed at a given position based on posenet body keypoints
export default {
  detect: function (hand, position, pose) {
    // set relevant body parts based on keypoints
    let nose = pose.keypoints[0]
    // let leftEar = pose.keypoints[3].position
    // let rightEar = pose.keypoints[4].position
    let leftShoulder = pose.keypoints[5]
    let rightShoulder = pose.keypoints[6]
    let leftHip = pose.keypoints[11]
    let rightHip = pose.keypoints[12]
    let leftHand = pose.keypoints[9]
    let rightHand = pose.keypoints[10]

    let shouldersY = (leftShoulder.y + rightShoulder.y) / 2
    let hipsY = (leftHip.y + rightHip.y) / 2
    let stomach = (hipsY + shouldersY) / 2
    // let neck = (nose.y + shouldersY) / 2

    // Sets which hand is being checked
    let checkingHand

    // sets the hand that will be checked this time (this is a parameter for the detect function)
    if (hand === 'R') {
      checkingHand = rightHand
    } else {
      checkingHand = leftHand
    }

    // set area positions to false
    let left = false
    let center = false
    let right = false
    let top = false
    let middle = false
    let bottom = false

    // check which conditions based on body parts and the idea of 3x3 grid are true
    if (checkingHand.x > nose.x) {
      left = true
    }
    if (checkingHand.x < leftShoulder.x + 20 && checkingHand.x > rightShoulder.x - 20) {
      center = true
    }
    if (checkingHand.x < nose.x) {
      right = true
    }
    if (checkingHand.y < nose.y) {
      top = true
    }
    if (checkingHand.y < hipsY && checkingHand.y > nose.y - 10) {
      middle = true
    }
    if (checkingHand.y > stomach) {
      bottom = true
    }

    // Returns hand placed in the given position (true or false)
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
