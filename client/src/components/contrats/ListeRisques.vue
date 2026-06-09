<script setup lang="ts">
import { ref, computed } from 'vue'
import { Shield, HardHat, Car, HeartPulse } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import SectionHeader from '@/components/shared/SectionHeader.vue'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-vue-next'
import { formatDate, formatNumber } from '@/lib/utils'

const props = defineProps<{
  risques: any[]
  branche: string
  searchQuery: string
}>()

const emit = defineEmits(['update:searchQuery'])

const risqueSelectionne = ref<any>(null)
const estDialogueOuvert = ref(false)
const chargementDetails = ref(false)

const isSante = computed(() => !!(props.branche && props.branche.toLowerCase().includes('sant')))
const isAuto = computed(() => !!(props.branche && props.branche.toLowerCase().includes('auto')))
const isAT = computed(() => !!(props.branche && (props.branche.toLowerCase() === 'at' || props.branche.toLowerCase().includes('accident') || props.branche.toLowerCase().includes('travail'))))

const ouvrirDetails = async (risque: any) => {
  risqueSelectionne.value = risque
  estDialogueOuvert.value = true
  
  if (isSante.value && !risque.personnesACharge) {
    chargementDetails.value = true
    try {
      const data = await api.data.getPersACharge(risque.id)
      risque.personnesACharge = data || []
    } catch (e) {
      console.error("Erreur lors du chargement des personnes à charge:", e)
      risque.personnesACharge = []
    } finally {
      chargementDetails.value = false
    }
  } else if (!isSante.value && !risque.garanties) {
    chargementDetails.value = true
    try {
      const data = await api.data.getGaranties(risque.id)
      risque.garanties = data || []
    } catch (e) {
      console.error("Erreur lors du chargement des garanties:", e)
      risque.garanties = []
    } finally {
      chargementDetails.value = false
    }
  }
}


const nettoyerValeur = (val: any) => {
  if (typeof val === 'string') {
    return val.replace(/MAD|DH/gi, '').trim()
  }
  return val
}

const risquesFiltres = computed(() => {
  const term = props.searchQuery.toLowerCase().trim()
  if (!term) return props.risques
  return props.risques.filter((r: any) => 
    String(r.nom || '').toLowerCase().includes(term) ||
    String(r.marque || '').toLowerCase().includes(term) ||
    String(r.identifiant || '').toLowerCase().includes(term) ||
    String(r.numAdhesion || '').toLowerCase().includes(term)
  )
})

const iconeBranche = computed(() => {
  const b = (props.branche || '').toLowerCase()
  if (b.includes('auto')) return Car
  if (b.includes('sant')) return HeartPulse
  if (b.includes('chantier') || b.includes('tout risque')) return HardHat
  return Shield
})
</script>

<template>
  <div>
    <SectionHeader 
      :title="isSante ? ($t('risques.adherent') + 's') : (isAuto ? ($t('risques.vehicle') + 's') : $t('risques.title'))" 
      :description="$t('risques.subtitle')" 
      :icon="iconeBranche"
      iconClass="text-slate-900" 
      :searchModel="searchQuery" 
      :searchPlaceholder="$t('risques.search')"
      @update:searchModel="emit('update:searchQuery', $event)" 
    />

    <CardContent class="p-0">
      <div v-if="risquesFiltres.length > 0"
        class="max-h-[350px] overflow-y-auto border-b border-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
        <table class="w-full text-left border-collapse table-fixed sm:table-auto">
          <thead class="sticky top-0 bg-slate-50 z-10 shadow-sm">
            <tr class="border-b border-slate-200">
              <template v-if="isSante">
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.adherent') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.membership_num') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.membership_date') }}</th>
              </template>
              <template v-else-if="isAuto">
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.brand') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('sinistres.matricule') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.insured_name') }}</th>
              </template>
              <template v-else-if="isAT">
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.insured_name') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.id') }}</th>
              </template>
              <template v-else>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.guarantee') }}</th>
                <th class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.id') }}</th>
              </template>
              <th v-if="!isAT" class="px-6 py-3 text-[14px] font-bold text-slate-500 uppercase tracking-wider text-right w-24">
                {{ $t('commun.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(risque, idx) in risquesFiltres" :key="idx"
              class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              
              <template v-if="isSante">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.nom }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.numAdhesion || '-' }}</td>
                <td class="px-6 py-3 text-sm text-slate-500">{{ formatDate(risque.dateAdhesion) }}</td>
              </template>

              <template v-else-if="isAuto">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.marque || '-' }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.identifiant || '-' }}</td>
                <td class="px-6 py-3 text-sm text-slate-500 truncate">{{ risque.assure || '-' }}</td>
              </template>
              
              <template v-else-if="isAT">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.nom }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.identifiant || '-' }}</td>
              </template>
              
              <template v-else>
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">
                  <div class="flex flex-col">
                    <span>{{ risque.nom }} {{ risque.marque && risque.marque !== risque.nom ? ' - ' + risque.marque : '' }}</span>
                    <span v-if="risque.description && risque.description !== 'Risque'" class="text-[14px] text-slate-400 font-medium italic">{{ risque.description }}</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">
                  {{ risque.identifiant || '-' }}
                </td>
              </template>

              <td v-if="!isAT" class="px-6 py-3 text-right">
                <Button @click="ouvrirDetails(risque)" variant="outline" size="sm" class="font-bold h-7 text-[14px] px-2">
                  {{ isSante ? $t('risques.beneficiaries') : $t('contrats.detail_button') }}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center p-12 text-slate-500 italic">
        {{ isAT ? $t('contrats.ensemble_personnel') : $t('risques.empty') }}
      </div>
    </CardContent>

    <Dialog v-model:open="estDialogueOuvert">
      <DialogContent class="sm:max-w-[700px] bg-white p-6 shadow-xl border border-slate-200 font-['Outfit']">
        <DialogHeader class="border-b border-slate-100 pb-4 mb-4">
          <DialogTitle class="text-lg font-bold text-slate-900">
            {{ isSante ? $t('risques.beneficiaries') : $t('contrats.detail_button') }}
          </DialogTitle>
        </DialogHeader>

        <div v-if="risqueSelectionne">
          <div v-if="chargementDetails" class="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
            <p class="text-xs text-slate-500 font-medium tracking-widest uppercase italic">
              {{ isSante ? $t('risques.loading_members') : $t('risques.loading_details') }}
            </p>
          </div>

          <div v-else-if="risqueSelectionne.garanties">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.guarantee') }}</th>
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.capital') }}</th>
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.deductible') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="g in risqueSelectionne.garanties" :key="g.nom">
                  <td class="py-3 text-sm text-slate-700">{{ g.nom }}</td>
                  <td class="py-3 text-sm font-bold text-slate-900 text-right">{{ formatNumber(g.capital) }}</td>
                  <td class="py-3 text-sm text-slate-500 text-right">{{ (g.franchise && g.franchise != '0' && g.franchise != 0) ? formatNumber(g.franchise) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="isSante && risqueSelectionne.personnesACharge">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.name') }}</th>
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.relationship') }}</th>
                  <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.birth_date') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="p in risqueSelectionne.personnesACharge" :key="p.nom">
                  <td class="py-3 text-sm text-slate-700 font-bold">{{ p.nom }}</td>
                  <td class="py-3 text-sm text-slate-500 font-medium">{{ p.lien }}</td>
                  <td class="py-3 text-sm text-slate-500 text-right">{{ formatDate(p.dateNaissance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="py-4 text-center text-slate-400 text-sm italic">
            {{ $t('risques.no_details') }}
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button @click="estDialogueOuvert = false" variant="outline" class="font-bold">{{ $t('commun.close') }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

