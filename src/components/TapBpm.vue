<template>
  <v-card id="bpmCalculator" @keyup.t="calculateBpm" @click="focusOnCalculator" tabindex="0">
    <v-card-title primary-title class="py-2 px-0 justify-center subheading">
      TAP BPM CALCULATOR
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="text-xs-center body-2 pa-2">
      {{ bpmToShow }}
    </v-card-text>
    <v-card-actions class="justify-space-around">
      <v-btn small color="primary" @click="calculateBpm">tap</v-btn><v-btn small color="primary" @click="resetBpmCounter(true)">reset</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      totalBpm: 0,
      bpmToShow: 'Tap below or select this box and press t',
      previousTime: 0,
      clickCounter: 0
    }
  },
  methods: {
    calculateBpm: function () {
      if (this.previousTime === 0) {
        // this would be the first click
        this.previousTime = Date.now()
        this.bpmToShow = 0
      } else if (Date.now() - this.previousTime > 2000) {
        // if too much time has passed since the last click (2 seconds would be 30 bpm)
        // reset the counter and consider this to be the first click
        this.resetBpmCounter(true)
        this.previousTime = Date.now()
      } else {
        // raises the counter
        this.clickCounter++
        // calculate the delta time
        let d = Date.now() - this.previousTime
        // sets the previous time to current time
        this.previousTime = Date.now()
        // bpm of the current click (considering the last and current times)
        let clickBpm = 60 / (d / 1000)
        // adds this click bpm to totalBpm
        this.totalBpm = this.totalBpm + clickBpm
        // bpm will be the average total bpm / number of clicks
        this.bpmToShow = Math.round(this.totalBpm / this.clickCounter)
      }
    },
    resetBpmCounter: function (showZero) {
      this.previousTime = 0
      this.totalBpm = 0
      this.clickCounter = 0
      if (showZero) {
        this.bpmToShow = 0
      }
    },
    focusOnCalculator: function () {
      document.getElementById('bpmCalculator').focus()
    }
  }
}
</script>
