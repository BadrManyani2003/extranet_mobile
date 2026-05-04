import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ContratsView from '../views/ContratsView.vue'
import ImpayesView from '../views/ImpayesView.vue'
import TableauBordView from '../views/TableauBordView.vue'
import ReclamationsView from '../views/ReclamationsView.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
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

export default router
