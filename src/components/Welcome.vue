<template>
  <!-- welcome dialog that describes some of the apps functionalities and warnings -->
  <v-dialog
    v-model="$store.state.welcome"
    persistent
    max-width="450"
  >
    <v-card style="border-radius: 10px;">
      <v-card-title class="black headline justify-center white--text font-weight-medium">
        Welcome to Ready2Dance!
      </v-card-title>

      <v-card-text class="subheading scroll-y" style="max-height: 60vh;">
        <p class="text-xs-center pb-3">Thank you for login in! If this is your first time here please read the instructions below!</p>
        <ul>
          <li>This website use a lot of data (22~90MB PoseNet + video streaming), so you may prefer to use it on Wi-Fi only to avoid charges from your carrier.</li>
          <li>This game uses your front camera, so remember to allow it to be used so the game can begin - sometimes adblock or pop-up blockers get on the way.</li>
          <li>Stay at least 1.8m (6ft) away from the camera, otherwise the movement detection won't work properly.</li>
          <li>Static clear backgrounds work best for detection as well as good lighting conditions.</li>
          <li>Every device has a different camera latency. Check your current device latency using your prefered method (<a href="https://www.youtube.com/watch?v=WXud3F-Cuac">this is one</a>) and change it in the settings or try the calibration on settings.</li>
          <li>If you have any problems, suggestions or if you just want to contribute to this project, please send an email to ready2dancegame@gmail.com .</li>
        </ul>
        <p class="text-xs-center pt-3 pb-0 mb-0">Have fun!</p>
      </v-card-text>

      <v-card-actions class="black justify-center">

        <v-btn
          class="white"
          color="green darken-1"
          flat
          @click="closeWelcome()"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  methods: {
    closeWelcome: function () {
      this.$store.commit('toggleWelcome', false)
      this.$store.commit('dismissWelcome')
    }
  }
}
</script>

<style scoped>
  li {
    margin: 10px 5px 10px 5px;
  }
</style>
