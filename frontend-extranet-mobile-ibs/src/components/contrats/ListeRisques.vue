<script setup lang="ts">
import { ref, computed } from 'vue'
import { Shield, Eye, Calendar, CreditCard, Users, Info, Building2, HardHat, Car, HeartPulse } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import SectionHeader from '@/components/shared/SectionHeader.vue'

const props = defineProps<{
  risques: any[]
  branche: string
  searchQuery: string
}>()

const emit = defineEmits(['update:searchQuery'])

const risqueSelectionne = ref<any>(null)
const estDialogueOuvert = ref(false)

const ouvrirDetails = (risque: any) => {
  risqueSelectionne.value = risque
  estDialogueOuvert.value = true
}

const formaterNombre = (val: any) => {
  if (typeof val === 'number') return val.toLocaleString('fr-FR').replace(/\u00A0/g, ' ')
  const chaineNumerique = String(val).replace(/[^0-9]/g, '')
  if (!chaineNumerique) return val
  return parseInt(chaineNumerique).toLocaleString('fr-FR').replace(/\u00A0/g, ' ')
}

const nettoyerValeur = (val: any) => {
  if (typeof val === 'string') {
    return val.replace(/MAD/gi, '').trim()
  }
  return val
}

const risquesFiltres = computed(() => {
  const requete = props.searchQuery.toLowerCase()
  if (!requete) return props.risques
  return props.risques.filter((r: any) =>
    (r.marque && r.marque.toLowerCase().includes(requete)) ||
    (r.immatriculation && r.immatriculation.toLowerCase().includes(requete)) ||
    (r.nom && r.nom.toLowerCase().includes(requete)) ||
    (r.numAdhesion && r.numAdhesion.toLowerCase().includes(requete)) ||
    (r.matricule && r.matricule.toLowerCase().includes(requete)) ||
    (r.adresse && r.adresse.toLowerCase().includes(requete))
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
              <!-- Colonnes Automobile -->
              <template v-if="branche === 'Automobile'">
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.brand') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.registration') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.circulation_date') }}</th>
              </template>

              <!-- Colonnes Santé -->
              <template v-else-if="branche === 'Santé'">
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.insured_name') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.membership_num') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.registration') }}</th>
              </template>

              <!-- Colonnes TRC -->
              <template v-else-if="branche === 'Tout Risque Chantier'">
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.project') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.id') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.type') }}</th>
              </template>

              <!-- Colonnes par défaut -->
              <template v-else>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.designation') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ $t('risques.type') }}</th>
                <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">-</th>
              </template>

              <th class="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-24">
                {{ $t('commun.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(risque, idx) in risquesFiltres" :key="idx"
              class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              <!-- Lignes Automobile -->
              <template v-if="branche === 'Automobile'">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.marque }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.immatriculation }}</td>
                <td class="px-6 py-3 text-sm text-slate-500">{{ risque.dateMiseEnCirculation }}</td>
              </template>

              <!-- Lignes Santé -->
              <template v-else-if="branche === 'Santé'">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.nom }}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">{{ risque.numAdhesion }}</td>
                <td class="px-6 py-3 text-sm text-slate-500 truncate">{{ risque.matricule }}</td>
              </template>

              <!-- Lignes TRC -->
              <template v-else-if="branche === 'Tout Risque Chantier'">
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">
                  <div class="flex items-center gap-2">
                    <Building2 v-if="risque.type === 'Chantier'" class="w-4 h-4 text-slate-400" />
                    <HardHat v-else class="w-4 h-4 text-slate-400" />
                    {{ risque.nom }}
                  </div>
                </td>
                <td class="px-6 py-3 text-sm font-medium text-slate-600 truncate">
                  {{ risque.type === 'Chantier' ? 'CASABLANCA' : risque.matricule }}
                </td>
                <td class="px-6 py-3">
                  <span
                    class="px-2 py-1 bg-slate-100 text-slate-800 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">{{
                    risque.type }}</span>
                </td>
              </template>

              <!-- Lignes par défaut -->
              <template v-else>
                <td class="px-6 py-3 text-sm font-bold text-slate-800 truncate">{{ risque.nom || risque.adresse || '-'
                  }}</td>
                <td class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{{ risque.type }}</td>
                <td class="px-6 py-3 text-sm text-slate-500">-</td>
              </template>

              <td class="px-6 py-3 text-right">
                <Button @click="ouvrirDetails(risque)" variant="outline" size="sm" class="font-bold h-7 text-[10px] px-2">
                  {{ branche === 'Automobile' ? $t('risques.guarantees') : (branche === 'Santé' ? $t('risques.beneficiaries') : $t('contrats.detail_button')) }}
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

    <!-- Dialogue simple et minimaliste -->
    <Dialog v-model:open="estDialogueOuvert">
      <DialogContent class="sm:max-w-[700px] bg-white p-6 shadow-xl border border-slate-200 font-['Outfit']">
        <DialogHeader class="border-b border-slate-100 pb-4 mb-4">
          <DialogTitle class="text-lg font-bold text-slate-900">
            {{ branche === 'Automobile' ? $t('risques.guarantees') : (branche === 'Santé' ? $t('risques.beneficiaries') : $t('contrats.detail_button')) }}
          </DialogTitle>
        </DialogHeader>

        <div v-if="risqueSelectionne">
          <!-- Garanties (Auto ou TRC) -->
          <div v-if="risqueSelectionne.garanties">
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
                  <td class="py-3 text-sm font-bold text-slate-900 text-right">{{ formaterNombre(g.capital) }}</td>
                  <td class="py-3 text-sm text-slate-500 text-right">{{ nettoyerValeur(g.franchise) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Santé Personnes -->
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
                  <td class="py-3 text-sm text-slate-500 text-right">{{ p.dateNaissance }}</td>
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
