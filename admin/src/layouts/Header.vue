<script setup lang="ts">
import { Menu, X, User, Languages, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import keycloak from '@/services/keycloak'
import { useUserStore } from '@/store/user'

const { locale } = useI18n()
const userStore = useUserStore()

defineProps<{
  isSidebarOpen: boolean
}>()

const emit = defineEmits(['toggle'])

const toggleLanguage = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}

const handleLogout = () => {
  userStore.clearUser()
  keycloak.logout()
}
</script>

<template>
  <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 font-['Outfit']">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="emit('toggle')" class="rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100">
        <Menu v-if="!isSidebarOpen" class="w-5 h-5" />
        <X v-else class="w-5 h-5" />
      </Button>
      <div class="lg:hidden font-bold text-lg text-slate-900 flex items-center gap-2">
        <span class="tracking-tight">Extra ibs</span>
      </div>
    </div>
    
    <div class="flex items-center gap-3 sm:gap-6">
      <button 
        @click="toggleLanguage"
        class="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all group"
      >
        <Languages class="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
        <span class="text-xs font-black uppercase tracking-widest text-slate-600">{{ locale }}</span>
      </button>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <span class="hidden sm:inline text-sm font-bold text-slate-700">{{ userStore.userName }}</span>
          <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-200">
            <User class="w-4 h-4" />
          </div>
        </div>
        
        <button 
          @click="handleLogout"
          class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200/50 group"
          title="Déconnexion"
        >
          <LogOut class="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  </header>
</template>