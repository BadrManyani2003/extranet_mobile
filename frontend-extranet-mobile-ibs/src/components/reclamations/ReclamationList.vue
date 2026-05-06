<script setup lang="ts">
import { Calendar, Clock, ChevronLeft, MessageSquare } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

defineProps<{
  reclamations: any[]
  loading: boolean
}>()

const emit = defineEmits(['select'])
</script>

<template>
  <ScrollArea class="flex-1 p-6">
    <div v-if="loading" class="p-4">
      <LoadingSkeleton :count="4" height="h-32" />
    </div>

    <EmptyState 
      v-else-if="reclamations.length === 0" 
      title="Aucune réclamation"
      description="Vous n'avez pas encore de demande en cours."
      :icon="MessageSquare"
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="rec in reclamations" :key="rec.id" 
        @click="emit('select', rec)"
        class="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer relative overflow-hidden"
      >
        <div class="flex items-start justify-between mb-4">
          <Badge :class="rec.statut === 'En cours' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'" 
            class="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border">
            {{ rec.statut }}
          </Badge>
          <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar class="w-3 h-3" /> {{ new Date(rec.date).toLocaleDateString() }}
          </span>
        </div>
        <h4 class="text-lg font-black text-slate-900 group-hover:text-slate-900 transition-colors mb-2 line-clamp-1">{{ rec.sujet }}</h4>
        <div class="flex items-center justify-between mt-6">
          <div class="flex items-center gap-2 text-slate-400 font-bold text-xs">
            <Clock class="w-4 h-4" /> {{ rec.count }} messages
          </div>
          <ChevronLeft class="w-5 h-5 text-slate-200 rotate-180 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  </ScrollArea>
</template>
