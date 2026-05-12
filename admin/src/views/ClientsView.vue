<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, UserPlus, CheckCircle2, Link } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import UserLinkDialog from '@/components/shared/UserLinkDialog.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'

const clients = ref<any[]>([])
const loading = ref(true)
const linkDialogOpen = ref(false)
const selectedClientId = ref<number | null>(null)

const fetchClients = async () => {
  loading.value = true
  try { clients.value = await api.admin.getClients() } 
  catch (e: any) { toast.error(e.message || "Erreur de chargement") } 
  finally { loading.value = false }
}

const handleCreateUser = async (clientId: number) => {
  try {
    await api.admin.createUserFromClient(clientId)
    toast.success('Compte client créé')
    fetchClients()
  } catch (e: any) { toast.error(e.message) }
}

const openLinkDialog = (clientId: number) => {
  selectedClientId.value = clientId
  linkDialogOpen.value = true
}

const handleLinkUser = async (userId: number) => {
  if (!selectedClientId.value) return
  try {
    await api.admin.linkUserToClient(selectedClientId.value, userId)
    toast.success('Utilisateur lié')
    linkDialogOpen.value = false
    fetchClients()
  } catch (e: any) { toast.error(e.message) }
}

onMounted(fetchClients)
</script>

<template>
  <DataTableWrapper 
    title="Clients" 
    description="Gestion des accès extranet pour les clients."
    :items="clients"
    :loading="loading"
    search-placeholder="Rechercher..."
  >
    <template #default="{ items }">
      <Table class="border-t border-slate-100">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="table-header-text py-6">Code IBS</TableHead>
            <TableHead class="table-header-text">Raison Sociale</TableHead>
            <TableHead class="table-header-text">Utilisateur lié</TableHead>
            <TableHead class="text-right table-header-text">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="client in items" :key="client.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-400 py-4">{{ client.id || 'N/A' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <Building2 class="w-5 h-5" />
                </div>
                <span class="font-bold text-slate-900 tracking-tight">{{ client.raisonSociale }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="client.fkUserId" class="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ client.userNom }}
              </div>
              <span v-else class="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">Non lié</span>
            </TableCell>
            <TableCell class="text-right">
              <div v-if="!client.fkUserId" class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-slate-600 hover:bg-slate-900 hover:text-white" @click="handleCreateUser(client.id)">
                  <UserPlus class="w-4 h-4" /> Créer
                </Button>
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-emerald-600 hover:bg-emerald-50" @click="openLinkDialog(client.id)">
                  <Link class="w-4 h-4" /> Lier
                </Button>
              </div>
              <div v-else class="text-emerald-500 pr-4">
                <CheckCircle2 class="w-5 h-5 ml-auto" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>

  <UserLinkDialog 
    :open="linkDialogOpen"
    title="Lier un utilisateur"
    description="Sélectionnez l'utilisateur à lier à ce client."
    @close="linkDialogOpen = false"
    @select="handleLinkUser"
  />
</template>