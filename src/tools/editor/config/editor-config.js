var editorConfig = {
  width: 720,
  height: 720,
  colors: {
    sharp: 0xff0659,
    hold: 0x00c2b5,
    motion: 0xffd000
  },
  cue: {
    size: 55,
    lineWidth: 10
  },
  advanceSpawn: 16,
  creatingMove: false,
  changingMove: false,
  selectingMoves: false,
  pressedKey: '',
  beatArray: [],
  circleCount: 0,
  selectedCircles: [],
  selectedHand: '',
  copySelection: [],
  clipboard: [],
  adjustments: {
    numbers: 4
  }
}

export default editorConfig
