<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { Calendar, Clock, Info, Shield, Car, User, Wallet, FileText, Users, Upload, AlertCircle } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
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

// ─── Upload dialog state ─────────────────────────────────────────────────────
const uploadDialog  = ref(false)
const uploadSinistre = ref<any>(null)   // sinistre courant pour lequel on upload

const openUploadDialog = (sin: any) => {
  uploadSinistre.value = sin
  uploadDialog.value   = true
}
// ─── Existing logic ──────────────────────────────────────────────────────────

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
  const isOngoing = (s: any) => s.statut === 'En cours' || s.statut === 'E'
  const donnees = props.activeTab === 'sinistres-encours'
    ? props.sinistres.filter(isOngoing)
    : props.sinistres

  if (!requete) return donnees

  return donnees.filter((s: any) =>
    String(s.numero || '').toLowerCase().includes(requete) ||
    String(s.objet  || '').toLowerCase().includes(requete)
  )
})
const { t } = useI18n()

const checkIsSante = (sin: any) => {
  return !!((sin && sin.branche && sin.branche.toLowerCase().includes('sant')) ||
         (props.branche && props.branche.toLowerCase().includes('sant')))
}

const checkHasAdherent = (sin: any) => {
  return checkIsSante(sin)
}

const getLibelleRisque = (sin: any) => {
  if (checkIsSante(sin)) return t('risques.adherent')
  const b = (sin.branche || props.branche || '').toLowerCase()
  if (b.includes('auto')) return t('risques.vehicle')
  return t('sinistres.object')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <SectionHeader
      :title="$t('sinistres.title')"
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
                  <div v-if="checkHasAdherent(sin)" class="flex flex-col items-end gap-1">
                    <span class="text-xs font-bold text-slate-500">
                      {{ $t('risques.adherent') }} : <span class="font-black text-slate-900">{{ sin.objet }}</span>
                    </span>
                    <span v-if="sin.identifiant" class="text-xs font-bold text-slate-500">
                      {{ $t('risques.membership_num') }} : <span class="font-black text-slate-900">{{ sin.identifiant }}</span>
                    </span>
                  </div>
                  <div v-else class="flex flex-col items-end">
                    <span class="text-[14px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">{{ getLibelleRisque(sin) }}</span>
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
                     <Info class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.status_title') }}
                   </h4>
                   <div class="space-y-4">
                     <div>
                       <p class="text-[14px] font-bold text-slate-400 uppercase">{{ $t('contrats.statut') }}</p>
                       <StatusBadge :status="sin.statut" class="mt-1" />
                     </div>
                      <div>
                        <p class="text-[14px] font-bold text-slate-400 uppercase mb-1">{{ getLibelleRisque(sin) }}</p>
                        <div class="flex items-center gap-2 mt-1">
                          <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <component :is="checkHasAdherent(sin) ? User : Shield" class="w-4 h-4" />
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
                     <Wallet class="w-3.5 h-3.5 text-primary" /> {{ $t('sinistres.financial_title') }}
                   </h4>

                   <div class="space-y-4">
                     <div class="grid grid-cols-2 gap-4">
                       <div>
                         <p class="text-[14px] font-bold text-slate-400 uppercase">
                           {{ checkIsSante(sin) ? $t('sinistres.costs') : $t('sinistres.damages') }}
                         </p>
                         <p class="text-sm font-black text-slate-800">
                           {{ formatCurrency(checkIsSante(sin) ? sin.mtFrais : sin.mtDommage) }}
                         </p>
                       </div>
                       <div>
                         <p class="text-[14px] font-bold text-slate-400 uppercase">{{ $t('sinistres.franchise') }}</p>
                         <p class="text-sm font-black text-slate-800">{{ formatCurrency(sin.mtFranchise) }}</p>
                       </div>
                     </div>
                     <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <p class="text-[14px] font-black text-primary uppercase">{{ $t('sinistres.indemnite') }}</p>
                        <p class="text-lg font-black text-primary">{{ formatCurrency(sin.mtRembourse) }}</p>
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
