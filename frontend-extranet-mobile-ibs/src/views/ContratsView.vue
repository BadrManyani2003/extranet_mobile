<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import ContratItem from '@/components/contrats/ContratItem.vue'
import { Accordion } from '@/components/ui/accordion'
import { api } from '@/lib/api'

const contrats = ref<any[]>([])
const recherchePrincipale = ref('')
const recherchesDetaillees = ref<Record<string, string>>({})
const chargementEnCours = ref(true)

onMounted(async () => {
  try {
    contrats.value = await api.data.getPolices()
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error)
  } finally {
    chargementEnCours.value = false
  }
})

const contratsFiltres = computed(() => {
  if (!recherchePrincipale.value) return contrats.value
  const requete = recherchePrincipale.value.toLowerCase()
  return contrats.value.filter(c => 
    c.numero.toLowerCase().includes(requete) || 
    c.branche.toLowerCase().includes(requete) || 
    c.client.toLowerCase().includes(requete)
  )
})

const obtenirBadgeStatut = (statut: string) => {
  switch (statut) {
    case 'Actif': return 'default'
    case 'Résilié': return 'destructive'
    case 'En cours': return 'secondary'
    case 'Clôturé': return 'outline'
    default: return 'outline'
  }
}

const gererMiseAJourRecherche = ({ policeId, onglet, requete }: any) => {
  recherchesDetaillees.value[`${policeId}-${onglet}`] = requete
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Outfit']">
    <PageHeader 
      :title="$t('contrats.title')"
      :description="$t('contrats.subtitle')"
      v-model="recherchePrincipale"
      :searchPlaceholder="$t('contrats.search_placeholder')"
    />

    <div class="w-full space-y-4 pb-12">
      <div v-if="chargementEnCours" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
      </div>
      
      <Accordion v-else type="single" collapsible class="space-y-4">
        <ContratItem 
          v-for="contrat in contratsFiltres" 
          :key="contrat.id" 
          :police="contrat"
          :getStatusBadge="obtenirBadgeStatut"
          :detailedSearchQueries="recherchesDetaillees"
          @update:searchQuery="gererMiseAJourRecherche"
        />
      </Accordion>

      <div v-if="!chargementEnCours && contratsFiltres.length === 0" class="p-12 text-center bg-white border border-dashed rounded-2xl">
        <p class="text-slate-500 font-medium">{{ $t('commun.no_results') }}</p>
      </div>
    </div>
  </div>
</template>
