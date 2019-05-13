import * as firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

var config = {
  apiKey: 'AIzaSyBaptsqDSTShMb_SeHrk0A64JSq8vsiMAI',
  authDomain: 'parapara-game.firebaseapp.com',
  databaseURL: 'https://parapara-game.firebaseio.com',
  projectId: 'parapara-game',
  storageBucket: 'parapara-game.appspot.com',
  messagingSenderId: '503855722950'
}

firebase.initializeApp(config)

export default {
  database: firebase.database(),
  auth: firebase.auth()
}
