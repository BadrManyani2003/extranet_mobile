<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, UserPlus, CheckCircle2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import { api } from '@/lib/api'

const adherents = ref<any[]>([])
const loading = ref(true)

const fetchAdherents = async () => {
  loading.value = true
  try { adherents.value = await api.admin.getAdherents() } 
  catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handleCreateUser = async (adherentId: number) => {
  try {
    const res = await api.admin.createUserFromAdherent(adherentId)
    if (res.success) {
      alert('Accès Mobile créé avec succès !')
      fetchAdherents()
    }
  } catch (e) { console.error(e) }
}

onMounted(fetchAdherents)
</script>

<template>
  <DataTableWrapper 
    title="Registre des Adhérents" 
    description="Gérez les adhérents et créez leurs accès aux applications mobiles."
    :items="adherents"
    :loading="loading"
    search-placeholder="Rechercher par nom, matricule ou code..."
  >
    <template #default="{ items }">
      <Table>
        <TableHeader class="bg-slate-50/50 border-b border-slate-100">
          <TableRow>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px] py-6">Matricule</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Nom Complet</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Date Naissance</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Utilisateur lié</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="adherent in items" :key="adherent.Id" class="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-400 py-4">{{ adherent.Matricule || 'N/A' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                  <User class="w-4 h-4" />
                </div>
                <span class="font-black text-slate-900">{{ adherent.Nom }}</span>
              </div>
            </TableCell>
            <TableCell class="text-sm font-bold text-slate-600">{{ adherent.DateNaissance ? new Date(adherent.DateNaissance).toLocaleDateString() : '-' }}</TableCell>
            <TableCell>
              <div v-if="adherent.FK_User_Id" class="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
                <CheckCircle2 class="w-4 h-4" />
                {{ adherent.UserNom }}
              </div>
              <span v-else class="text-slate-300 font-black text-[10px] uppercase tracking-widest">Aucun</span>
            </TableCell>
            <TableCell class="text-right">
              <Button v-if="!adherent.FK_User_Id" variant="ghost" size="sm" 
                class="h-10 gap-2 rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
                @click="handleCreateUser(adherent.Id)"
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
