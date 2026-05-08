<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const isCabinet = ref(keycloak.hasRealmRole('admincab') || keycloak.hasRealmRole('comercialcab'))

const { data: reclamations, loading: loadingList, execute: fetchReclamations } = useFetch(api.data.getReclamations)
const { data: messages, loading: loadingChat, execute: fetchMessages } = useFetch(api.data.getMessages)

const selectedTicket = ref<any>(null)
const isNewDialogOpen = ref(false)
const newTicket = ref({ sujet: '', nature: 'R', message: '' })

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

onMounted(fetchReclamations)
</script>

<template>
  <div class="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden font-['Outfit']">
    <template v-if="!selectedTicket">
      <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h2 class="text-2xl font-black text-slate-900">{{ $t('reclamations.title') }}</h2>
        </div>
        <Button @click="isNewDialogOpen = true" class="rounded-2xl h-12 gap-2 bg-slate-900 shadow-xl shadow-slate-200">
          <Plus class="w-5 h-5" /> {{ $t('reclamations.new_request') }}
        </Button>
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
        <div v-if="isCabinet" class="flex items-center gap-2">
          <Button v-if="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E')" 
            variant="outline" size="sm" @click="handleUpdateStatus('C')" class="rounded-xl font-bold text-xs h-9 border-slate-200">
            {{ $t('reclamations.close_ticket') || 'Clôturer' }}
          </Button>
          <Button v-else 
            variant="outline" size="sm" @click="handleUpdateStatus('E')" class="rounded-xl font-bold text-xs h-9 border-slate-200">
            {{ $t('reclamations.reopen_ticket') || 'Rouvrir' }}
          </Button>
        </div>
      </div>

      <ReclamationChat 
        :messages="messages || []" 
        :loading="loadingChat" 
        :selected-ticket="selectedTicket" 
        :is-cabinet="isCabinet"
        @send="handleSendMessage" 
        @delete-message="handleDeleteMessage"
      />
    </template>
  </div>

  <Dialog v-model:open="isNewDialogOpen">
    <DialogContent class="sm:max-w-[600px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
        <DialogTitle class="text-2xl font-black text-slate-900">{{ $t('reclamations.new_request') }}</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">{{ $t('reclamations.subtitle') }}</DialogDescription>
      </DialogHeader>
      <div class="p-10 space-y-6">
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('reclamations.subject') }}</Label>
          <Input v-model="newTicket.sujet" :placeholder="$t('reclamations.subject_placeholder')" class="rounded-2xl h-12 border-slate-200" />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('reclamations.nature') }}</Label>
          <select v-model="newTicket.nature" class="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all">
            <option value="R">{{ $t('reclamations.nature_r') }}</option>
            <option value="D">{{ $t('reclamations.nature_d') }}</option>
            <option value="S">{{ $t('reclamations.nature_s') }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('reclamations.message') }}</Label>
          <Textarea v-model="newTicket.message" :placeholder="$t('reclamations.message_placeholder')" class="rounded-2xl min-h-[120px] border-slate-200" />
        </div>
      </div>
      <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <Button variant="ghost" @click="isNewDialogOpen = false" class="rounded-2xl px-8 font-black text-slate-500">{{ $t('reclamations.cancel') }}</Button>
        <Button @click="handleCreateTicket" class="rounded-2xl bg-slate-900 px-10 shadow-xl shadow-slate-200">{{ $t('reclamations.send') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>