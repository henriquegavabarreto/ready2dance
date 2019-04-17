import * as PIXI from 'pixi.js'
import { backgroundStaff } from '../../config/containers'
import editorConfig from '../../config/editor-config'

// This sets the staff in the backgroundStaff container. To use when the scene is mounted.
function setBackgroundStaff () {
  for (let i = 0; i <= editorConfig.height; i += 56) {
    //
    // eslint-disable-next-line
    let staff = new PIXI.Sprite.from('https://henriquegavabarreto.github.io/paraparagame/assets/staff.png')
    staff.x = 20
    staff.y = i
    staff.scale.x = 0.9
    backgroundStaff.addChild(staff)
  }
}

export default setBackgroundStaff
