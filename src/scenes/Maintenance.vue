<!-- Maintenance Mode -->
<template>
  <div>
    <v-container fluid class="pa-0 ma-0 yellow darken-2">
      <v-layout row wrap>
        <!-- Webpage title and enter options -->
        <v-flex xs12>
          <v-container fluid justify-center align-center>
            <v-layout row wrap align-center justify-center style="min-height: 89vh;">
              <v-flex class="text-xs-center" xs12>
                <span class="display-4 font-weight-medium text-xs-center">Ready 2 Dance</span><br>
                <span class="display-1 font-weight-thin mb-0 text-xs-center">is under maintenance!</span><br>
              </v-flex>
              <v-flex xs12 class="pt-4">
                <span>We are working on some updates and the website needs to be down for a while!</span><br>
                <span>We are sorry about the disturbance and hope you to visit us in a near future!</span><br>
                <span>If you are hungry for some parapara, please check out <a href="https://twitter.com/paraparavideos">ParaParaVideos on twitter</a>.</span><br>
                <span>If you want to contribute to this project in anyway, please <a href="mailto:ready2dancegame@gmail.com">send an email</a>.</span>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <!-- v-flex to show that there is an about below -->
        <v-flex class="mt-2" xs12>
          <v-container fluid class="pa-0">
            <v-layout row wrap class="pa-0">
              <v-flex dark class="black white--text px-0 text-xs-center" xs12>
                <h2><span>⬇⬇⬇</span><span> What is this about? </span><span>⬇⬇⬇</span></h2>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex xs12>
          <!-- Website explanation -->
          <v-container fluid>
            <v-layout row wrap>
              <v-flex xs12>
                <v-card>
                  <v-card-title class="black white--text headline font-weight-bold" primary-title>
                    What is "Ready 2 Dance"?
                  </v-card-title>
                  <v-card-text class="title font-weight-regular blue-grey lighten-5">
                    <p>Ready 2 Dance is an online rhythm dance game based on the japanese synchronized dance <a target="_blank" href="https://en.wikipedia.org/wiki/Para_Para">ParaPara</a> (<a target="_blank" href="https://ja.wikipedia.org/wiki/%E3%83%91%E3%83%A9%E3%83%91%E3%83%A9">パラパラ</a>).</p>
                    <p>This website uses your webcam to check how accurate are your moves compared to the dance routine. If you have your hands in the correct place and at the correct time, you score points!</p>
                    <p>You can play this game in any Operational System, but preferably using Google Chrome's latest version. No need to install anything else.</p>
                    <p>No streaming of your webcam leaves the browser. No servers involved on this. All the movement checking happens in your own computer using <a target="_blank" href="https://www.npmjs.com/package/@tensorflow-models/posenet">PoseNet</a>.</p>
                    <p>Because of that, your hardware can affect the gameplay. (As well as lighting conditions, background and the distance you are from the camera.)</p>
                    <p>The better your camera and your GPU, the better the movement detection can be, you just need to change that in the settings. Make sure to use hardware acceleration on Chrome's settings and to allow this website do use your webcam.</p>
                    <p>Don't forget to be aware of your surroundings and that this website can consume a lot of data (to download the PoseNet model and streaming youtube videos), so you may prefer to use this application using Wi-Fi.</p>
                    <p>I hope you all enjoy this little experiment!</p>
                    <br>
                    <p>Any thoughts or ideas? Want to contribute for this project?</p>
                    <a href="mailto:ready2dancegame@gmail.com">Send me an email!</a>
                    <br>
                    <p class="text-sm-right">Created using Vue.js, Vuetify, Tensorflow's PoseNet, pixi.js and the youtube API by <a target="blank" href="https://github.com/henriquegavabarreto/">Henrique Barreto</a>.</p>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer dark>
      <v-spacer></v-spacer>
      <div class="mr-3">
        © {{ new Date().getFullYear() }}, READY2DANCE
      </div>
    </v-footer>
    <v-layout row justify-center>
  </v-layout>
  </div>
</template>
