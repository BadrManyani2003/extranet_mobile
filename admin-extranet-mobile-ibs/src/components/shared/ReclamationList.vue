<script setup lang="ts">
import { Calendar, Clock, ChevronLeft, MessageSquare, History } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

defineProps<{
  reclamations: any[]
  loading: boolean
  isAdmin?: boolean
}>()

const emit = defineEmits(['select'])
</script>

<template>
  <ScrollArea class="flex-1 p-6">
    <div v-if="loading" class="flex flex-col items-center justify-center h-64 gap-4">
      <History class="w-12 h-12 text-slate-100 animate-pulse" />
      <p class="text-xs font-black text-slate-300 uppercase tracking-widest">Chargement de vos demandes...</p>
    </div>
    <div v-else-if="reclamations.length === 0" class="flex flex-col items-center justify-center h-64 text-center p-12">
      <div class="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
        <MessageSquare class="w-10 h-10" />
      </div>
      <h3 class="text-xl font-black text-slate-900 mb-2">Aucune réclamation</h3>
      <p class="text-slate-500 font-medium max-w-xs mx-auto">Vous n'avez pas encore de demande en cours.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="rec in reclamations" :key="rec.id" 
        @click="emit('select', rec)"
        class="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer relative overflow-hidden"
      >
        <div class="flex items-start justify-between mb-2">
          <Badge :class="rec.statut === 'En cours' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'" 
            class="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border">
            {{ rec.statut }}
          </Badge>
          <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar class="w-3 h-3" /> {{ new Date(rec.date).toLocaleDateString() }}
          </span>
        </div>
        <div v-if="isAdmin" class="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 opacity-50">
          Client: {{ rec.client }}
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
