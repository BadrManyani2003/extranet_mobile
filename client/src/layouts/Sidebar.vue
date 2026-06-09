<script setup lang="ts">
import { useRoute } from 'vue-router'
import { LayoutDashboard, X, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import keycloak from '@/services/keycloak'
import { useUserStore } from '@/store/user'

export interface NavItem {
  nom?: string
  chemin?: string
  icone?: any
  section?: string
}

const props = defineProps<{
  isSidebarOpen: boolean
  navItems: NavItem[]
}>()

const emit = defineEmits(['close', 'toggle'])
const route = useRoute()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.clearUser()
  keycloak.logout()
}

const handleItemClick = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    emit('close')
  }
}
</script>

<template>
  <aside :class="[
    'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-[0_20px_50px_rgba(14,165,233,0.04)] lg:shadow-none font-[\'Outfit\']',
    isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 lg:w-20 -translate-x-full lg:translate-x-0'
  ]">
    <div class="h-20 flex items-center justify-between border-b border-slate-100 bg-white shrink-0 transition-all duration-300" :class="isSidebarOpen ? 'px-6' : 'px-4'">
      <div class="flex items-center gap-3 transition-all duration-300" :class="{ 'mx-auto': !isSidebarOpen }">
        <div
          class="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 transform hover:scale-105 transition-transform">
          <LayoutDashboard class="w-5 h-5" />
        </div>
        <span v-if="isSidebarOpen"
          class="font-bold text-xl text-slate-900 tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
          MyAsk
        </span>
      </div>

      <Button variant="ghost" size="icon" @click="emit('close')"
        class="lg:hidden rounded-lg text-slate-400 hover:bg-slate-50">
        <X class="w-5 h-5" />
      </Button>
    </div>

    <nav class="flex-1 py-8 flex flex-col gap-2.5 overflow-y-auto scrollbar-none transition-all duration-300" :class="isSidebarOpen ? 'px-5' : 'px-3'">
      <template v-for="element in navItems" :key="element.chemin || element.section">
        <div v-if="element.section" class="transition-all duration-300" :class="isSidebarOpen ? 'px-4 py-3 mt-4 mb-1' : 'px-2 py-2 mt-2 mb-1'">
          <span v-if="isSidebarOpen" class="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em] animate-in fade-in duration-500">
            {{ element.section.includes('.') ? $t(element.section) : element.section }}
          </span>
          <div v-else class="h-px bg-slate-100 w-full"></div>
        </div>

        <router-link v-else :to="element.chemin!"
          @click="handleItemClick"
          class="flex items-center rounded-xl font-bold transition-all duration-200 group relative"
          active-class="bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
          :class="[
            route.path === element.chemin ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            isSidebarOpen ? 'gap-3 px-4 py-3 w-full' : 'justify-center w-11 h-11 mx-auto px-0'
          ]">
          <component :is="element.icone" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
          <span v-if="isSidebarOpen"
            class="tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
            {{ element.nom && element.nom.includes('.') ? $t(element.nom) : element.nom }}
          </span>
        </router-link>
      </template>
    </nav>

    <div class="border-t border-slate-100 bg-slate-50/50 transition-all duration-300" :class="isSidebarOpen ? 'p-5' : 'py-5 px-3'">
      <Button variant="ghost" @click="handleLogout"
        class="text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl font-bold transition-all group overflow-hidden"
        :class="isSidebarOpen ? 'w-full justify-start gap-3 px-4 py-6' : 'w-11 h-11 justify-center mx-auto p-0'">
        <LogOut class="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
        <span v-if="isSidebarOpen" class="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
          {{ $t('commun.logout') }}
        </span>
      </Button>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

