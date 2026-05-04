<script setup lang="ts">
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: string
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const attrs = useAttrs()
</script>

<template>
  <textarea
    v-bind="attrs"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/5 focus-visible:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
        props.class
      )
    "
  />
</template>
