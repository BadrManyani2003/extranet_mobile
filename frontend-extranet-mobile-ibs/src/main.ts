import { createApp } from 'vue'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

import { initKeycloak } from './services/keycloak'

const app = createApp(App)

initKeycloak(() => {
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})