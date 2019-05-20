<template>
  <div>Ready 2 Dance
    <v-btn @click="toggleRegisterModal">register</v-btn>
    <v-btn @click="toggleLoginModal">log in</v-btn>
    <v-layout row justify-center>
    <v-dialog v-model="registerModal" persistent max-width="600">
      <v-card
        flat
      >
      <v-card-text>
        <v-text-field v-model="username" label="Username*" required></v-text-field>
        <v-text-field v-model="email" label="Email*" required></v-text-field>
        <v-text-field v-model="password" label="Password*" type="password" required></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue"
          :loading="loading"
          @click="registerNewUser"
        >
          Continue
        </v-btn>
        <v-btn @click="toggleRegisterModal" flat>Cancel</v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loginModal" persistent max-width="600">
      <v-card>
        <v-card-text>
          <v-text-field v-model="email" label="Email*" required></v-text-field>
          <v-text-field v-model="password" label="Password*" type="password" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue"
            @click="logUserIn"
            :loading="loading"
          >
            Continue
          </v-btn>

          <v-btn @click="toggleLoginModal" flat>Cancel</v-btn>
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
      loading: false
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
      this.loading = true
      firebase.database.ref('users').once('value').then((value) => { // check for users in the database
        let users = value.val()
        if (users === null) { // if there are no users
          console.log(users)
          firebase.auth.createUserWithEmailAndPassword(this.email, this.password).then((result) => { // create new user
            console.log('created')
            firebase.database.ref(`users/${result.user.uid}`).set({ // set new user in the database
              username: this.username,
              type: 'user'
            }).then(() => {
              this.loading = false
              this.$store.commit('goToSongSelection')
            }).catch((err) => {
              this.loading = false
              console.log(err)
            })
          }).catch((err) => {
            this.loading = false
            console.log(err)
          })
        } else { // if there are users
          let taken = false
          for (let user in users) {
            if (users[user].username === this.username) {
              console.log('username taken')
              this.loading = false
              taken = true
              return
            }
          }
          if (!taken) {
            firebase.auth.createUserWithEmailAndPassword(this.email, this.password).then((result) => { // create new user
              console.log('created')
              firebase.database.ref(`users/${result.user.uid}`).set({ // set new user in the database
                username: this.username
              }).then(() => {
                this.$store.commit('goToSongSelection')
              }).catch((err) => {
                this.loading = false
                console.log(err)
              })
            }).catch((err) => {
              this.loading = false
              console.log(err)
            })
          }
        }
      })
    },
    logUserIn: function () {
      this.loading = true
      firebase.auth.signInWithEmailAndPassword(this.email, this.password).then((result) => {
        this.loading = false
        this.$store.commit('goToSongSelection')
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>
