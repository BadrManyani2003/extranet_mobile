<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import ContratItem from '@/components/contrats/ContratItem.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { Accordion } from '@/components/ui/accordion'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'

const { data: contrats, loading: chargementEnCours, execute: fetchContrats } = useFetch(api.data.getPolices)
const recherchePrincipale = ref('')
const recherchesDetaillees = ref<Record<string, string>>({})

onMounted(() => {
  fetchContrats()
})

const contratsFiltres = computed(() => {
  if (!contrats.value) return []
  if (!recherchePrincipale.value) return contrats.value
  const requete = recherchePrincipale.value.toLowerCase()
  return contrats.value.filter((c: any) => 
    (c.Police || '').toLowerCase().includes(requete) || 
    (c.Branche || '').toLowerCase().includes(requete) || 
    (c.Client || '').toLowerCase().includes(requete)
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
      <LoadingSkeleton v-if="chargementEnCours" :count="3" height="h-24" />
      
      <Accordion v-else-if="contratsFiltres.length > 0" type="single" collapsible class="space-y-4">
        <ContratItem 
          v-for="contrat in contratsFiltres" 
          :key="contrat.Id" 
          :police="contrat"
          :getStatusBadge="obtenirBadgeStatut"
          :detailedSearchQueries="recherchesDetaillees"
          @update:searchQuery="gererMiseAJourRecherche"
        />
      </Accordion>

      <EmptyState 
        v-else 
        :description="$t('commun.no_results')" 
        class="bg-white border border-dashed rounded-3xl"
      />
    </div>
  </div>
</template>
