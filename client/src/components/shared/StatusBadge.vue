<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const props = defineProps<{
  status: string
}>()

const statusKey = computed(() => {
  const s = props.status.toLowerCase()
  if (s === 'en cours') return 'en_cours'
  if (s === 'en attente') return 'en_attente'
  return s
})

const translatedStatus = computed(() => {
  const key = `statuts.${statusKey.value}`
  return te(key) ? t(key) : props.status
})

const variant = computed(() => {
  const k = statusKey.value
  if (['actif', 'payée', 'réglée', 'clôturé', 'validé'].includes(k)) return 'default'
  if (['résilié', 'impayée', 'annulé', 'refusé'].includes(k)) return 'destructive'
  if (['en_cours', 'partiel', 'en_attente'].includes(k)) return 'secondary'
  return 'outline'
})

const colorClass = computed(() => {
  const k = statusKey.value
  if (['actif', 'payée', 'réglée', 'clôturé', 'validé'].includes(k)) return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
  if (['résilié', 'impayée', 'annulé', 'refusé'].includes(k)) return 'bg-slate-400 text-white hover:bg-slate-500'
  if (['en_cours', 'partiel', 'en_attente'].includes(k)) return 'bg-slate-200 text-slate-800 hover:bg-slate-300'
  return 'bg-slate-100 text-slate-600 hover:bg-slate-200'
})
</script>

<template>
  <Badge :class="['font-black px-3 py-1 rounded-lg text-[14px] uppercase tracking-widest shadow-sm border-0 transition-all duration-300', colorClass]">
    {{ translatedStatus }}
  </Badge>
</template>

