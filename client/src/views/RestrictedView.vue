<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Outfit']">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
      <div class="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
      
      <div class="p-8 sm:p-10 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 mb-6 text-red-500">
          <ShieldAlert :size="48" stroke-width="1.5" />
        </div>
        
        <h1 class="text-2xl font-bold text-slate-900 mb-3">{{ $t('restricted.title') }}</h1>
        <p class="text-slate-500 mb-8 leading-relaxed">
          {{ $t('restricted.description') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>