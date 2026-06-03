<script setup lang="ts">
import { ShieldAlert, LogOut, Home } from 'lucide-vue-next'
import keycloakService from '../services/keycloak'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  keycloakService.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Outfit']">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
      <div class="p-10 text-center">
        <h1 class="text-3xl font-black text-slate-900 mb-8 tracking-tight">{{ $t('restricted.title') }}</h1>
        
        <div class="grid gap-4">
          <button 
            v-if="userStore.impersonatedUser"
            @click="userStore.stopImpersonation"
            class="flex items-center justify-center gap-3 w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-amber-100 hover:shadow-amber-200 group"
          >
            Quitter la simulation
          </button>
          
          <button 
            @click="handleLogout"
            class="flex items-center justify-center gap-3 w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-red-100 hover:shadow-red-200 group"
          >
            <LogOut class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {{ $t('restricted.logout') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>