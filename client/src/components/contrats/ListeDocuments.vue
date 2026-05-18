<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Download, Search } from 'lucide-vue-next'
import { CardContent } from '@/components/ui/card'
import SectionHeader from '@/components/shared/SectionHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const props = defineProps<{
  documents: any[]
  searchQuery: string
}>()

const emit = defineEmits(['update:searchQuery'])

const documentsFiltres = computed(() => {
  const requete = props.searchQuery.toLowerCase()
  if (!requete) return props.documents
  return props.documents.filter((d: any) => 
    d.libelle.toLowerCase().includes(requete)
  )
})

const handleDownload = (doc: any) => {
  // Simulation de téléchargement
  console.log('Téléchargement du document:', doc)
  alert(`Téléchargement de: ${doc.libelle}`)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <SectionHeader 
      :title="$t('contrats.documents')"
      :description="$t('contrats.desc_docs')"
      :icon="FileText"
      iconClass="text-slate-900"
      :searchModel="searchQuery"
      :searchPlaceholder="$t('contrats.search_docs')"
      @update:searchModel="emit('update:searchQuery', $event)"
    />
    
    <CardContent class="p-0 flex-1 overflow-hidden">
      <div v-if="documentsFiltres.length > 0" class="max-h-[350px] overflow-y-auto px-4 pb-8 pt-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div class="space-y-3">
          <div v-for="doc in documentsFiltres" :key="doc.id" 
            class="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:shadow-sm hover:border-slate-300"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                  <FileText class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-[14px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Document</p>
                  <p class="text-sm font-bold text-slate-900">{{ doc.libelle }}</p>
                </div>
              </div>

              <button 
                @click="handleDownload(doc)"
                class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md shadow-slate-200"
              >
                <Download class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <EmptyState 
        v-else 
        :icon="FileText"
        :description="searchQuery ? $t('commun.no_results') : $t('contrats.empty_docs')"
      />
    </CardContent>
  </div>
</template>


