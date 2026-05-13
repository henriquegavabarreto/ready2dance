import * as firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

// firebase config
var config = {
  apiKey: 'AIzaSyBaptsqDSTShMb_SeHrk0A64JSq8vsiMAI',
  authDomain: 'parapara-game.firebaseapp.com',
  databaseURL: 'https://parapara-game.firebaseio.com',
  projectId: 'parapara-game',
  storageBucket: 'parapara-game.appspot.com',
  messagingSenderId: '503855722950'
}

// init firebase
firebase.initializeApp(config)

// export database and auth
export default {
  database: firebase.database(),
  auth: firebase.auth()
}
