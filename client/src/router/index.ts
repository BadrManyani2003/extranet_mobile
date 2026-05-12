import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ContratsView from '../views/ContratsView.vue'
import ImpayesView from '../views/ImpayesView.vue'
import TableauBordView from '../views/TableauBordView.vue'
import ReclamationsView from '../views/ReclamationsView.vue'
import RestrictedView from '../views/RestrictedView.vue'
import { useUserStore } from '../store/user'
import keycloak from '../services/keycloak'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/restricted',
      name: 'restricted',
      component: RestrictedView
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/contrats'
        },
        {
          path: 'contrats',
          name: 'contrats',
          component: ContratsView
        },
        {
          path: 'impayes',
          name: 'impayes',
          component: ImpayesView
        },
        {
          path: 'statistiques',
          name: 'statistiques',
          component: TableauBordView
        },
        {
          path: 'reclamations',
          name: 'reclamations',
          component: ReclamationsView
        }
      ]
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.name === 'restricted') return true

  // Check role first
  const isClient = keycloak.hasRole('client')
  if (!isClient) return { name: 'restricted' }

  const userStore = useUserStore()

  try {
    if (!userStore.user) {
      await userStore.fetchUser()
    }

    if (String(userStore.user?.extranet).trim().toUpperCase() === 'N') {
      return { name: 'restricted' }
    }
    
    return true
  } catch (error) {
    console.error('Router Guard Error:', error)
    return { name: 'restricted' }
  }
})

export default router