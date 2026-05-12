<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Plus, ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ReclamationList from '@/components/reclamations/ReclamationList.vue'
import ReclamationChat from '@/components/reclamations/ReclamationChat.vue'
import PageContainer from '@/components/shared/PageContainer.vue'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'
import { toast } from '@/components/ui/sonner'

const { data: reclamations, loading: loadingList, execute: fetchReclamations } = useFetch(api.data.getReclamations)
const { data: messages, loading: loadingChat, execute: fetchMessages } = useFetch(api.data.getMessages)

const selectedTicket = ref<any>(null)
const isNewDialogOpen = ref(false)
const newTicket = ref({ sujet: '', nature: 'R', message: '' })
const currentUser = ref<any>(null)

let pollingInterval: any = null

const startPolling = () => {
  stopPolling()
  pollingInterval = setInterval(() => {
    if (selectedTicket.value && !loadingChat.value) {
      api.data.getMessages(selectedTicket.value.id).then(res => { messages.value = res }).catch(console.error)
    }
  }, 5000)
}

const stopPolling = () => { if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; } }
watch(selectedTicket, (v) => { v ? startPolling() : stopPolling() })
onUnmounted(stopPolling)

const fetchUserInfo = async () => {
  try { const res = await api.data.getUserInfo(); currentUser.value = res.user; } catch (e) { console.error(e) }
}

const selectTicket = async (ticket: any) => {
  selectedTicket.value = ticket
  await fetchMessages(ticket.id)
}

const handleCreateTicket = async () => {
  if (!newTicket.value.sujet || !newTicket.value.message) return
  try {
    const res = await api.data.createReclamation(newTicket.value)
    toast.success("Demande envoyée")
    isNewDialogOpen.value = false
    newTicket.value = { sujet: '', nature: 'R', message: '' }
    const updated = await fetchReclamations()
    const created = (updated as any[])?.find(r => r.id === res.id)
    if (created) selectTicket(created)
  } catch (e: any) { toast.error(e.message) }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value || !messages.value) return
  try {
    await api.data.sendMessage(selectedTicket.value.id, { message: text, nature: 'C' })
    await fetchMessages(selectedTicket.value.id)
  } catch (e: any) { toast.error(e.message) }
}

onMounted(() => { fetchReclamations(); fetchUserInfo(); })
</script>

<template>
  <PageContainer title="Réclamations" subtitle="Suivez vos demandes et communiquez avec nos conseillers.">
    <template #actions>
      <Button v-if="!selectedTicket" @click="isNewDialogOpen = true" class="premium-button bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-100 gap-2 px-6 h-12">
        <Plus class="w-5 h-5" />
        Nouvelle demande
      </Button>
    </template>

    <div class="h-[calc(100vh-16rem)] flex flex-col glass-card border-slate-100">
      <template v-if="!selectedTicket">
        <ReclamationList :reclamations="reclamations || []" :loading="loadingList" @select="selectTicket" />
      </template>

      <template v-else>
        <div class="p-6 md:p-8 border-b border-slate-50 flex items-center gap-6 bg-white sticky top-0 z-10">
          <Button variant="ghost" size="icon" @click="selectedTicket = null" class="rounded-xl h-10 w-10 hover:bg-slate-50">
            <ChevronLeft class="w-6 h-6 text-slate-900" />
          </Button>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-black text-slate-900 line-clamp-1 tracking-tight">{{ selectedTicket.sujet }}</h2>
              <Badge :class="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E') ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'" 
                class="status-badge px-2.5 py-1">
                {{ (selectedTicket.statut === 'E' || selectedTicket.statut === 'En cours') ? 'En cours' : 'Clôturé' }}
              </Badge>
            </div>
            <p class="table-header-text mt-1 flex items-center gap-2">
              <span>Ticket #{{ selectedTicket.id }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-200"></span>
              <span>Ouvert le {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}</span>
            </p>
          </div>
        </div>

        <ReclamationChat 
          :messages="messages || []" 
          :loading="loadingChat" 
          :selected-ticket="selectedTicket" 
          :current-user-id="currentUser?.id"
          selfNature="Client"
          @send="handleSendMessage"
        />
      </template>
    </div>

    <!-- Modal Nouvelle Réclamation -->
    <Dialog v-model:open="isNewDialogOpen">
      <DialogContent class="sm:max-w-[500px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
        <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
          <DialogTitle class="text-2xl font-black text-slate-900 tracking-tight">Nouvelle demande</DialogTitle>
          <DialogDescription class="text-slate-500 font-medium">Précisez l'objet de votre demande et envoyez-nous votre message.</DialogDescription>
        </DialogHeader>

        <div class="p-10 space-y-8">
          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sujet</Label>
            <Input v-model="newTicket.sujet" placeholder="Quel est l'objet de votre message ?" class="h-12 rounded-xl border-slate-200 bg-white font-bold" />
          </div>

          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type de demande</Label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="n in [{id:'R',l:'Réclamation'}, {id:'D',l:'Devis'}, {id:'S',l:'Sinistre'}]" :key="n.id"
                @click="newTicket.nature = n.id"
                :class="newTicket.nature === n.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
                class="h-10 rounded-xl table-header-text transition-all">
                {{ n.l }}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Votre message</Label>
            <Textarea v-model="newTicket.message" placeholder="Décrivez votre demande en détail..." class="min-h-[120px] rounded-xl border-slate-200 bg-white font-bold resize-none" />
          </div>
        </div>

        <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100">
          <Button @click="handleCreateTicket" :disabled="!newTicket.sujet || !newTicket.message" class="w-full h-12 premium-button bg-slate-900 shadow-xl">
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PageContainer>
</template>