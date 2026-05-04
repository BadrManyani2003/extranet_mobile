<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReclamationList from '@/components/shared/ReclamationList.vue'
import ReclamationChat from '@/components/shared/ReclamationChat.vue'
import { api } from '@/lib/api'

const reclamations = ref<any[]>([])
const selectedTicket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const natureFilter = ref('all')

const fetchReclamations = async () => {
  loading.value = true
  try { reclamations.value = await api.admin.getReclamations() } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const filteredReclamations = computed(() => {
  return reclamations.value.filter(r => {
    const matchesSearch = !searchQuery.value || 
      r.sujet.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.client.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesNature = natureFilter.value === 'all' || r.nature === natureFilter.value
    
    return matchesSearch && matchesNature
  })
})

const selectTicket = async (ticket: any) => {
  selectedTicket.value = ticket
  loading.value = true
  try { messages.value = await api.data.getMessages(ticket.id) } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value) return
  messages.value.push({
    id: Date.now(),
    text,
    sender: 'admin',
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  try { 
    await api.admin.replyToReclamation(selectedTicket.value.id, text)
    selectedTicket.value.statut = 'Traité'
  } catch (e) { console.error(e) }
}

onMounted(fetchReclamations)
</script>

<template>
  <div class="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden font-['Outfit']">
    <template v-if="!selectedTicket">
      <div class="p-8 border-b border-slate-100 bg-white space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Gestion des Réclamations</h2>
            <p class="text-sm font-medium text-slate-500">Consultez et répondez aux demandes d'assistance des clients.</p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Rechercher par sujet ou client..." 
              class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
            />
          </div>
          <div class="w-full md:w-64">
            <select 
              v-model="natureFilter"
              class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
            >
              <option value="all">Toutes les natures</option>
              <option value="R">Réclamations</option>
              <option value="D">Demandes d'info</option>
              <option value="S">Sinistres</option>
            </select>
          </div>
        </div>
      </div>

      <ReclamationList :reclamations="filteredReclamations" :loading="loading" :is-admin="true" @select="selectTicket" />
    </template>

    <template v-else>
      <div class="p-6 border-b border-slate-100 flex items-center gap-6 bg-white">
        <Button variant="ghost" size="icon" @click="selectedTicket = null" class="rounded-2xl h-12 w-12 hover:bg-slate-50">
          <ChevronLeft class="w-6 h-6 text-slate-900" />
        </Button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-black text-slate-900 line-clamp-1">{{ selectedTicket.sujet }}</h2>
            <Badge :class="selectedTicket.statut === 'En cours' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'" 
              class="rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none">
              {{ selectedTicket.statut }}
            </Badge>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Client: {{ selectedTicket.client }} • Ticket #{{ selectedTicket.id }} • Ouvert le {{ new Date(selectedTicket.date).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <ReclamationChat :messages="messages" :loading="loading" :selected-ticket="selectedTicket" @send="handleSendMessage" />
    </template>
  </div>
</template>
