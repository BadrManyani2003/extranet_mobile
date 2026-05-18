<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Calendar, ArrowRight, CreditCard } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import SectionHeader from '@/components/shared/SectionHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { formatCurrency, formatDate } from '@/lib/utils'

const props = defineProps<{
  quittances: any[]
  searchQuery: string
  type: 'prime' | 'impayes'
  title: string
  description: string
  icon: any
  iconColor: string
}>()

const emit = defineEmits(['update:searchQuery'])

const quittancesFiltrees = computed(() => {
  const requete = props.searchQuery.toLowerCase()
  if (!requete) return props.quittances
  return props.quittances.filter((q: any) => 
    String(q.numero || '').toLowerCase().includes(requete)
  )
})
</script>

<template>
  <div class="flex flex-col h-full">
    <SectionHeader 
      :title="title"
      :description="description"
      :icon="icon"
      :iconClass="iconColor"
      :searchModel="searchQuery"
      :searchPlaceholder="$t('quittances.search')"
      @update:searchModel="emit('update:searchQuery', $event)"
    />
    
    <CardContent class="p-0 flex-1 overflow-hidden">
      <div v-if="quittancesFiltrees.length > 0" class="max-h-[350px] overflow-y-auto px-4 pb-8 pt-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div class="space-y-3">
          <div v-for="quit in quittancesFiltrees" :key="quit.numero" 
            class="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:shadow-sm hover:border-slate-300"
          >
            <div class="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
              
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <FileText class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[14px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ $t('quittances.num') }}</p>
                  <p class="text-sm font-black text-slate-900">{{ quit.numero }}</p>
                </div>
              </div>

              <div class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[14px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ $t('quittances.from') }}</p>
                  <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Calendar class="w-3.5 h-3.5 text-slate-300" />
                    {{ formatDate(quit.dateDebut) }}
                  </div>
                </div>
                <div>
                  <p class="text-[14px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ $t('quittances.to') }}</p>
                  <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ArrowRight class="w-3.5 h-3.5 text-slate-300" />
                    {{ formatDate(quit.dateFin) }}
                  </div>
                </div>
              </div>

              <div class="md:text-right">
                <p class="text-[14px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ $t('quittances.total') }}</p>
                <p class="text-sm font-black text-slate-900">{{ formatCurrency(quit.montantTotal) }}</p>
              </div>

              <div class="flex items-center justify-end gap-4">
                <div class="text-right">
                  <p class="text-[14px] font-bold uppercase tracking-widest leading-none mb-1 text-slate-400">{{ $t('quittances.unpaid') }}</p>
                  <p class="text-sm font-black" :class="quit.montantImpaye > 0 ? 'text-slate-900 underline' : 'text-slate-900'">
                    {{ formatCurrency(quit.montantImpaye) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EmptyState 
        v-else 
        :icon="type === 'impayes' ? CreditCard : undefined"
        :title="searchQuery ? undefined : (type === 'impayes' ? $t('quittances.empty_unpaid_title') : undefined)"
        :description="searchQuery ? $t('commun.no_results') : (type === 'impayes' ? $t('quittances.empty_unpaid_desc') : $t('quittances.empty_all'))"
      />
    </CardContent>
  </div>
</template>

