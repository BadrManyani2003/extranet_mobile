<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageContainer from '@/components/shared/PageContainer.vue'
import ContratItem from '@/components/contrats/ContratItem.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { Input } from '@/components/ui/input'
import { Accordion } from '@/components/ui/accordion'
import { Search } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'

const { data: contrats, loading: chargementEnCours, execute: fetchContrats } = useFetch(api.data.getPolices)
const search = ref('')
const detailedSearchQueries = ref<Record<string, string>>({})

const filteredContrats = computed(() => {
  if (!contrats.value) return []
  if (!search.value) return contrats.value
  const q = search.value.toLowerCase()
  return (contrats.value as any[]).filter((c: any) => 
    (c.police || '').toLowerCase().includes(q) || 
    (c.branche || '').toLowerCase().includes(q)
  )
})

const getStatusBadge = (statut: string) => {
  return statut === 'Actif' ? 'default' : 'outline'
}

onMounted(fetchContrats)
</script>

<template>
  <PageContainer title="Mes Contrats" subtitle="Consultez l'ensemble de vos polices d'assurance.">
    <template #actions>
      <div class="relative w-full max-w-xs hidden md:block">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input v-model="search" placeholder="Rechercher un contrat..." class="pl-10 h-11 rounded-xl bg-white border-none shadow-sm font-bold text-sm" />
      </div>
    </template>

    <div class="space-y-4">
      <div class="md:hidden relative w-full mb-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input v-model="search" placeholder="Rechercher..." class="pl-10 h-11 rounded-xl bg-white border-none shadow-sm font-bold text-sm" />
      </div>

      <LoadingSkeleton v-if="chargementEnCours" :count="4" height="h-24" class="rounded-2xl" />
      
      <Accordion v-else-if="filteredContrats.length > 0" type="single" collapsible class="space-y-4">
        <ContratItem 
          v-for="contrat in filteredContrats" 
          :key="contrat.id" 
          :police="contrat"
          :getStatusBadge="getStatusBadge"
          :detailedSearchQueries="detailedSearchQueries"
        />
      </Accordion>

      <EmptyState v-else description="Aucun contrat trouvé" class="bg-white rounded-[2rem] border-none shadow-sm" />
    </div>
  </PageContainer>
</template>