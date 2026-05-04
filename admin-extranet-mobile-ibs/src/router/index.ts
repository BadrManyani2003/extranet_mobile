import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import UsersView from '../views/UsersView.vue'
import ClientsView from '../views/ClientsView.vue'
import AdherentsView from '../views/AdherentsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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

export default router
