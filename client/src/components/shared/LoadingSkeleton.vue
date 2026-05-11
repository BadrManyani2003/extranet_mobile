<script setup lang="ts">
defineProps<{
  count?: number
  height?: string
}>()
</script>

<template>
  <div class="space-y-4">
    <div 
      v-for="i in (count || 3)" 
      :key="i" 
      :class="['w-full bg-white border border-slate-200 rounded-3xl animate-pulse', height || 'h-32']"
    ></div>
  </div>
</template>