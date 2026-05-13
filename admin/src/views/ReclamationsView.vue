<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReclamationList from '@/components/shared/ReclamationList.vue'
import ReclamationChat from '@/components/shared/ReclamationChat.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-vue-next'

const reclamations = ref<any[]>([])
const selectedTicket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const loadingChat = ref(false)
const searchQuery = ref('')
const natureFilter = ref('all')
const currentUser = ref<any>(null)
const isDeleteDialogOpen = ref(false)
const messageToDeleteId = ref<number | null>(null)

let pollingInterval: any = null

const startPolling = () => {
  stopPolling()
  pollingInterval = setInterval(() => {
    if (selectedTicket.value && !loadingChat.value) {
      api.data.getMessages(selectedTicket.value.id).then(res => {
        messages.value = res
      }).catch(console.error)
    }
  }, 5000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

watch(selectedTicket, (newVal) => {
  if (newVal) startPolling()
  else stopPolling()
})

onUnmounted(stopPolling)

const fetchUserInfo = async () => {
  try {
    const res = await api.admin.getMe()
    currentUser.value = res
  } catch (e) { console.error(e) }
}

const fetchReclamations = async () => {
  loading.value = true
  try { reclamations.value = await api.admin.getReclamations() } 
  catch (e: any) { 
    toast.error(e.message || "Erreur lors de la récupération")
    console.error(e) 
  } 
  finally { loading.value = false }
}

const filteredReclamations = computed(() => {
  return reclamations.value.filter(r => {
    const matchesSearch = !searchQuery.value || 
      (r.sujet || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (r.client || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesNature = natureFilter.value === 'all' || r.nature === natureFilter.value
    
    return matchesSearch && matchesNature
  })
})

const selectTicket = async (ticket: any) => {
  selectedTicket.value = ticket
  loadingChat.value = true
  try { messages.value = await api.data.getMessages(ticket.id) } 
  catch (e: any) { 
    toast.error(e.message)
    console.error(e) 
  } 
  finally { loadingChat.value = false }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value) return
  
  // Mise à jour optimiste
  const tempMsg = {
    id: Date.now(),
    message: text,
    envoyeur: 'Conseiller IBS',
    nature: 'Admin',
    dateMessage: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  
  try { 
    await api.admin.replyToReclamation(selectedTicket.value.id, text)
    toast.success("Réponse envoyée")
    selectedTicket.value.statut = 'Traité'
    // Rafraîchir pour obtenir les données finales du serveur
    const freshMessages = await api.data.getMessages(selectedTicket.value.id)
    messages.value = freshMessages
  } catch (e: any) { 
    toast.error(e.message)
    // Supprimer le message optimiste en cas d'erreur
    messages.value = messages.value.filter(m => m.id !== tempMsg.id)
    console.error(e) 
  }
}

const handleStatusUpdate = async (statut: string) => {
  if (!selectedTicket.value) return
  try {
    await api.admin.updateStatus(selectedTicket.value.id, statut)
    selectedTicket.value.statut = statut === 'E' ? 'En cours' : (statut === 'T' ? 'Traité' : 'Clôturé')
    toast.success("Statut mis à jour")
  } catch (e: any) {
    toast.error(e.message)
  }
}

const handleDeleteMessage = (messageId: number) => {
  messageToDeleteId.value = messageId
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedTicket.value || !messageToDeleteId.value) return
  try {
    await api.admin.deleteMessage(messageToDeleteId.value, selectedTicket.value.id)
    messages.value = messages.value.filter(m => m.id !== messageToDeleteId.value)
    toast.success("Message supprimé")
    isDeleteDialogOpen.value = false
    messageToDeleteId.value = null
  } catch (e: any) {
    toast.error(e.message)
  }
}

onMounted(() => {
  fetchReclamations()
  fetchUserInfo()
})
</script>

<template>
  <div class="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden font-['Outfit']">
    <template v-if="!selectedTicket">
      <div class="p-8 border-b border-slate-100 bg-white space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Liste Réclamations</h2>
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
              <option value="S">Sinistres</option>
              <option value="C">Comptabilité</option>
              <option value="I">Demandes d'info</option>
              <option value="D">Correction de donnée</option>
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
            Client: {{ selectedTicket.client }} • Ticket #{{ selectedTicket.id }} • Ouvert le {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}
          </p>
        </div>
        <div class="flex gap-2">
          <Button v-if="selectedTicket.statut !== 'En cours' && selectedTicket.statut !== 'E'" size="sm" variant="outline" @click="handleStatusUpdate('E')" class="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[10px] uppercase tracking-wider">En cours</Button>
          <Button v-if="selectedTicket.statut !== 'Clôturé' && selectedTicket.statut !== 'C'" size="sm" variant="outline" @click="handleStatusUpdate('C')" class="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase tracking-wider">Clôturer</Button>
        </div>
      </div>

      <ReclamationChat 
        :messages="messages" 
        :loading="loadingChat" 
        :selected-ticket="selectedTicket" 
        :current-user-id="currentUser?.id" 
        selfNature="Admin"
        @send="handleSendMessage" 
        @delete-message="handleDeleteMessage" 
      />
    </template>

    <!-- Modal Confirmation Suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[400px] rounded-[2rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
        <DialogHeader class="p-8 bg-white text-center">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-8 h-8" />
          </div>
          <DialogTitle class="text-xl font-black text-slate-900 tracking-tight">Supprimer le message ?</DialogTitle>
          <DialogDescription class="text-slate-500 font-medium mt-2">
            Voulez-vous vraiment supprimer ce message ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="p-8 bg-slate-50/50 flex gap-3 sm:justify-center">
          <Button variant="ghost" @click="isDeleteDialogOpen = false" class="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-white">
            Annuler
          </Button>
          <Button @click="confirmDelete" class="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-100">
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>