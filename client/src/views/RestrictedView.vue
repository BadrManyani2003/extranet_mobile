<script setup lang="ts">
import { ShieldAlert, LogOut, Home } from 'lucide-vue-next'
import keycloakService from '../services/keycloak'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  keycloakService.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Outfit']">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
      <div class="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
      
      <div class="p-10 text-center">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-red-50 mb-8 text-red-500 shadow-inner">
          <ShieldAlert :size="56" stroke-width="1.5" />
        </div>
        
        <h1 class="text-3xl font-black text-slate-900 mb-4 tracking-tight">{{ $t('restricted.title') }}</h1>
        
        <p class="text-slate-500 mb-10 leading-relaxed font-medium">
          {{ $t('restricted.description') }}
        </p>

        <div class="grid gap-4">
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