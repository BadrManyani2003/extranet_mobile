<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Building2, UserPlus, CheckCircle2 } from 'lucide-vue-next'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import { api } from '@/lib/api'

const clients = ref<any[]>([])
const loading = ref(true)

const fetchClients = async () => {
  loading.value = true
  try { clients.value = await api.admin.getClients() } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handleCreateUser = async (clientId: number) => {
  try {
    const res = await api.admin.createUserFromClient(clientId)
    if (res.success) {
      alert('Utilisateur créé avec succès !')
      fetchClients()
    }
  } catch (e) { console.error(e) }
}

onMounted(fetchClients)
</script>

<template>
  <DataTableWrapper 
    title="Portefeuille Clients" 
    description="Gérez vos clients et créez leurs accès extranet."
    :items="clients"
    :loading="loading"
    search-placeholder="Rechercher par nom ou code..."
  >
    <template #default="{ items }">
      <Table>
        <TableHeader class="bg-slate-50/50 border-b border-slate-100">
          <TableRow>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px] py-6">Code IBS</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Raison Sociale</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Email</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Utilisateur lié</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="client in items" :key="client.Id" class="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-400 py-4">{{ client.IdIBS || 'N/A' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 shadow-sm">
                  <Building2 class="w-4 h-4" />
                </div>
                <span class="font-black text-slate-900">{{ client.RaisonSociale }}</span>
              </div>
            </TableCell>
            <TableCell class="text-sm font-bold text-slate-600">{{ client.Email || '-' }}</TableCell>
            <TableCell>
              <div v-if="client.FK_User_Id" class="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
                <CheckCircle2 class="w-4 h-4" />
                {{ client.UserNom }}
              </div>
              <span v-else class="text-slate-300 font-black text-[10px] uppercase tracking-widest">Aucun</span>
            </TableCell>
            <TableCell class="text-right">
              <Button v-if="!client.FK_User_Id" variant="ghost" size="sm" 
                class="h-10 gap-2 rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
                @click="handleCreateUser(client.Id)"
              >
                <UserPlus class="w-4 h-4" /> Créer Accès
              </Button>
              <div v-else class="text-slate-300 pr-4">
                <CheckCircle2 class="w-5 h-5 ml-auto" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>
</template>
