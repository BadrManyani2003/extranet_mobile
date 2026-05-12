<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, UserPlus, CheckCircle2, Link } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import UserLinkDialog from '@/components/shared/UserLinkDialog.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'

const adherents = ref<any[]>([])
const loading = ref(true)
const linkDialogOpen = ref(false)
const selectedAdherentId = ref<number | null>(null)

const fetchAdherents = async () => {
  loading.value = true
  try { adherents.value = await api.admin.getAdherents() } 
  catch (e: any) { toast.error(e.message || "Erreur de chargement") } 
  finally { loading.value = false }
}

const handleCreateUser = async (adherentId: number) => {
  try {
    await api.admin.createUserFromAdherent(adherentId)
    toast.success('Accès Mobile créé')
    fetchAdherents()
  } catch (e: any) { toast.error(e.message) }
}

const openLinkDialog = (adherentId: number) => {
  selectedAdherentId.value = adherentId
  linkDialogOpen.value = true
}

const handleLinkUser = async (userId: number) => {
  if (!selectedAdherentId.value) return
  try {
    await api.admin.linkUserToAdherent(selectedAdherentId.value, userId)
    toast.success('Utilisateur lié')
    linkDialogOpen.value = false
    fetchAdherents()
  } catch (e: any) { toast.error(e.message) }
}

onMounted(fetchAdherents)
</script>

<template>
  <DataTableWrapper 
    title="Adhérents" 
    description="Gestion des accès mobiles pour les adhérents."
    :items="adherents"
    :loading="loading"
    search-placeholder="Rechercher..."
  >
    <template #default="{ items }">
      <Table class="border-t border-slate-100">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px] py-6">Matricule</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Nom Complet</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Utilisateur lié</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="adherent in items" :key="adherent.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-400 py-4">{{ adherent.matricule || 'N/A' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <User class="w-5 h-5" />
                </div>
                <span class="font-bold text-slate-900 tracking-tight">{{ adherent.nom }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="adherent.fkUserId" class="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ adherent.userNom }}
              </div>
              <span v-else class="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">Non lié</span>
            </TableCell>
            <TableCell class="text-right">
              <div v-if="!adherent.fkUserId" class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" class="h-9 gap-2 rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all" @click="handleCreateUser(adherent.id)">
                  <UserPlus class="w-4 h-4" /> Créer accès
                </Button>
                <Button variant="ghost" size="sm" class="h-9 gap-2 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all" @click="openLinkDialog(adherent.id)">
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
    description="Sélectionnez l'utilisateur à lier à cet adhérent."
    @close="linkDialogOpen = false"
    @select="handleLinkUser"
  />
</template>