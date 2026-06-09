<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative w-full">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <Input 
      :modelValue="modelValue" 
      @update:modelValue="emit('update:modelValue', $event)"
      :placeholder="placeholder || $t('commun.search')" 
      class="pl-10 pr-10 rounded-xl border-slate-200 focus:ring-slate-900/10 w-full"
    />
    <button 
      v-if="modelValue" 
      @click="emit('update:modelValue', '')" 
      class="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <X class="w-4 h-4 text-slate-400 hover:text-slate-600" />
    </button>
  </div>
</template>