import { createRouter, createWebHistory } from 'vue-router'
import MainLayout   from '../layouts/MainLayout.vue'
import UsersView    from '../views/UsersView.vue'
import ClientsView  from '../views/ClientsView.vue'
import AdherentsView from '../views/AdherentsView.vue'
import keycloak     from '../services/keycloak'
import { useUserStore } from '../store/user'

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
        { path: '',              redirect: '/users' },
        { path: 'users',         name: 'users',         component: UsersView },
        { path: 'clients',       name: 'clients',       component: ClientsView },
        { path: 'adherents',     name: 'adherents',     component: AdherentsView },
        { path: 'reclamations',  name: 'reclamations',  component: () => import('../views/ReclamationsView.vue') },
        { path: 'documents',     name: 'documents',     component: () => import('../views/DocumentsView.vue') }
      ]
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.name === 'restricted') return true

  const hasAdminRole = keycloak.hasRole('admin_cabinet') || keycloak.hasRole('commercial_cabinet')

  if (!hasAdminRole) return { name: 'restricted' }

  const userStore = useUserStore()
  try {
    if (!userStore.user) await userStore.fetchUser()
  } catch (error) {
    console.error('Failed to fetch user in Admin Guard:', error)
  }

  return true
})

export default router