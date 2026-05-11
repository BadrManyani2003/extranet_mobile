<script setup lang="ts">
import { ref } from 'vue'
import { Users, Building2, UserCircle, LifeBuoy } from 'lucide-vue-next'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const isMenuOpen = ref(false)
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }

const navItems = [
  { section: 'ADMINISTRATION' },
  { nom: 'Utilisateurs', chemin: '/users', icone: Users },
  { nom: 'Clients', chemin: '/clients', icone: Building2 },
  { nom: 'Adhérents', chemin: '/adherents', icone: UserCircle },
  { section: 'SUPPORT' },
  { nom: 'Réclamations', chemin: '/reclamations', icone: LifeBuoy },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-['Outfit']">
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
        <div class="mx-auto py-6 px-4 sm:px-8 w-full">
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>