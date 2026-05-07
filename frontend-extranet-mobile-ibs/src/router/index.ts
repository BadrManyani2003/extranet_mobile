import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ContratsView from '../views/ContratsView.vue'
import ImpayesView from '../views/ImpayesView.vue'
import TableauBordView from '../views/TableauBordView.vue'
import ReclamationsView from '../views/ReclamationsView.vue'
import RestrictedView from '../views/RestrictedView.vue'
import { api } from '../lib/api'

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

let userCache: any = null

router.beforeEach(async (to) => {
  // Toujours autoriser la page de restriction
  if (to.name === 'restricted') return true

  try {
    if (!userCache) {
      console.log('Fetching user info...')
      const response = await api.data.getUserInfo()
      userCache = response.user
      console.log('User info received:', userCache)
    }

    // Vérification stricte : si Extranet est 'N', on redirige vers restricted
    if (String(userCache?.Extranet).trim().toUpperCase() === 'N') {
      console.warn('Access denied: Extranet = N')
      return { name: 'restricted' }
    }
    
    return true
  } catch (error) {
    console.error('Router Guard Error:', error)
    // En cas d'erreur de récupération des infos (ex: session expirée), 
    // on redirige vers restricted par sécurité
    return { name: 'restricted' }
  }
})

export default router
