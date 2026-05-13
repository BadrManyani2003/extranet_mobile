<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Tag, Users, Shield, LifeBuoy, Wallet, AlertCircle, CheckCircle2, CreditCard, FileCheck, CalendarDays, Clock, Receipt, Building2 } from 'lucide-vue-next'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ListeRisques from './ListeRisques.vue'
import ListeSinistres from './ListeSinistres.vue'
import ListeQuittances from './ListeQuittances.vue'
import ListeDocuments from './ListeDocuments.vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { api } from '@/lib/api'

const { t } = useI18n()

const props = defineProps<{
  police: any
  getStatusBadge: (s: string) => any
  detailedSearchQueries: Record<string, string>
}>()

const emit = defineEmits(['update:searchQuery'])

const ongletActif = ref('')
const risques = ref<any[]>([])
const sinistres = ref<any[]>([])
const quittances = ref<any[]>([])
const documents = ref<any[]>([])
const stats = ref<any>({})
const chargementDetails = ref(false)

const chargerDonnees = async () => {
  if (chargementDetails.value) return
  chargementDetails.value = true
  try {
    const fetchRisques = props.police.branche === 'Santé' 
      ? api.data.getAdherents(props.police.id) 
      : api.data.getRisques(props.police.id)

    const [resRisques, resSinistres, resQuittances, resStats, resDocs] = await Promise.all([
      fetchRisques,
      api.data.getSinistres(props.police.id),
      api.data.getQuittances(props.police.id),
      api.data.getStatsByPolice(props.police.id),
      api.data.getDocuments(props.police.id)
    ])
    risques.value = resRisques || []
    sinistres.value = resSinistres || []
    quittances.value = resQuittances || []
    stats.value = resStats || {}
    documents.value = resDocs || []
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la police:', error)
  } finally {
    chargementDetails.value = false
  }
}

onMounted(() => {
  chargerDonnees()
})

const basculerOnglet = (onglet: string) => {
  ongletActif.value = ongletActif.value === onglet ? '' : onglet
}

const obtenirElementsGrille = (p: any) => [
  { id: 'numero', title: t('contrats.num'), type: 'static', value: p.police, icon: FileText, colorClass: 'bg-slate-100 text-slate-500' },
  { id: 'branche', title: t('contrats.branche'), type: 'static', value: p.branche, icon: Tag, colorClass: 'bg-slate-100 text-slate-900' },
  { id: 'echeance', title: t('contrats.echeance'), type: 'static', value: formatDate(p.dateEcheance), icon: CalendarDays, colorClass: 'bg-slate-50 text-slate-600' },
  { id: 'risque', title: p.branche === 'Automobile' ? (t('risques.vehicle') + 's') : (p.branche === 'Santé' ? (t('risques.adherent') + 's') : t('contrats.risques')), type: 'action', value: formatNumber(risques.value.length), icon: Shield, defaultColor: 'bg-slate-100 text-slate-800' },  
  { id: 'sinistres', title: t('contrats.sinistres'), type: 'action', value: formatNumber(sinistres.value.length), icon: LifeBuoy, defaultColor: 'bg-slate-100 text-slate-800' },
  { id: 'sinistres-encours', title: t('contrats.sinistres_encours'), type: 'action', value: formatNumber(sinistres.value.filter((s: any) => s.statut === 'En cours' || s.statut === 'E').length), icon: Clock, defaultColor: 'bg-slate-100 text-slate-800' },
  { id: 'prime', title: t('contrats.prime_annuelle'), type: 'action', value: formatCurrency(stats.value.primeAnnuelle || 0), icon: Wallet, defaultColor: 'bg-slate-200 text-slate-900' },
  { id: 'impayes', title: t('contrats.impayes'), type: 'action', value: formatCurrency(stats.value.impayes || 0), icon: Receipt, defaultColor: (stats.value.impayes || 0) > 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400', isRedAlert: (stats.value.impayes || 0) > 0 },
  { id: 'documents', title: t('contrats.documents'), type: 'action', value: formatNumber(documents.value.length), icon: FileText, defaultColor: 'bg-slate-100 text-slate-800' }
]

const gererMiseAJourRecherche = (onglet: string, requete: string) => {
  emit('update:searchQuery', { policeId: props.police.id, onglet, requete })
}
</script>

<template>
  <AccordionItem 
    :value="`police-${police.id}`"
    class="bg-white border border-slate-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)]"
  >
    <AccordionTrigger class="hover:no-underline px-5 py-5 transition-all group data-[state=open]:bg-slate-50/50">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-2 sm:pr-4 text-left gap-4">
        <div class="flex items-start sm:items-center gap-4">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/10 text-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
            <FileText class="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 class="font-bold text-slate-900 text-lg sm:text-xl tracking-tight truncate">{{ police.police }}</h3>
              <StatusBadge :status="police.statut" />
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span class="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md whitespace-nowrap"><Tag class="w-3.5 h-3.5" /> {{ police.branche }}</span>
              <span class="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md whitespace-nowrap"><Building2 class="w-3.5 h-3.5" /> {{ police.compagnie }}</span>
            </div>
          </div>
        </div>
      </div>
    </AccordionTrigger>
    
    <AccordionContent class="px-5 pb-5 pt-0 bg-slate-100/50">
      <div class="border-t border-slate-100 pt-5 mt-1">
        <div v-if="chargementDetails && risques.length === 0" class="py-12 flex flex-col items-center justify-center gap-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p class="text-sm text-slate-500 font-medium tracking-tight">{{ $t('commun.search') }}...</p>
        </div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <template v-for="item in obtenirElementsGrille(police)" :key="item.id">
              <div v-if="item.type === 'static' || item.type === 'badge'" class="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50/50">
                <div :class="`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${item.colorClass}`">
                  <component :is="item.icon" class="w-4.5 h-4.5" />
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ item.title }}</p>
                  <StatusBadge v-if="item.type === 'badge'" :status="item.value" />
                  <p v-else class="text-sm font-bold text-slate-800">{{ item.value }}</p>
                </div>
              </div>

              <button v-else-if="item.type === 'action'"
                @click="basculerOnglet(item.id)"
                class="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden"
                :class="[ongletActif === item.id ? `bg-white shadow-md border-slate-900/30 ring-1 ring-slate-900/10` : 'bg-white border-slate-200/60 hover:border-slate-900/40 hover:shadow-sm']"
              >
                <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                  :class="ongletActif === item.id ? (item.id === 'impayes' ? 'bg-slate-600 text-white shadow-lg shadow-slate-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-200') : `${item.defaultColor} group-hover:scale-110`">
                  <component :is="item.icon" class="w-4.5 h-4.5" />
                </div>
                <div class="flex-1">
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ item.title }}</p>
                  <p class="text-sm font-bold transition-colors" :class="ongletActif === item.id ? (item.id === 'impayes' ? 'text-slate-600' : 'text-slate-900') : (item.isRedAlert ? 'text-slate-900' : 'text-slate-800')">{{ item.value }}</p>
                </div>
              </button>
            </template>
          </div>

          <div v-if="ongletActif" class="mt-6 animate-in fade-in zoom-in-95 duration-300">
            <Card class="border-slate-300 shadow-xl bg-slate-200 overflow-hidden rounded-2xl ring-1 ring-slate-400/20">
              <ListeRisques 
                v-if="ongletActif === 'risque'" 
                :risques="risques" 
                :branche="police.branche"
                :searchQuery="detailedSearchQueries[`${police.id}-risque`] || ''"
                @update:searchQuery="gererMiseAJourRecherche('risque', $event)"
              />
              <ListeSinistres 
                v-else-if="ongletActif === 'sinistres' || ongletActif === 'sinistres-encours'" 
                :sinistres="sinistres"
                :risques="risques"
                :branche="police.branche"
                :activeTab="ongletActif"
                :getStatusBadge="getStatusBadge"
                :searchQuery="detailedSearchQueries[`${police.id}-${ongletActif}`] || ''"
                @update:searchQuery="gererMiseAJourRecherche(ongletActif, $event)"
              />
              <ListeQuittances 
                v-else-if="ongletActif === 'impayes'" 
                :quittances="quittances.filter((q: any) => q.montantImpaye > 0)"
                type="impayes"
                :title="$t('quittances.title_impayes')"
                :description="$t('quittances.desc_impayes')"
                :icon="CreditCard"
                iconColor="text-slate-600"
                :searchQuery="detailedSearchQueries[`${police.id}-impayes`] || ''"
                @update:searchQuery="gererMiseAJourRecherche('impayes', $event)"
              />
              <ListeQuittances 
                v-else-if="ongletActif === 'prime'" 
                :quittances="quittances"
                type="prime"
                :title="$t('quittances.title_prime')"
                :description="$t('quittances.desc_prime')"
                :icon="FileCheck"
                iconColor="text-slate-900"
                :searchQuery="detailedSearchQueries[`${police.id}-prime`] || ''"
                @update:searchQuery="gererMiseAJourRecherche('prime', $event)"
              />
              <ListeDocuments 
                v-else-if="ongletActif === 'documents'" 
                :documents="documents"
                :searchQuery="detailedSearchQueries[`${police.id}-documents`] || ''"
                @update:searchQuery="gererMiseAJourRecherche('documents', $event)"
              />
            </Card>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</template>