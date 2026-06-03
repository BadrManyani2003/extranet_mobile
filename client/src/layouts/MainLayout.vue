<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, AlertCircle, BarChart3, LifeBuoy, Shield } from 'lucide-vue-next'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import { useUserStore } from '../store/user'
import keycloak from '@/services/keycloak'

const router = useRouter()
const userStore = useUserStore()
const isMenuOpen = ref(false)
const hasAccess = ref(true)
const isLoading = ref(true)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.fetchUser()
    }
    
    if (!userStore.impersonatedUser && String(userStore.activeUser?.extranet).trim().toUpperCase() === 'N') {
      hasAccess.value = false
      router.push({ name: 'restricted' })
    }
  } catch (error) {
    console.error('Access check failed in MainLayout:', error)
  } finally {
    isLoading.value = false
  }
})

const navItems = computed(() => {
  const items: any[] = [
    { section: 'navigation.client' },
    { nom: 'navigation.policies', chemin: '/contrats', icone: Shield }
  ]

  // Relevé Global is only visible for Client and Expert, or in simulation mode
  if (keycloak.hasRole('client') || keycloak.hasRole('expert') || userStore.impersonatedUser) {
    items.push({ nom: 'navigation.global_statement', chemin: '/releve-global', icone: FileText })
  }

  // Dashboard and Reclamations are visible to all authorized roles
  items.push({ nom: 'navigation.dashboard', chemin: '/statistiques', icone: BarChart3 })
  
  if (String(userStore.activeUser?.reclamation || '').trim().toUpperCase() === 'O') {
    items.push({ nom: 'navigation.reclamation', chemin: '/reclamations', icone: LifeBuoy })
  }

  return items
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
  </div>
  <div v-else-if="hasAccess" class="min-h-screen bg-slate-50 flex font-['Outfit'] flex-col">
    <div v-if="userStore.impersonatedUser" class="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-4 z-50 font-semibold shadow-md">
      <span>Vous êtes actuellement en mode simulation : {{ userStore.activeUser?.nom || userStore.activeUser?.Nom || userStore.activeUser?.name || 'Utilisateur' }}</span>
      <button @click="userStore.stopImpersonation()" class="px-3 py-1 bg-amber-950 text-amber-50 rounded-lg text-sm hover:bg-amber-900 transition-colors">
        Quitter la simulation
      </button>
    </div>
    <div class="flex flex-1 min-h-0">
    <div 
      v-if="isMenuOpen" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
      @click="isMenuOpen = false"
    ></div>

    <Sidebar 
      :isSidebarOpen="isMenuOpen" 
      :navItems="navItems"
      @close="isMenuOpen = false"
      @toggle="toggleMenu"
    />

    <main class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <Header 
        :isSidebarOpen="isMenuOpen" 
        @toggle="toggleMenu"
      />

      <div class="flex-1 overflow-y-auto bg-slate-50/30">
        <div class="mx-auto py-10 px-6 sm:px-12 w-full">
          <router-view />
        </div>
      </div>
    </main>
    </div>
  </div>
</template>