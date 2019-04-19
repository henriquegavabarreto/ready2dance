var editorConfig = {
  width: 640,
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
  status: false,
  areaSelect: false,
  creatingMove: false,
  changingMove: false,
  selectingMoves: false,
  pressedKey: '',
  beatArray: [],
  selectedCircles: [],
  selectedHand: '',
  copySelection: [],
  clipboard: [],
  adjustments: {
    numbers: 4
  }
}

export default editorConfig
