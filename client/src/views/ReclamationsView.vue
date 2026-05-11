<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ReclamationList from '@/components/reclamations/ReclamationList.vue'
import ReclamationChat from '@/components/reclamations/ReclamationChat.vue'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'
import { toast } from '@/components/ui/sonner'
import keycloak from '@/services/keycloak'

const { t } = useI18n()

const isCabinet = ref(keycloak.hasRole('admincab') || keycloak.hasRole('comercialcab'))

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
    const res = await api.data.getUserInfo()
    currentUser.value = res.user
  } catch (e) { console.error(e) }
}

const selectTicket = async (ticket: any) => {
  selectedTicket.value = ticket
  await fetchMessages(ticket.id)
}

const handleCreateTicket = async () => {
  if (!newTicket.value.sujet || !newTicket.value.message) return
  try {
    const res = await api.data.createReclamation(newTicket.value)
    toast.success(t('reclamations.success_msg'))
    isNewDialogOpen.value = false
    newTicket.value = { sujet: '', nature: 'R', message: '' }
    const updated = await fetchReclamations()
    const created = (updated as any[])?.find(r => r.id === res.id)
    if (created) selectTicket(created)
  } catch (e: any) {
    toast.error(e.message || t('reclamations.error_msg'))
    console.error(e)
  }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value || !messages.value) return
  if (selectedTicket.value.statut === 'Clôturé' || selectedTicket.value.statut === 'C') {
    toast.error(t('reclamations.closed_error') || 'Réclamation clôturée')
    return
  }

  try {
    await api.data.sendMessage(selectedTicket.value.id, { message: text, nature: isCabinet.value ? 'A' : 'C' })
    await fetchMessages(selectedTicket.value.id)
  } catch (e: any) {
    toast.error(e.message)
    console.error(e)
  }
}

const handleUpdateStatus = async (newStatut: string) => {
  if (!selectedTicket.value) return
  try {
    await api.data.updateStatut(selectedTicket.value.id, newStatut)
    selectedTicket.value.statut = newStatut === 'C' ? 'Clôturé' : 'En cours'
    toast.success(t('reclamations.status_updated'))
    fetchReclamations()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const handleDeleteMessage = async (msgId: number) => {
  if (!selectedTicket.value) return
  try {
    await api.data.deleteMessage(msgId, selectedTicket.value.id)
    toast.success(t('reclamations.message_deleted') || 'Message supprimé')
    await fetchMessages(selectedTicket.value.id)
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
      <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h2 class="text-2xl font-black text-slate-900">{{ $t('reclamations.title') }}</h2>
        </div>
      </div>

      <ReclamationList :reclamations="reclamations || []" :loading="loadingList" @select="selectTicket" />
    </template>

    <template v-else>
      <div class="p-6 border-b border-slate-100 flex items-center gap-6 bg-white">
        <Button variant="ghost" size="icon" @click="selectedTicket = null" class="rounded-2xl h-12 w-12 hover:bg-slate-50">
          <ChevronLeft class="w-6 h-6 text-slate-900" />
        </Button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-black text-slate-900 line-clamp-1">{{ selectedTicket.sujet }}</h2>
            <Badge :class="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E') ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'" 
              class="rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none">
              {{ (selectedTicket.statut === 'E' || selectedTicket.statut === 'En cours') ? 'En cours' : 'Clôturé' }}
            </Badge>
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{{ $t('reclamations.ticket_num') }} #{{ selectedTicket.id }} • {{ $t('reclamations.opened_on') }} {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}</p>
        </div>
      </div>

      <ReclamationChat 
        :messages="messages || []" 
        :loading="loadingChat" 
        :selected-ticket="selectedTicket" 
        :is-cabinet="isCabinet"
        :current-user-id="currentUser?.id"
      />
    </template>
  </div>
</template>