<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, UserPlus, CheckCircle2, Link, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const handleUnlinkUser = async (clientId: number, userId: string) => {
  try {
    await api.admin.unlinkUserFromClient(clientId, parseInt(userId))
    toast.success('Liaison supprimée')
    fetchClients()
  } catch (e: any) { toast.error(e.message) }
}

onMounted(fetchClients)
</script>

<template>
  <DataTableWrapper 
    :title="$t('clients.title')" 
    :description="$t('clients.subtitle')"
    :items="clients"
    :loading="loading"
    :search-placeholder="$t('clients.search_placeholder')"
  >
    <template #default="{ items }">
      <Table class="border-t border-slate-100">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="table-header-text py-6">{{ $t('clients.table.name') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('clients.table.type') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('clients.table.parent') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('clients.table.linked_users') }}</TableHead>
            <TableHead class="text-right table-header-text">{{ $t('clients.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="client in items" :key="client.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <Building2 class="w-5 h-5" />
                </div>
                <span class="font-bold text-slate-900 tracking-tight">{{ client.raisonSociale }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="client.particulier === 'O' ? 'default' : 'secondary'" class="rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-1">
                {{ client.particulier === 'O' ? $t('clients.type.individual') : $t('clients.type.company') }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-sm font-medium text-slate-500">{{ client.parentClient || '-' }}</span>
            </TableCell>
            <TableCell>
              <div v-if="client.fkUserId" class="flex flex-wrap gap-2">
                <div v-for="(user, idx) in client.userNom.split(', ')" :key="user" class="group/badge relative flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                   <CheckCircle2 class="w-2.5 h-2.5" /> 
                   {{ user }}
                   <button @click="handleUnlinkUser(client.id, client.fkUserId.split(', ')[idx])" class="ml-1 hover:text-red-600 transition-colors">
                     <X class="w-3 h-3" />
                   </button>
                </div>
              </div>
              <span v-else class="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">{{ $t('commun.no_results') }}</span>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-slate-600 hover:bg-slate-900 hover:text-white" @click="handleCreateUser(client.id)">
                  <UserPlus class="w-4 h-4" /> {{ $t('users.add_button') }}
                </Button>
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-emerald-600 hover:bg-emerald-50" @click="openLinkDialog(client.id)">
                  <Link class="w-4 h-4" /> {{ $t('commun.link') }}
                </Button>
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