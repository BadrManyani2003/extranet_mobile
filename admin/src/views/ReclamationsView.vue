<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReclamationList from '@/components/shared/ReclamationList.vue'
import ReclamationChat from '@/components/shared/ReclamationChat.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { Trash2 } from 'lucide-vue-next'

const { t } = useI18n()

const reclamations = ref<any[]>([])
const selectedTicket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const loadingChat = ref(false)
const searchQuery = ref('')
const natureFilter = ref('all')
const currentUser = ref<any>(null)
const isDeleteDialogOpen = ref(false)
const isDeleteRecDialogOpen = ref(false)
const messageToDeleteId = ref<number | null>(null)
const isDeletingMessage = ref(false)
const isDeletingTicket = ref(false)

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
    toast.error(e.message || t('reclamations.toast_load_error'))
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
    envoyeur: 'Conseiller MyAsk',
    nature: 'Admin',
    dateMessage: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  
  try { 
    await api.admin.replyToReclamation(selectedTicket.value.id, text)
    toast.success(t('reclamations.toast_reply_success'))
    selectedTicket.value.statut = 'En cours'
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
    selectedTicket.value.statut = statut === 'E' ? 'En cours' : 'Clôturé'
    toast.success(t('reclamations.toast_status_update_success'))
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
  isDeletingMessage.value = true
  try {
    await api.admin.deleteMessage(messageToDeleteId.value, selectedTicket.value.id)
    messages.value = messages.value.filter(m => m.id !== messageToDeleteId.value)
    toast.success(t('reclamations.toast_delete_message_success'))
    isDeleteDialogOpen.value = false
    messageToDeleteId.value = null
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    isDeletingMessage.value = false
  }
}

const confirmDeleteReclamation = async () => {
  if (!selectedTicket.value) return
  isDeletingTicket.value = true
  try {
    await api.admin.deleteReclamation(selectedTicket.value.id)
    toast.success(t('reclamations.toast_delete_ticket_success'))
    isDeleteRecDialogOpen.value = false
    selectedTicket.value = null
    await fetchReclamations()
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    isDeletingTicket.value = false
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
            <h2 class="text-2xl font-black text-slate-900">{{ $t('navigation.reclamations') }}</h2>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="$t('reclamations.placeholder')" 
              class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
            />
          </div>
          <div class="w-full md:w-64">
            <select 
              v-model="natureFilter"
              class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
            >
              <option value="all">{{ $t('reclamations.all_natures') }}</option>
              <option value="S">{{ $t('reclamations.nature_s') }}</option>
              <option value="C">{{ $t('reclamations.nature_c') }}</option>
              <option value="I">{{ $t('reclamations.nature_i') }}</option>
              <option value="D">{{ $t('reclamations.nature_d') }}</option>
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
            <Badge :class="selectedTicket.statut === 'En cours' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400 border-slate-100'" 
              class="rounded-lg text-[14px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none">
              {{ selectedTicket.statut === 'En cours' ? $t('reclamations.en_cours') : $t('reclamations.cloture') }}
            </Badge>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {{ $t('reclamations.client_prefix') }}{{ selectedTicket.client }} • {{ $t('reclamations.ticket_num') }} #{{ selectedTicket.id }} • {{ $t('reclamations.opened_on') }} {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}
          </p>
        </div>
        <div class="flex gap-2 items-center">
          <Button v-if="selectedTicket.statut !== 'En cours' && selectedTicket.statut !== 'E'" size="sm" variant="outline" @click="handleStatusUpdate('E')" class="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[14px] uppercase tracking-wider">{{ $t('reclamations.en_cours') }}</Button>
          <Button v-if="selectedTicket.statut !== 'Clôturé' && selectedTicket.statut !== 'C'" size="sm" variant="outline" @click="handleStatusUpdate('C')" class="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[14px] uppercase tracking-wider">{{ $t('reclamations.close_ticket') }}</Button>
          <Button size="icon" variant="ghost" @click="isDeleteRecDialogOpen = true" class="rounded-xl h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors">
            <Trash2 class="w-5 h-5" />
          </Button>
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

    <!-- Dialogs extraits -->
    <ConfirmModal
      :open="isDeleteDialogOpen"
      variant="danger"
      :title="$t('commun.delete') + ' ?'"
      :description="$t('reclamations.message_deleted')"
      :loading="isDeletingMessage"
      @close="isDeleteDialogOpen = false"
      @confirm="confirmDelete"
    />

    <ConfirmModal
      :open="isDeleteRecDialogOpen"
      variant="danger"
      :title="$t('commun.delete') + ' ?'"
      :description="$t('reclamations.delete_ticket_confirm')"
      :loading="isDeletingTicket"
      @close="isDeleteRecDialogOpen = false"
      @confirm="confirmDeleteReclamation"
    />
  </div>
</template>

