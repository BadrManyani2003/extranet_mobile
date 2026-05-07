<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  title?: string
  description: string
  icon?: any
}>()
</script>

<template>
  <div class="p-20 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
    <div class="w-20 h-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
      <component :is="icon || AlertCircle" class="w-10 h-10" />
    </div>
    <h4 v-if="title" class="text-xl font-black text-slate-900 mb-2">{{ title }}</h4>
    <p class="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">{{ description }}</p>
  </div>
</template>