<script setup lang="ts">
import { ShieldAlert, LogOut, Home } from 'lucide-vue-next'
import keycloak from '@/services/keycloak'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  keycloak.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Outfit']">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
      <div class="p-10 text-center">
        <h1 class="text-3xl font-black text-slate-900 mb-8 tracking-tight">{{ $t('restricted.title') }}</h1>
        
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
