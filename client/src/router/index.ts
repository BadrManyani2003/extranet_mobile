import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { useUserStore } from '../store/user'
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
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      beforeEnter: () => {
        if (keycloak.hasRole('admin_cabinet') || keycloak.hasRole('commercial_cabinet')) {
          return true
        }
        return { name: 'restricted' }
      }
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
          component: () => import('../views/ContratsView.vue')
        },
        {
          path: 'releve-global',
          name: 'releve-global',
          component: () => import('../views/ReleveGlobalView.vue'),
          meta: {
            roles: ['client', 'expert'],
            allowSimulation: true
          }
        },
        {
          path: 'statistiques',
          name: 'statistiques',
          component: () => import('../views/TableauBordView.vue')
        },
        {
          path: 'reclamations',
          name: 'reclamations',
          component: () => import('../views/ReclamationsView.vue'),
          meta: {
            requiresReclamation: true
          }
        }
      ]
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.name === 'restricted') return true

  const userStore = useUserStore()

  // 1. Contrôle général de l'accès à la plateforme
  const hasAccess = keycloak.hasRole('client') || 
                    keycloak.hasRole('adherent') || 
                    keycloak.hasRole('expert') || 
                    keycloak.hasRole('admin_cabinet') || 
                    keycloak.hasRole('commercial_cabinet')
  
  if (!hasAccess) return { name: 'restricted' }

  try {
    // 2. Chargement des données utilisateur si non présentes
    if (!userStore.user) {
      await userStore.fetchUser()
    }

    const isAdmin = keycloak.hasRole('admin_cabinet') || keycloak.hasRole('commercial_cabinet')
    const isSimulating = !!userStore.impersonatedUser

    // 3. Gestion de la redirection des administrateurs hors simulation
    if (isAdmin && !isSimulating && (to.name === 'contrats' || to.path === '/')) {
      return { name: 'admin-users' }
    }

    // 4. Contrôle d'accès basé sur les rôles de la route (meta.roles)
    if (to.meta.roles) {
      const allowedRoles = to.meta.roles as string[]
      const hasRouteRole = allowedRoles.some(role => keycloak.hasRole(role))
      const bypassForSimulation = to.meta.allowSimulation && isSimulating

      if (!hasRouteRole && !bypassForSimulation) {
        return { name: 'restricted' }
      }
    }

    // 5. Contrôle de l'accès extranet de l'utilisateur actif
    if (!isSimulating && String(userStore.activeUser?.extranet).trim().toUpperCase() === 'N') {
      return { name: 'restricted' }
    }

    // 6. Contrôle d'accès spécifique aux réclamations
    if (to.meta.requiresReclamation) {
      const hasReclamation = String(userStore.activeUser?.reclamation || '').trim().toUpperCase() === 'O'
      if (!hasReclamation) {
        return { name: 'contrats' }
      }
    }
    
    return true
  } catch (error) {
    console.error('Router Guard Error:', error)
    return { name: 'restricted' }
  }
})

export default router