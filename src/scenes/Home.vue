<template>
  <div>
    <v-container fluid justify-center align-center id="background">
      <v-layout row wrap align-center justify-center>
        <v-flex class="display-1 font-weight-thin mb-2 mt-5 text-xs-center" xs12>
          Get
        </v-flex>
        <v-flex class="display-4 font-weight-medium mb-5 text-xs-center" xs12>
          Ready 2 Dance
        </v-flex>
        <v-flex class="text-xs-center mt-5" xs12>
          <v-btn large dark @click="toggleLoginModal">log in</v-btn>
        </v-flex>
        <v-flex class="text-xs-center mt-3" xs12>
          <v-btn large dark @click="toggleRegisterModal">register</v-btn>
        </v-flex>
        <v-flex class="text-xs-center mt-3" xs12>
          <v-btn large dark @click="enterAsGuest">Enter as Guest</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer color="blue darken-1">
      <h2 class="ml-5">⬇⬇⬇⬇⬇</h2>
      <v-spacer></v-spacer>
      <h2>What is this about?</h2>
      <v-spacer></v-spacer>
      <h2 class="mr-5">⬇⬇⬇⬇⬇</h2>
    </v-footer>
    <v-container fluid id="about">
      <v-card>
        <v-card-title class="black white--text title" primary-title>
          What is "Ready 2 Dance"?
        </v-card-title>
        <v-card-text class="subheading blue-grey lighten-5">
          <p>Ready 2 Dance is an online rhythm dance game based on the japanese synchronized dance <a target="_blank" href="https://en.wikipedia.org/wiki/Para_Para">ParaPara</a> (<a target="_blank" href="https://ja.wikipedia.org/wiki/%E3%83%91%E3%83%A9%E3%83%91%E3%83%A9">パラパラ</a>).</p>
          <p>The website uses your webcam to check how accurate are your moves compared to the dance routine. If you have your hands in the correct place and at the correct time, you score points!</p>
          <p>Right now we have {{numberOfSongs}} routines available for playing! And this number will continue to grow!</p>
          <p>You can play this game in any Operational System, preferably using Google Chrome's latest version. No need to install anything else.</p>
          <p>No streaming of your webcam leaves the browser. No servers involved on this. =) All the movement checking happens in your own computer using <a target="_blank" href="https://www.npmjs.com/package/@tensorflow-models/posenet">PoseNet</a>.</p>
          <h4>Therefore...</h4>
          <p>Your hardware can affect the gameplay, so make sure to use hardware acceleration on Chrome's settings and allow this website do use your webcam.</p>
          <p>The better your camera and your GPU, the better the movement detection can be, you just need to change that in the settings.</p>
          <p>I hope you all enjoy my little experiment!</p>
          <br>
          <p class="text-sm-right">Created using Vue.js, Vuetify, Tensorflow's PoseNet, pixi.js and the youtube API by <a target="blank" href="https://github.com/henriquegavabarreto/">Henrique Barreto</a>.</p>
        </v-card-text>
      </v-card>
    </v-container>
    <v-footer class="blue darken-1">
      <v-spacer></v-spacer>
      <div class="mr-3">
        © 2019, READY2DANCE
      </div>
    </v-footer>
    <v-layout row justify-center>
    <v-dialog v-model="registerModal" persistent max-width="600">
      <v-card
        flat
      >
      <v-toolbar dark color="black">
        <v-toolbar-title>Register</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p v-if="error">
          <b>Error:</b>
          <ul>
            <li class="red--text">{{ error }}</li>
          </ul>
        </p>
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
    <v-dialog v-model="loginModal" persistent max-width="600">
      <v-card>
        <v-toolbar dark color="black">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <p v-if="error">
            <b>Error:</b>
            <ul>
              <li>{{ error }}</li>
            </ul>
          </p>
          <v-text-field v-model="email" label="Email*" required></v-text-field>
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
      error: null,
      usernameRules: [ v => (!!/^[a-z0-9_-]/g.test(v) && v.length > 3 && v.length < 17) || 'Alphanumeric lowercase only. Can include _ and – having a length of 4 to 16 characters.' ],
      emailRules: [ v => !!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g.test(v) || 'Enter a valid e-mail address.' ],
      passwordRules: [ v => v.length > 5 || 'The password must be at least 6 characters long.' ]
    }
  },
  methods: {
    toggleRegisterModal: function () {
      this.registerModal = !this.registerModal
    },
    toggleLoginModal: function () {
      this.loginModal = !this.loginModal
    },
    registerNewUser: function () {
      if (this.$refs.register.validate()) {
        this.loading = true
        firebase.database.ref('users').once('value').then((value) => { // check for users in the database
          let users = value.val()
          if (users === null) { // if there are no users
            firebase.auth.createUserWithEmailAndPassword(this.email, this.password).then((result) => { // create new user
              let user = {
                username: this.username,
                type: 'user'
              }
              firebase.database.ref(`users/${result.user.uid}`).set(user).then(() => {
                this.loading = false
                this.$store.commit('changeUser', user)
                this.$store.commit('goToSongSelection')
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
          } else { // if there are users
            let taken = false
            for (let user in users) {
              if (users[user].username === this.username) {
                this.loading = false
                this.error = 'Username not available, please choose another one.'
                taken = true
                return
              }
            }
            if (!taken) {
              firebase.auth.createUserWithEmailAndPassword(this.email, this.password).then((result) => { // create new user
                let user = { // set new user in the database
                  username: this.username,
                  type: 'user'
                }
                firebase.database.ref(`users/${result.user.uid}`).set(user).then(() => {
                  this.$store.commit('changeUser', user)
                  this.$store.commit('goToSongSelection')
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
            }
          }
        })
      }
    },
    logUserIn: function () {
      this.loading = true
      firebase.auth.signInWithEmailAndPassword(this.email, this.password).then((result) => {
        firebase.database.ref(`users/${result.user.uid}`).once('value').then((value) => {
          this.$store.commit('changeUser', value.val())
          this.loading = false
          this.$store.commit('goToSongSelection')
        })
      }).catch((err) => {
        this.error = err.message
        this.loading = false
        console.log(err)
      })
    },
    enterAsGuest: function () {
      this.loading = true
      firebase.auth.signInAnonymously().then(() => {
        this.loading = false
        this.$store.commit('changeUser', null)
        this.$store.commit('goToSongSelection')
      }).catch((err) => { console.log(err) })
    }
  },
  computed: {
    numberOfSongs: function () {
      if (this.$store.state.songs) {
        return Object.keys(this.$store.state.songs).length
      } else {
        return '?'
      }
    }
  }
}
</script>
<style scoped>
  #background {
    /* background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); */
    background: rgb(255,250,0);
    background: linear-gradient(333deg, rgba(255,250,0,1) 0%, rgba(0,251,255,1) 50%, rgba(254,0,255,1) 100%);
    height: 96vh;
  }

  #about {
    /* background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%); */
    background: rgb(255,250,0);
    background: linear-gradient(-153deg, rgba(255,250,0,1) 0%, rgba(0,251,255,1) 50%, rgba(254,0,255,1) 100%);
    height: 92vh;
  }
  p {
    margin-top: 30px;
  }
  h4 {
    margin-top: 30px;
  }
</style>
