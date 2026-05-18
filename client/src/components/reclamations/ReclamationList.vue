<script setup lang="ts">
import { Calendar, MessageSquare } from 'lucide-vue-next'
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
  <ScrollArea class="flex-1">
    <div class="p-4">
      <div v-if="loading" class="space-y-4">
        <LoadingSkeleton :count="6" height="h-20" class="rounded-xl" />
      </div>

      <EmptyState 
        v-else-if="reclamations.length === 0" 
        :title="$t('reclamations.empty_title')"
        :description="$t('reclamations.empty_desc')"
        :icon="MessageSquare"
      />

      <div v-else class="space-y-3">
        <div v-for="rec in reclamations" :key="rec.id" 
          @click="emit('select', rec)"
          class="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-900/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <Badge :class="(rec.statut === 'En cours' || rec.statut === 'E') ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'" 
              class="rounded-lg px-2.5 py-1 text-[14px] font-black uppercase tracking-widest border shrink-0">
              {{ (rec.statut === 'E' || rec.statut === 'En cours') ? 'En cours' : 'Clôturé' }}
            </Badge>
            
            <h4 class="text-sm font-bold text-slate-900 truncate tracking-tight">
              {{ rec.sujet }}
            </h4>
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

