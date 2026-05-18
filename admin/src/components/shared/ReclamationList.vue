<script setup lang="ts">
import { Calendar, MessageSquare, User } from 'lucide-vue-next'
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
  <ScrollArea class="flex-1">
    <div class="p-4">
      <div v-if="loading && reclamations.length === 0" class="flex flex-col items-center justify-center h-64 gap-4">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="reclamations.length === 0" class="flex flex-col items-center justify-center h-64 text-center p-12 opacity-50">
        <MessageSquare class="w-10 h-10 text-slate-200 mb-4" />
        <p class="text-xs font-black uppercase tracking-widest text-slate-400">Aucun résultat</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="rec in reclamations" :key="rec.id" 
          @click="emit('select', rec)"
          class="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-900/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <Badge :class="(rec.statut === 'En cours' || rec.statut === 'E') ? 'bg-orange-50 text-orange-600 border-orange-100' : (rec.statut === 'T' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100')" 
              class="rounded-lg px-2.5 py-1 text-[14px] font-black uppercase tracking-widest border shrink-0">
              {{ (rec.statut === 'E' || rec.statut === 'En cours') ? 'En cours' : (rec.statut === 'T' ? 'Traité' : 'Clôturé') }}
            </Badge>
            
            <div class="flex flex-col min-w-0">
              <h4 class="text-sm font-bold text-slate-900 truncate tracking-tight">
                {{ rec.sujet }}
              </h4>
              <p v-if="isAdmin" class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <User class="w-3 h-3" /> {{ rec.client }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-6 shrink-0 ml-4">
            <span class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5" /> 
              {{ new Date(rec.dateReclamation).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </ScrollArea>
</template>

<style scoped>
/* No animations used */
</style>

