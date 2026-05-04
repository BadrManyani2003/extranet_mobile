<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const reclamations = ref<any[]>([])
const selectedTicket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const isNewDialogOpen = ref(false)
const newTicket = ref({ sujet: '', nature: 'R', message: '' })

const fetchReclamations = async () => {
  loading.value = true
  try { reclamations.value = await api.data.getReclamations() } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const selectTicket = async (ticket: any) => {
  selectedTicket.value = ticket
  loading.value = true
  try { messages.value = await api.data.getMessages(ticket.id) } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handleCreateTicket = async () => {
  if (!newTicket.value.sujet || !newTicket.value.message) return
  try {
    const res = await api.data.createReclamation(newTicket.value)
    isNewDialogOpen.value = false
    newTicket.value = { sujet: '', nature: 'R', message: '' }
    await fetchReclamations()
    const created = reclamations.value.find(r => r.id === res.id)
    if (created) selectTicket(created)
  } catch (e) { console.error(e) }
}

const handleSendMessage = async (text: string) => {
  if (!selectedTicket.value) return
  messages.value.push({
    id: Date.now(),
    text,
    sender: 'user',
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  try { await api.data.sendMessage(selectedTicket.value.id, { message: text, nature: 'C' }) } 
  catch (e) { console.error(e) }
}

onMounted(fetchReclamations)
</script>

<template>
  <div class="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden font-['Outfit']">
    <template v-if="!selectedTicket">
      <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Mes Réclamations</h2>
          <p class="text-sm font-medium text-slate-500">Suivez l'état de vos demandes et échangez avec nos conseillers.</p>
        </div>
        <Button @click="isNewDialogOpen = true" class="rounded-2xl h-12 gap-2 bg-slate-900 shadow-xl shadow-slate-200">
          <Plus class="w-5 h-5" /> Nouvelle Demande
        </Button>
      </div>

      <ReclamationList :reclamations="reclamations" :loading="loading" @select="selectTicket" />
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
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ticket #{{ selectedTicket.id }} • Ouvert le {{ new Date(selectedTicket.date).toLocaleDateString() }}</p>
        </div>
      </div>

      <ReclamationChat :messages="messages" :loading="loading" :selected-ticket="selectedTicket" @send="handleSendMessage" />
    </template>
  </div>

  <Dialog v-model:open="isNewDialogOpen">
    <DialogContent class="sm:max-w-[600px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
        <DialogTitle class="text-2xl font-black text-slate-900">Nouvelle Réclamation</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">Décrivez votre problème, nous vous répondrons dans les plus brefs délais.</DialogDescription>
      </DialogHeader>
      <div class="p-10 space-y-6">
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">Sujet de la demande</Label>
          <Input v-model="newTicket.sujet" placeholder="Ex: Problème de quittance, Modification contrat..." class="rounded-2xl h-12 border-slate-200" />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">Nature</Label>
          <select v-model="newTicket.nature" class="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all">
            <option value="R">Réclamation</option>
            <option value="D">Demande d'information</option>
            <option value="S">Sinistre</option>
          </select>
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-black uppercase tracking-widest text-slate-400">Votre message</Label>
          <Textarea v-model="newTicket.message" placeholder="Détaillez votre demande ici..." class="rounded-2xl min-h-[120px] border-slate-200" />
        </div>
      </div>
      <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <Button variant="ghost" @click="isNewDialogOpen = false" class="rounded-2xl px-8 font-black text-slate-500">Annuler</Button>
        <Button @click="handleCreateTicket" class="rounded-2xl bg-slate-900 px-10 shadow-xl shadow-slate-200">Envoyer la demande</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
