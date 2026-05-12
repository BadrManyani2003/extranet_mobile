import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

import keycloakService from './services/keycloak'

const app = createApp(App)
const pinia = createPinia()

keycloakService.init(() => {
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})