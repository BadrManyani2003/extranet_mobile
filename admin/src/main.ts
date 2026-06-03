import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { loadEnv } from './services/env'
import keycloakService from './services/keycloak'

async function bootstrap() {
  // 1. Charge les variables d'environnement dynamiques depuis le serveur
  await loadEnv()

  // 2. Initialise l'application Vue
  const app   = createApp(App)
  const pinia = createPinia()

  // 3. Initialise Keycloak et monte l'application
  keycloakService.init(() => {
    app.use(pinia)
    app.use(router)
    app.use(i18n)
    app.mount('#app')
  })
}

bootstrap()