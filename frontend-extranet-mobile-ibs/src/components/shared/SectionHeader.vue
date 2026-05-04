<script setup lang="ts">
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import SearchInput from './SearchInput.vue'

defineProps<{
  title: string
  description: string
  icon: any
  iconClass?: string
  searchModel?: string
  searchPlaceholder?: string
}>()

const emit = defineEmits(['update:searchModel'])
</script>

<template>
  <CardHeader class="bg-white/40 border-b border-slate-200/60 pb-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <CardTitle class="text-lg flex items-center gap-2">
          <component :is="icon" class="w-5 h-5" :class="iconClass" /> {{ title }}
        </CardTitle>
        <!-- <CardDescription>{{ description }}</CardDescription> -->
      </div>
      <div v-if="searchModel !== undefined" class="w-full md:w-64">
        <SearchInput 
          :modelValue="searchModel" 
          @update:modelValue="emit('update:searchModel', $event)"
          :placeholder="searchPlaceholder" 
        />
      </div>
    </div>
  </CardHeader>
</template>
