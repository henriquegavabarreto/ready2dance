<!-- First view - Where the user can enter, register or log in -->
<template>
  <div>
    <v-container fluid class="pa-0 ma-0" id="background">
      <v-layout row wrap>
        <!-- Webpage title and enter options -->
        <v-flex xs12>
          <v-container fluid justify-center align-center>
            <v-layout row wrap align-center justify-center style="min-height: 88.5vh;">
              <v-flex class="text-xs-center" xs12>
                <span class="display-1 font-weight-thin mb-0 text-xs-center">Get</span><br>
                <span class="display-4 font-weight-medium text-xs-center">Ready 2 Dance</span>
              </v-flex>
              <v-flex style="display: block;" class="text-xs-center mt-1" xs12>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-btn style="min-width: 15vw;" large dark @click="toggleLoginModal">log in</v-btn>
                  </v-flex>
                  <v-flex xs12>
                    <v-btn style="min-width: 15vw;" large dark @click="toggleRegisterModal">register</v-btn>
                  </v-flex>
                  <v-flex xs12>
                    <v-btn style="min-width: 15vw;" large dark @click="enterAsGuest">enter as guest</v-btn>
                  </v-flex>
                </v-layout>
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
        © 2019, READY2DANCE
      </div>
    </v-footer>
    <v-layout row justify-center>
    <!-- modal for user to register before entering -->
    <v-dialog v-model="registerModal" persistent max-width="600">
      <v-card
        style="border-radius: 10px;"
        flat
      >
      <v-toolbar dark class="cyan headline font-weight-medium">
        <v-toolbar-title>Register</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <!-- show error message from auth -->
        <p class="pt-0 mt-0" v-if="error">
          <b>Error:</b>
          <ul>
            <li class="red--text">{{ error }}</li>
          </ul>
        </p>
        <!-- form for user to register themselves-->
        <v-form ref="register">
          <v-text-field v-model="username" label="Username*" :rules="usernameRules" required></v-text-field>
          <v-text-field v-model="email" label="Email*" :rules="emailRules" required></v-text-field>
          <v-text-field @keyup.enter="registerNewUser" v-model="password" label="Password*" :rules="passwordRules" type="password" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          dark
          :loading="loading"
          @click="registerNewUser"
        >
          Continue
        </v-btn>
        <v-btn :disable="loading" @click="toggleRegisterModal" flat>Cancel</v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- login modal for registered users -->
    <v-dialog v-model="loginModal" persistent max-width="600">
      <v-card style="border-radius: 10px;">
        <v-toolbar dark class="cyan headline font-weight-medium">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <!-- show error text when there is a problem login in -->
          <p class="pt-0 mt-0" v-if="error">
            <b>Error:</b>
            <ul>
              <li class="red--text">{{ error }}</li>
            </ul>
          </p>
          <v-text-field v-model="email" label="Email*" :rules="emailRules" required></v-text-field>
          <v-text-field @keyup.enter="logUserIn" v-model="password" label="Password*" type="password" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            dark
            @click="logUserIn"
            :loading="loading"
          >
            Continue
          </v-btn>

          <v-btn :disable="loading" @click="toggleLoginModal" flat>Cancel</v-btn>
          <v-btn flat @click="setNewPassword">I forgot my password</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
  </div>
</template>

<script>
import firebase from '../tools/config/firebase'

export default {
  data () {
    return {
      registerModal: false,
      loginModal: false,
      email: '',
      password: '',
      username: '',
      loading: false,
      loadingGuest: false,
      error: null,
      usernameRules: [ v => (!!/^[a-z0-9_-]/g.test(v) && v.length > 3 && v.length < 17) || 'Alphanumeric lowercase only. Can include _ and – having a length of 4 to 16 characters.' ],
      emailRules: [ v => !!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g.test(v) || 'Enter a valid e-mail address.' ],
      passwordRules: [ v => v.length > 5 || 'The password must be at least 6 characters long.' ]
    }
  },
  methods: {
    // toggles register modal to be shown
    toggleRegisterModal: function () {
      this.registerModal = !this.registerModal
    },
    // toggles login modal to be shown
    toggleLoginModal: function () {
      this.loginModal = !this.loginModal
    },
    // register new user using auth and add username to the database
    registerNewUser: function () {
      if (this.$refs.register.validate()) {
        this.loading = true
        firebase.database.ref('users').orderByChild('username').equalTo(`${this.username}`).once('value', snapshot => {
          if (snapshot.val() === null) { // if there is no user with the chosen username create a new one
            firebase.auth.createUserWithEmailAndPassword(this.email, this.password).then((result) => { // create new user - the default type is always user
              let user = {
                username: this.username,
                type: 'user'
              }
              firebase.database.ref(`users/${result.user.uid}`).set(user).then(() => {
                this.loading = false
                this.$store.commit('changeUser', user)
                this.$store.commit('toggleWelcome', true)
                this.$store.commit('goToScene', 'song-selection')
              }).catch((err) => {
                this.loading = false
                this.error = err.message
                console.log(err)
              })
            }).catch((err) => {
              this.loading = false
              this.error = err.message
              console.log(err)
            })
          } else { // when the username is not available, it doesn't go through
            this.loading = false
            this.error = 'Username not available, please choose another one.'
          }
        })
      }
    },
    logUserIn: function () {
      this.loading = true
      // log user in with email and password
      firebase.auth.signInWithEmailAndPassword(this.email, this.password).then((result) => {
        firebase.database.ref(`users/${result.user.uid}`).once('value').then((value) => {
          this.$store.commit('changeUser', value.val())
          this.loading = false
          this.$store.commit('toggleWelcome', true)
          this.$store.commit('goToScene', 'song-selection')
        })
      }).catch((err) => { // shows error in the modal dialog in case the user can't log in
        this.error = err.message
        if (err.code === 'auth/invalid-email') {
          this.error = 'This e-mail address is invalid. Check if it is correct.'
        } else if (err.code === 'auth/user-not-found') {
          this.error = 'We couldn\'t find an account for this e-mail address. Check if your e-mail is correct or register first.'
        } else if (err.code === 'auth/wrong-password') {
          this.error = 'Invalid password.'
        }
        this.loading = false
        console.log(err)
      })
    },
    /* Enter the game with no need of login in, doesn't save points to the
    database and maybe can't use the (to be implemented) chat feature */
    enterAsGuest: function () {
      this.$store.commit('toggleWelcome', true)
      this.$store.commit('goToScene', 'song-selection')
    },
    // reset password
    setNewPassword: function () {
      firebase.auth.sendPasswordResetEmail(this.email).then(() => {
        this.error = 'We sent an e-mail. Change your password and come back here to log in.'
      }).catch((err) => {
        if (err.code === 'auth/invalid-email') {
          this.error = 'This e-mail address is invalid. Check if it is correct.'
        } else if (err.code === 'auth/user-not-found') {
          this.error = 'We couldn\'t find an account for this e-mail address. Check if your e-mail is correct or register first.'
        } else {
          this.error = 'error'
        }
      })
    }
  }
}
</script>
<style scoped>
  #background {
    /* background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); */
    background: rgb(255,250,0);
    background: linear-gradient(333deg, rgba(255,250,0,1) 0%, rgba(0,251,255,1) 50%, rgba(254,0,255,1) 100%);
  }

  p {
    margin-top: 3.5vh;
  }
</style>
