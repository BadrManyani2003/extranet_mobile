<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, Plus, Trash2, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReclamationList from '@/components/reclamations/ReclamationList.vue'
import ReclamationChat from '@/components/reclamations/ReclamationChat.vue'
import PageContainer from '@/components/shared/PageContainer.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import NewTicketDialog from '@/components/shared/NewTicketDialog.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const reclamations = ref<any[]>([])
const selectedTicket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const loadingChat = ref(false)
const searchQuery = ref('')
const natureFilter = ref('all')
const currentUser = computed(() => userStore.activeUser)
const isNewDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isDeleteRecDialogOpen = ref(false)
const messageToDeleteId = ref<number | null>(null)
const isSaving = ref(false)
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


const fetchReclamations = async () => {
  loading.value = true
  try { 
    reclamations.value = await api.data.getReclamations() 
  } 
  catch (e: any) { 
    toast.error(e.message || t('reclamations.toast_fetch_error'))
    console.error(e) 
  } 
  finally { loading.value = false }
}

const filteredReclamations = computed(() => {
  return reclamations.value.filter(r => {
    const matchesSearch = !searchQuery.value || 
      (r.sujet || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    
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

const handleCreateTicket = async (ticketData: { sujet: string, nature: string, message: string }) => {
  isSaving.value = true
  try {
    const res = await api.data.createReclamation(ticketData)
    toast.success(t('reclamations.toast_create_success'))
    isNewDialogOpen.value = false
    await fetchReclamations()
    const created = reclamations.value.find(r => r.id === res.id)
    if (created) selectTicket(created)
  } catch (e: any) { 
    toast.error(e.message) 
  } finally {
    isSaving.value = false
  }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value) return
  
  const userNature = currentUser.value?.nature || 'C'
  const userNom = currentUser.value?.nom || 'Client'

  // Optimistic update
  const tempMsg = {
    id: Date.now(),
    message: text,
    envoyeur: userNom,
    nature: userNature,
    dateMessage: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  
  try { 
    await api.data.sendMessage(selectedTicket.value.id, { message: text, nature: userNature })
    selectedTicket.value.statut = 'En cours'
    // Refresh to get final data from server
    const freshMessages = await api.data.getMessages(selectedTicket.value.id)
    messages.value = freshMessages
  } catch (e: any) { 
    toast.error(e.message)
    // Remove optimistic message on error
    messages.value = messages.value.filter(m => m.id !== tempMsg.id)
    console.error(e) 
  }
}

const handleStatusUpdate = async (statut: string) => {
  if (!selectedTicket.value) return
  try {
    await api.data.updateStatut(selectedTicket.value.id, statut)
    selectedTicket.value.statut = statut === 'E' ? 'En cours' : 'Clôturé'
    toast.success(t('reclamations.toast_status_success'))
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
    await api.data.deleteMessage(messageToDeleteId.value, selectedTicket.value.id)
    messages.value = messages.value.filter(m => m.id !== messageToDeleteId.value)
    toast.success(t('reclamations.toast_delete_msg_success'))
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
    await api.data.deleteReclamation(selectedTicket.value.id)
    toast.success(t('reclamations.toast_delete_rec_success'))
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
  if (String(userStore.activeUser?.reclamation || '').trim().toUpperCase() !== 'O') {
    router.push('/contrats')
    return
  }
  fetchReclamations()
})
</script>

<template>
  <PageContainer :title="$t('reclamations.title')" :subtitle="$t('reclamations.subtitle')">
    <template #actions>
      <Button v-if="currentUser?.reclamation === 'O'" @click="isNewDialogOpen = true" class="premium-button bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2 px-4 sm:px-6 h-10 sm:h-12 rounded-xl sm:rounded-2xl transition-all active:scale-95 text-white font-bold">
        <Plus class="w-4 h-4 sm:w-5 h-5 text-white" />
        <span class="hidden xs:inline">{{ $t('reclamations.new_request') }}</span>
      </Button>
    </template>

    <div v-if="currentUser && currentUser.reclamation !== 'O'" class="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 font-['Outfit'] animate-in fade-in slide-in-from-top-4 duration-500">
      <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0" />
      <span class="font-bold text-[14px]">{{ $t('reclamations.not_authorized') }}</span>
    </div>

    <div class="flex-1 min-h-[500px] h-[calc(100vh-14rem)] sm:h-[calc(100vh-16rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(14,165,233,0.06)] overflow-hidden font-['Outfit']">
      <template v-if="!selectedTicket">
        <div class="p-8 border-b border-slate-100 bg-white space-y-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input 
                v-model="searchQuery"
                type="text" 
                :placeholder="$t('reclamations.placeholder')" 
                class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
              />
            </div>
            <div class="w-full md:w-64">
              <select 
                v-model="natureFilter"
                class="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
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

        <ReclamationList :reclamations="filteredReclamations" :loading="loading" :is-admin="false" @select="selectTicket" />
      </template>

      <template v-else>
        <div class="p-6 border-b border-slate-100 flex items-center gap-6 bg-white">
          <Button variant="ghost" size="icon" @click="selectedTicket = null" class="rounded-2xl h-12 w-12 hover:bg-slate-50">
            <ChevronLeft class="w-6 h-6 text-slate-900" />
          </Button>
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-black text-slate-900 line-clamp-1">{{ selectedTicket.sujet }}</h2>
              <Badge :class="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E') ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'" 
                class="rounded-lg text-[14px] font-black uppercase tracking-widest px-2 py-0.5 border shrink-0 shadow-none">
                {{ (selectedTicket.statut === 'E' || selectedTicket.statut === 'En cours') ? $t('statuts.en_cours') : $t('statuts.clôturé') }}
              </Badge>
            </div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {{ $t('reclamations.ticket_num') }} #{{ selectedTicket.id }} • {{ $t('reclamations.opened_on') }} {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}
            </p>
          </div>
          <div class="flex gap-2 items-center">
            <Button v-if="selectedTicket.statut !== 'En cours' && selectedTicket.statut !== 'E'" size="sm" variant="outline" @click="handleStatusUpdate('E')" class="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[14px] uppercase tracking-wider h-10 px-4">{{ $t('statuts.en_cours') }}</Button>
            <Button v-if="selectedTicket.statut !== 'Clôturé' && selectedTicket.statut !== 'C'" size="sm" variant="outline" @click="handleStatusUpdate('C')" class="rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-[14px] uppercase tracking-wider h-10 px-4">{{ $t('reclamations.close_ticket') }}</Button>
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
          selfNature="Client"
          @send="handleSendMessage" 
          @delete-message="handleDeleteMessage" 
        />
      </template>
    </div>

    <!-- Dialogs extraits -->
    <NewTicketDialog
      :open="isNewDialogOpen"
      :loading="isSaving"
      @close="isNewDialogOpen = false"
      @submit="handleCreateTicket"
    />

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
      :description="$t('reclamations.delete_rec_confirm')"
      :loading="isDeletingTicket"
      @close="isDeleteRecDialogOpen = false"
      @confirm="confirmDeleteReclamation"
    />
  </PageContainer>
</template>
