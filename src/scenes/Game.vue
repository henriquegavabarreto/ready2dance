<template>
  <div>
    <video id="videoStream" style="width: 600px; height: 600px; display: none;">
    </video>
    <v-btn @click="estimatePose">Estimate</v-btn>
  </div>
</template>

<script>
import getUserMedia from 'getusermedia'

export default {
  data () {
    return {
      stream: null,
      hideStream: true,
      poseNetOptions: {
        scale: 0.5,
        output: 16,
        flipHorizontal: false
      }
    }
  },
  mounted () {
    getUserMedia({ video: true, audio: false }, (err, stream) => {
      if (err) {
        console.log(err)
      } else {
        this.stream = document.getElementById('videoStream')
        this.stream.width = 600
        this.stream.height = 600
        this.stream.srcObject = stream
        this.stream.play()
        console.log('got a stream', stream)
      }
    })
  },
  methods: {
    estimatePose: function () {
      this.$store.state.net.estimateSinglePose(this.stream, this.poseNetOptions.scale, this.poseNetOptions.flipHorizontal, this.poseNetOptions.output).then((data) => {
        console.log(data)
      })
    }
  }
}
</script>
