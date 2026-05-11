import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import UsersView from '../views/UsersView.vue'
import ClientsView from '../views/ClientsView.vue'
import AdherentsView from '../views/AdherentsView.vue'
import keycloak from '../services/keycloak'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/restricted',
      name: 'restricted',
      component: () => import('../views/RestrictedView.vue')
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/users'
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView
        },
        {
          path: 'clients',
          name: 'clients',
          component: ClientsView
        },
        {
          path: 'adherents',
          name: 'adherents',
          component: AdherentsView
        },
        {
          path: 'reclamations',
          name: 'reclamations',
          component: () => import('../views/ReclamationsView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (to.name === 'restricted') return true

  const authenticated = keycloak.getAuthenticated()
  const roles = keycloak.getRoles()
  const hasAdminRole = keycloak.hasRole('admincab') || keycloak.hasRole('comercialcab')
  
  console.log('🛡️ Router Guard Check:', {
    target: to.path,
    authenticated,
    roles,
    hasAdminRole
  })
  
  if (!hasAdminRole) {
    console.warn('⛔ Access denied, redirecting to restricted');
    return { name: 'restricted' }
  }
  
  return true
})

export default router