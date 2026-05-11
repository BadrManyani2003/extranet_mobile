import { createApp } from 'vue'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

import keycloakService from './services/keycloak'

const app = createApp(App)

// Initialize Keycloak before attaching the router to prevent race conditions in guards
keycloakService.init(() => {
  app.use(router)
  app.use(i18n)
  
  app.mount('#app').$nextTick(() => {
    console.log('🚀 App mounted and authenticated');
  });
})