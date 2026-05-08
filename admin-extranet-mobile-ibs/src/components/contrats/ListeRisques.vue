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

const ouvrirDetails = async (risque: any) => {
  risqueSelectionne.value = risque
  estDialogueOuvert.value = true
  
  if (props.branche === 'Santé' && !risque.personnesACharge) {
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
  }
}


const nettoyerValeur = (val: any) => {
  if (typeof val === 'string') {
    return val.replace(/MAD/gi, '').trim()
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
  switch (props.branche) {
    case 'Automobile': return Car
    case 'Santé': return HeartPulse
    case 'Tout Risque Chantier': return HardHat
    default: return Shield
  }
})
</script>

<template>
  <div>
    <SectionHeader 
      :title="$t('risques.title')" 
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
              <template v-if="branche === 'Santé'">
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.adherent') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.membership_num') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.birth_date') }}</th>
              </template>
              <template v-else>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.designation') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.id') }}</th>
              </template>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-24">
                {{ $t('commun.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(risque, idx) in risquesFiltres" :key="idx"
              class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              
              <template v-if="branche === 'Santé'">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.nom }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.numAdhesion || '-' }}</td>
                <td class="px-6 py-3 text-sm text-slate-500">{{ formatDate(risque.dateNaissance) }}</td>
              </template>

              <template v-else>
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">
                  <div class="flex flex-col">
                    <span>{{ risque.nom }} {{ risque.marque && risque.marque !== risque.nom ? ' - ' + risque.marque : '' }}</span>
                    <span v-if="risque.description && risque.description !== 'Risque'" class="text-[10px] text-slate-400 font-medium italic">{{ risque.description }}</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">
                  {{ risque.identifiant || '-' }}
                </td>
              </template>

              <td class="px-6 py-3 text-right">
                <Button @click="ouvrirDetails(risque)" variant="outline" size="sm" class="font-bold h-7 text-[10px] px-2">
                  {{ branche === 'Santé' ? $t('risques.beneficiaries') : $t('contrats.detail_button') }}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center p-12 text-slate-500 italic">
        {{ $t('risques.empty') }}
      </div>
    </CardContent>

    <Dialog v-model:open="estDialogueOuvert">
      <DialogContent class="sm:max-w-[700px] bg-white p-6 shadow-xl border border-slate-200 font-['Outfit']">
        <DialogHeader class="border-b border-slate-100 pb-4 mb-4">
          <DialogTitle class="text-lg font-bold text-slate-900">
            {{ branche === 'Santé' ? $t('risques.beneficiaries') : $t('contrats.detail_button') }}
          </DialogTitle>
        </DialogHeader>

        <div v-if="risqueSelectionne">
          <div v-if="chargementDetails" class="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
            <p class="text-xs text-slate-500 font-medium tracking-widest uppercase italic">Chargement des membres...</p>
          </div>

          <div v-else-if="risqueSelectionne.garanties">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase">{{ $t('risques.guarantee') }}</th>
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.capital') }}</th>
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.deductible') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="g in risqueSelectionne.garanties" :key="g.nom">
                  <td class="py-3 text-sm text-slate-700">{{ g.nom }}</td>
                  <td class="py-3 text-sm font-bold text-slate-900 text-right">{{ formatNumber(g.capital) }}</td>
                  <td class="py-3 text-sm text-slate-500 text-right">{{ nettoyerValeur(g.franchise) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="branche === 'Santé' && risqueSelectionne.personnesACharge">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase">{{ $t('risques.name') }}</th>
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase">{{ $t('risques.relationship') }}</th>
                  <th class="py-2 text-[10px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.birth_date') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="p in risqueSelectionne.personnesACharge" :key="p.nom">
                  <td class="py-3 text-sm text-slate-700">{{ p.nom }}</td>
                  <td class="py-3 text-sm text-slate-500">{{ p.lien }}</td>
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