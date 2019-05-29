import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import store from './store'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.config.productionTip = false

Vue.use(Vuetify)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
