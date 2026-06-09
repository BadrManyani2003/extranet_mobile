<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { AlertCircle, Calendar, Clock, Info, Shield, Wallet, FileText, User, MapPin, Activity, ShieldAlert, Upload } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import SectionHeader from '@/components/shared/SectionHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import UploadDocumentDialog from '@/components/shared/UploadDocumentDialog.vue'
import { formatCurrency, formatDate } from '@/lib/utils'

const props = defineProps<{
  sinistres: any[]
  risques: any[]
  branche: string
  activeTab: string
  searchQuery: string
}>()

const userStore = useUserStore()

const emit = defineEmits(['update:searchQuery'])

const activeSubTabs = ref<Record<string, string>>({})

// ─── Upload dialog state ─────────────────────────────────────────────────────
const uploadDialog  = ref(false)
const uploadSinistre = ref<any>(null)

const openUploadDialog = (sin: any) => {
  uploadSinistre.value = sin
  uploadDialog.value   = true
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

</script>

<template>
  <div class="flex flex-col h-full">
    <SectionHeader 
      :title="$t('sinistres.title') + ' AT'"
      :description="activeTab === 'sinistres-encours' ? $t('sinistres.desc_ongoing') : $t('sinistres.desc_all')"
      :icon="activeTab === 'sinistres-encours' ? Clock : AlertCircle"
      :iconClass="activeTab === 'sinistres-encours' ? 'text-slate-600' : 'text-primary'"
      :searchModel="searchQuery"
      :searchPlaceholder="$t('sinistres.search')"
      @update:searchModel="emit('update:searchQuery', $event)"
    />
    
    <CardContent class="p-0 flex-1 overflow-hidden">
      <div v-if="sinistresFiltres.length > 0" class="max-h-[650px] overflow-y-auto px-4 pb-8 pt-2 scrollbar-thin scrollbar-thumb-slate-200">
        <Accordion type="single" collapsible class="w-full space-y-3 pt-4">
          <AccordionItem 
            v-for="sin in sinistresFiltres" 
            :key="sin.numero" 
            :value="String(sin.numero)"
            class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger class="px-5 py-4 hover:no-underline group">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-xs font-bold text-slate-500">
                      {{ $t('risques.victime') }} : <span class="font-black text-slate-900">{{ sin.objet }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent class="px-6 pb-6 pt-2 border-t border-slate-200 bg-white/60">
              <!-- Tab Header -->
              <div class="flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-3 mt-4">
                <button
                  v-for="tab in ['accident', 'lesions', 'incapacites', 'finances']"
                  :key="tab"
                  @click="activeSubTabs[sin.numero] = tab"
                  class="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border shadow-sm"
                  :class="[
                    (activeSubTabs[sin.numero] || 'accident') === tab
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50 hover:text-slate-700'
                  ]"
                >
                  <component
                    :is="tab === 'accident' ? Info : (tab === 'lesions' ? ShieldAlert : (tab === 'incapacites' ? Activity : Wallet))"
                    class="w-3.5 h-3.5"
                  />
                  <span>
                    {{ 
                      tab === 'accident' ? $t('sinistres.status_title') : 
                      (tab === 'lesions' ? $t('sinistres.lesions') : 
                      (tab === 'incapacites' ? $t('sinistres.incapacities') : $t('sinistres.financial_title'))) 
                    }}
                  </span>
                </button>
              </div>

              <!-- Tab Contents -->
              <div class="mt-4">
                <!-- Tab: Accident Details -->
                <div v-if="(activeSubTabs[sin.numero] || 'accident') === 'accident'" class="bg-white/60 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-3 animate-in fade-in duration-200">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Info class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.status_title') }}
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('contrats.statut') }}</span>
                       <StatusBadge :status="sin.statut" />
                     </div>
                     <div v-if="sin.refSinistre" class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.ref_sinistre') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ sin.refSinistre }}</span>
                     </div>
                     <div v-if="sin.dateSinistre" class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.date_sinistre') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ formatDate(sin.dateSinistre) }}</span>
                     </div>
                     <div v-if="sin.lieu" class="flex justify-between items-center py-1.5 border-b border-slate-100/60 gap-4">
                       <span class="text-xs font-bold text-slate-400 uppercase shrink-0">{{ $t('sinistres.lieu') }}</span>
                       <span class="text-xs font-black text-slate-800 text-right break-words">{{ sin.lieu }}</span>
                     </div>
                     <div v-if="sin.typeSinistre" class="flex justify-between items-center py-1.5 border-b border-slate-100/60 gap-4">
                       <span class="text-xs font-bold text-slate-400 uppercase shrink-0">{{ $t('sinistres.type_sinistre') }}</span>
                       <span class="text-xs font-black text-slate-800 text-right break-words">{{ sin.typeSinistre }}</span>
                     </div>
                     <div v-if="sin.etape" class="flex justify-between items-center py-1.5 border-b border-slate-100/60 gap-4">
                       <span class="text-xs font-bold text-slate-400 uppercase shrink-0">{{ $t('sinistres.etape') }}</span>
                       <span class="text-xs font-black text-slate-800 text-right break-words">{{ sin.etape }}</span>
                     </div>
                   </div>
                </div>

                <!-- Tab: Injuries & Circumstances -->
                <div v-if="activeSubTabs[sin.numero] === 'lesions'" class="bg-white/60 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-3 animate-in fade-in duration-200">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <ShieldAlert class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.circonstances') }} / {{ $t('sinistres.lesions') }}
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <p class="text-xs font-bold text-slate-400 uppercase mb-1.5">{{ $t('sinistres.lesion') }}</p>
                       <p class="text-xs font-black text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[80px] break-words">{{ sin.lesion || '-' }}</p>
                     </div>
                     <div>
                       <p class="text-xs font-bold text-slate-400 uppercase mb-1.5">{{ $t('sinistres.circonstances') }}</p>
                       <p class="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed min-h-[80px] break-words">{{ sin.circonstances || '-' }}</p>
                     </div>
                   </div>
                </div>

                <!-- Tab: Disabilities -->
                <div v-if="activeSubTabs[sin.numero] === 'incapacites'" class="bg-white/60 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-3 animate-in fade-in duration-200">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Activity class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.disability_rates') }}
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.itt') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ sin.itt || '-' }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.ipp_estime') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ sin.ippEstime != null ? sin.ippEstime + ' %' : '-' }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.ipp_traitant') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ sin.ippTraitant != null ? sin.ippTraitant + ' %' : '-' }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.ipp_conseil') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ sin.ippConseil != null ? sin.ippConseil + ' %' : '-' }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.ipp_retenu') }}</span>
                       <span class="text-xs font-black text-primary">{{ sin.ippRetenu != null ? sin.ippRetenu + ' %' : '-' }}</span>
                     </div>
                   </div>
                </div>

                <!-- Tab: Financials -->
                <div v-if="activeSubTabs[sin.numero] === 'finances'" class="bg-white/60 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-3 animate-in fade-in duration-200">
                   <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Wallet class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.financial_title') }}
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.frais_medicaux') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ formatCurrency(sin.fraisMedicaux || 0) }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.frais_transport') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ formatCurrency(sin.fraisTransport || 0) }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.indem_jrn') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ formatCurrency(sin.indemJrn || 0) }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5">
                       <span class="text-xs font-bold text-primary uppercase">{{ $t('sinistres.reimbursed') }}</span>
                       <span class="text-sm font-black text-primary">{{ formatCurrency(sin.mtRembourse || 0) }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60 gap-4">
                       <span class="text-xs font-bold text-slate-400 uppercase shrink-0">{{ $t('sinistres.nature_indem') }}</span>
                       <span class="text-xs font-black text-slate-800 text-right break-words">{{ sin.natureIndem || '-' }}</span>
                     </div>
                     <div class="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                       <span class="text-xs font-bold text-slate-400 uppercase">{{ $t('sinistres.montant_indem') }}</span>
                       <span class="text-xs font-black text-slate-800">{{ formatCurrency(sin.montantIndem || 0) }}</span>
                     </div>
                     
                   </div>
                </div>
              </div>

              <!-- Expert Notes -->
              <div v-if="sin.observation" class="mt-4 bg-white/60 p-4 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
                 <h4 class="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <FileText class="w-3.5 h-3.5 text-slate-400" /> {{ $t('sinistres.expert_notes') }}
                 </h4>
                 <p class="text-xs text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3 py-1">
                   {{ sin.observation }}
                 </p>
              </div>
              <!-- ── Bouton Charger un document ────────────────────────────── -->
              <div v-if="!userStore.impersonatedUser" class="mt-5 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  class="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60 font-bold transition-all"
                  @click.stop="openUploadDialog(sin)"
                >
                  <Upload class="w-4 h-4" />
                  {{ $t('sinistres.upload_doc_btn') }}
                </Button>
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
  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- Dialog : Chargement de document                                         -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <UploadDocumentDialog
    :open="uploadDialog"
    :sinistre="uploadSinistre"
    @close="uploadDialog = false"
  />
</template>
