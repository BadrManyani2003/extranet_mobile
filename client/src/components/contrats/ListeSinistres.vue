<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, Calendar, Clock, Info, Shield, Car, User, Wallet, FileText } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import SectionHeader from '@/components/shared/SectionHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { formatCurrency, formatDate } from '@/lib/utils'

const props = defineProps<{
  sinistres: any[]
  risques: any[]
  branche: string
  activeTab: string
  searchQuery: string
}>()

const emit = defineEmits(['update:searchQuery'])

const obtenirInfoRisque = (sin: any) => {
  if (!props.risques) return null
  return props.risques.find(r => 
    r.immatriculation === sin.objet || 
    r.marque === sin.objet || 
    r.nom === sin.objet ||
    r.matricule === sin.objet ||
    r.identifiant === sin.objet
  )
}

const sinistresFiltres = computed(() => {
  const requete = props.searchQuery.toLowerCase()
  const donnees = props.activeTab === 'sinistres-encours' 
    ? props.sinistres.filter(s => s.statut === 'En cours')
    : props.sinistres

  if (!requete) return donnees
  
  return donnees.filter((s: any) => 
    String(s.numero || '').toLowerCase().includes(requete) || 
    String(s.objet || '').toLowerCase().includes(requete)
  )
})
const { t } = useI18n()

const libelleRisque = computed(() => {
  if (props.branche === 'Automobile') return t('risques.vehicle')
  if (props.branche === 'Santé') return t('risques.adherent')
  return t('sinistres.object')
})
</script>

<template>
  <div class="flex flex-col h-full">
    <SectionHeader 
      :title="$t('sinistres.title')"
      :description="activeTab === 'sinistres-encours' ? $t('sinistres.desc_ongoing') : $t('sinistres.desc_all')"
      :icon="activeTab === 'sinistres-encours' ? Clock : AlertCircle"
      :iconClass="activeTab === 'sinistres-encours' ? 'text-slate-600' : 'text-slate-900'"
      :searchModel="searchQuery"
      :searchPlaceholder="$t('sinistres.search')"
      @update:searchModel="emit('update:searchQuery', $event)"
    />
    
    <CardContent class="p-0 flex-1 overflow-hidden">
      <div v-if="sinistresFiltres.length > 0" class="max-h-[350px] overflow-y-auto px-4 pb-8 pt-2 scrollbar-thin scrollbar-thumb-slate-200">
        <Accordion type="single" collapsible class="w-full space-y-3 pt-4">
          <AccordionItem 
            v-for="sin in sinistresFiltres" 
            :key="sin.numero" 
            :value="sin.numero"
            class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger class="px-5 py-4 hover:no-underline group">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Shield class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-slate-900 flex items-center gap-2">
                      {{ sin.numero }}
                    </div>
                    <div class="text-[14px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <Calendar class="w-3 h-3" />
                      {{ $t('sinistres.declared_on') }} {{ formatDate(sin.date) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-8 pr-4">
                  <div class="flex flex-col items-end">
                    <span class="text-[14px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">{{ libelleRisque }}</span>
                    <span class="text-xs font-black text-slate-900 truncate max-w-[150px]">{{ sin.objet }}</span>
                    <span v-if="sin.identifiant" class="text-[14px] text-slate-500 font-bold mt-0.5">{{ sin.identifiant }}</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent class="px-6 pb-6 pt-2 border-t border-slate-200 bg-white/60">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                
                <div class="bg-white/60 p-4 rounded-2xl border border-slate-200/60 flex flex-col gap-3">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Info class="w-3.5 h-3.5 text-slate-900" /> {{ $t('sinistres.status_title') }}
                   </h4>
                   <div class="space-y-4">
                     <div>
                       <p class="text-[14px] font-bold text-slate-400 uppercase">{{ $t('contrats.statut') }}</p>
                       <StatusBadge :status="sin.statut" class="mt-1" />
                     </div>
                      <div>
                        <p class="text-[14px] font-bold text-slate-400 uppercase mb-1">{{ libelleRisque }}</p>
                        <div class="flex items-center gap-2 mt-1">
                          <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <component :is="branche === 'Santé' ? User : Shield" class="w-4 h-4" />
                          </div>
                          <div>
                            <p class="text-xs font-black text-slate-800">{{ sin.objet }}</p>
                            <p v-if="sin.identifiant" class="text-[14px] text-slate-400 font-bold">{{ sin.identifiant }}</p>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div class="bg-white/60 p-4 rounded-2xl border border-slate-200/60 flex flex-col gap-3">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Wallet class="w-3.5 h-3.5 text-slate-900" /> {{ $t('sinistres.financial_title') }}
                   </h4>

                   <div class="space-y-4">
                     <div class="grid grid-cols-2 gap-4">
                       <div>
                         <p class="text-[14px] font-bold text-slate-400 uppercase">
                           {{ branche === 'Santé' ? $t('sinistres.costs') : $t('sinistres.damages') }}
                         </p>
                         <p class="text-sm font-black text-slate-800">
                           {{ formatCurrency(branche === 'Santé' ? sin.mtFrais : sin.mtDommage) }}
                         </p>
                       </div>
                       <div>
                         <p class="text-[14px] font-bold text-slate-400 uppercase">{{ $t('sinistres.franchise') }}</p>
                         <p class="text-sm font-black text-slate-800">{{ formatCurrency(sin.mtFranchise) }}</p>
                       </div>
                     </div>
                     <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
                       <p class="text-[14px] font-black text-slate-900 uppercase">{{ $t('sinistres.indemnite') }}</p>
                       <p class="text-lg font-black text-slate-900">{{ formatCurrency(sin.mtRembourse) }}</p>
                     </div>
                   </div>
                </div>

                <div class="bg-white/60 p-4 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText class="w-3.5 h-3.5 text-slate-400" /> {{ $t('sinistres.expert_notes') }}
                   </h4>
                   <p class="text-xs text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3 py-1">
                     {{ sin.observation || $t('sinistres.no_obs') }}
                   </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <EmptyState 
        v-else 
        :title="searchQuery ? undefined : $t('sinistres.empty')"
        :description="searchQuery ? $t('commun.no_results') : $t('sinistres.empty')"
      />
    </CardContent>
  </div>
</template>

