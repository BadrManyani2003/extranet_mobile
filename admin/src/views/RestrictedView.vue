<script setup lang="ts">
import { ShieldAlert, Home } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import keycloak from '@/services/keycloak'

const router = useRouter()

const handleLogout = () => {
  keycloak.logout({ redirectUri: window.location.origin })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Outfit']">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200 text-center border border-slate-100">
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <ShieldAlert class="w-12 h-12 text-red-500" />
      </div>
      
      <h1 class="text-3xl font-black text-slate-900 mb-4">Accès Restreint</h1>
      
      <p class="text-slate-500 font-medium mb-10 leading-relaxed">
        Désolé, votre compte ne dispose pas des permissions nécessaires pour accéder à l'interface d'administration.
      </p>

      <div class="space-y-4">
        <Button @click="handleLogout" variant="destructive" class="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-red-100">
          Changer de compte
        </Button>
        
        <Button @click="router.push('/')" variant="ghost" class="w-full h-14 rounded-2xl font-black text-slate-500 gap-2">
          <Home class="w-5 h-5" /> Retour à l'accueil
        </Button>
      </div>

      <div class="mt-12 pt-12 border-t border-slate-50">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          AssurPlus Security Protocol v2.1
        </p>
      </div>
    </div>
  </div>
</template>
