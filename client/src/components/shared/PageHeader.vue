<script setup lang="ts">
import { Printer } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SearchInput from '@/components/shared/SearchInput.vue'

defineProps<{
  title: string
  description: string
  modelValue: string
  searchPlaceholder: string
  showPrint?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'print'])
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
    <div class="space-y-1">
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">{{ title }}</h2>
      
    </div>
    <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
      <div class="w-full lg:w-80">
        <SearchInput 
          :modelValue="modelValue" 
          @update:modelValue="emit('update:modelValue', $event)" 
          :placeholder="searchPlaceholder" 
        />
      </div>
      <Button 
        v-if="showPrint"
        @click="emit('print')" 
        variant="outline" 
        class="h-12 px-6 rounded-xl font-bold bg-white border-slate-200 shadow-sm hover:bg-slate-50 flex items-center gap-2 shrink-0 w-full sm:w-auto"
      >
        <Printer class="w-5 h-5 text-slate-900" />
        <span>{{ $t('commun.print') }}</span>
      </Button>
    </div>
  </div>
</template>