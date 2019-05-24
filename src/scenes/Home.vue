<template>
  <div>
    <v-container>
      <v-layout row wrap align-center justify-center>
        <v-flex class="display-1 mb-2" xs12>
          Are You
        </v-flex>
        <v-flex class="display-4 mb-5" xs12>
          Ready 2 Dance
        </v-flex>
        <v-flex xs12>
          <v-btn large dark @click="toggleLoginModal">log in</v-btn>
        </v-flex>
        <v-flex xs12>
          <v-btn large dark @click="toggleRegisterModal">register</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
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
    }
  }
}
</script>
