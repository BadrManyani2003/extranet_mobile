<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-slate-500 font-medium text-sm md:text-base">{{ subtitle }}</p>
      </div>
      <slot name="actions"></slot>
    </div>

    <div class="space-y-8">
      <slot></slot>
    </div>
  </div>
</template>
