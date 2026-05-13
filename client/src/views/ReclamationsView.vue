<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Plus, ChevronLeft, Trash2 } from 'lucide-vue-next'
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
const isDeleteDialogOpen = ref(false)
const messageToDeleteId = ref<number | null>(null)
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
  try { 
    const res = await api.data.getUserInfo(); 
    console.log('👤 Current User Data:', res);
    currentUser.value = res; 
  } catch (e) { console.error('❌ Error fetching user info:', e) }
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

const handleDeleteMessage = (messageId: number) => {
  messageToDeleteId.value = messageId
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedTicket.value || !messageToDeleteId.value) return
  try {
    await api.data.deleteMessage(messageToDeleteId.value, selectedTicket.value.id)
    toast.success("Message supprimé")
    isDeleteDialogOpen.value = false
    messageToDeleteId.value = null
    await fetchMessages(selectedTicket.value.id)
  } catch (e: any) {
    toast.error(e.message)
  }
}

onMounted(() => { fetchReclamations(); fetchUserInfo(); })
</script>

<template>
  <PageContainer :title="$t('reclamations.title')" :subtitle="$t('reclamations.subtitle')">
    <template #actions>
      <Button @click="isNewDialogOpen = true" class="premium-button bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-100 gap-2 px-4 sm:px-6 h-10 sm:h-12 rounded-xl sm:rounded-2xl transition-all active:scale-95">
        <Plus class="w-4 h-4 sm:w-5 h-5" />
        <span class="hidden xs:inline">{{ $t('reclamations.new_request') }}</span>
      </Button>
    </template>

    <div class="flex-1 min-h-[500px] h-[calc(100vh-14rem)] sm:h-[calc(100vh-16rem)] flex flex-col glass-card border-slate-100 overflow-hidden">
      <template v-if="!selectedTicket">
        <ReclamationList :reclamations="reclamations || []" :loading="loadingList" @select="selectTicket" />
      </template>

      <template v-else>
        <div class="p-4 sm:p-6 md:p-8 border-b border-slate-50 flex items-center gap-4 sm:gap-6 bg-white sticky top-0 z-10">
          <Button variant="ghost" size="icon" @click="selectedTicket = null" class="rounded-xl h-9 w-9 sm:h-10 sm:w-10 hover:bg-slate-50 shrink-0">
            <ChevronLeft class="w-5 h-5 sm:w-6 h-6 text-slate-900" />
          </Button>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight">{{ selectedTicket.sujet }}</h2>
              <Badge :class="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E') ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'" 
                class="status-badge px-2 py-0.5 text-[9px] sm:text-[10px]">
                {{ (selectedTicket.statut === 'E' || selectedTicket.statut === 'En cours') ? $t('statuts.en_cours') : $t('statuts.clôturé') }}
              </Badge>
            </div>
            <p class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex flex-wrap items-center gap-x-2">
              <span>{{ $t('reclamations.ticket_num') }} #{{ selectedTicket.id }}</span>
              <span class="hidden xs:inline w-1 h-1 rounded-full bg-slate-200"></span>
              <span>{{ $t('reclamations.opened_on') }} {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}</span>
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
          @delete-message="handleDeleteMessage"
        />
      </template>
    </div>

    <!-- Modal Nouvelle Réclamation -->
    <Dialog v-model:open="isNewDialogOpen">
      <DialogContent class="sm:max-w-[500px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
        <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
          <DialogTitle class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('reclamations.new_request') }}</DialogTitle>
          <DialogDescription class="text-slate-500 font-medium">{{ $t('reclamations.subtitle') }}</DialogDescription>
        </DialogHeader>

        <div class="p-10 space-y-8">
          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.subject') }}</Label>
            <Input v-model="newTicket.sujet" :placeholder="$t('reclamations.subject_placeholder')" class="h-12 rounded-xl border-slate-200 bg-white font-bold" />
          </div>

          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.nature') }}</Label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="n in [
                {id:'S',l: $t('reclamations.nature_s')}, 
                {id:'C',l: $t('reclamations.nature_c')}, 
                {id:'I',l: $t('reclamations.nature_i')}, 
                {id:'D',l: $t('reclamations.nature_d')}
              ]" :key="n.id"
                @click="newTicket.nature = n.id"
                :class="newTicket.nature === n.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
                class="h-10 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all">
                {{ n.l }}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.message') }}</Label>
            <Textarea v-model="newTicket.message" :placeholder="$t('reclamations.message_placeholder')" class="min-h-[120px] rounded-xl border-slate-200 bg-white font-bold resize-none" />
          </div>
        </div>

        <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100">
          <Button @click="handleCreateTicket" :disabled="!newTicket.sujet || !newTicket.message" class="w-full h-12 premium-button bg-slate-900 shadow-xl">
            {{ $t('reclamations.send') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- Modal Confirmation Suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[400px] rounded-[2rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
        <DialogHeader class="p-8 bg-white text-center">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-8 h-8" />
          </div>
          <DialogTitle class="text-xl font-black text-slate-900 tracking-tight">{{ $t('commun.delete') }} ?</DialogTitle>
          <DialogDescription class="text-slate-500 font-medium mt-2">
            {{ $t('reclamations.message_deleted') }}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="p-8 bg-slate-50/50 flex gap-3 sm:justify-center">
          <Button variant="ghost" @click="isDeleteDialogOpen = false" class="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-white">
            {{ $t('commun.cancel') }}
          </Button>
          <Button @click="confirmDelete" class="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-100">
            {{ $t('commun.delete') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PageContainer>
</template>