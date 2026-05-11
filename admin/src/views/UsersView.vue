<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, RefreshCcw } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import { api } from '@/lib/api'
import keycloak from '@/services/keycloak'
import { toast } from '@/components/ui/sonner'

const users = ref<any[]>([])
const loading = ref(true)
const isDialogOpen = ref(false)
const isConfirmDeleteOpen = ref(false)
const isConfirmSyncOpen = ref(false)
const selectedUser = ref<any>(null)
const userToDelete = ref<any>(null)
const formData = ref({ id: 0, nom: '', email: '', telephone: '', nature: 'P', extranet: 'N', mobile: 'N' })

const fetchUsers = async () => {
  loading.value = true
  try { users.value = await api.admin.getUsers() } 
  catch (e: any) { 
    toast.error(e.message || "Erreur lors de la récupération")
    console.error(e) 
  } 
  finally { loading.value = false }
}

const openEdit = (user: any) => {
  selectedUser.value = user
  formData.value = { ...user }
  isDialogOpen.value = true
}

const handleSave = async () => {
  try {
    await api.admin.saveUser(formData.value)
    toast.success("Enregistré avec succès")
    isDialogOpen.value = false
    fetchUsers()
  } catch (e: any) { 
    toast.error(e.message)
    console.error(e) 
  }
}

const handleDelete = async () => {
  if (!userToDelete.value) return
  try {
    await api.admin.deleteUser(userToDelete.value.id)
    toast.success("Utilisateur supprimé")
    isConfirmDeleteOpen.value = false
    fetchUsers()
  } catch (e: any) { 
    toast.error(e.message)
    console.error(e) 
  }
}

const handleSync = async () => {
  if (!selectedUser.value) return
  try {
    await api.admin.syncKeycloak(selectedUser.value.id)
    toast.success("Synchronisation réussie")
    isConfirmSyncOpen.value = false
    fetchUsers()
  } catch (e: any) { 
    toast.error(e.message)
    console.error(e) 
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <DataTableWrapper 
    title="Liste Utilisateurs" 
    description="Gérez les accès de vos collaborateurs et clients."
    :items="users"
    :loading="loading"
  >
    <template #default="{ items }">
      <Table>
        <TableHeader class="bg-slate-50/50 border-b border-slate-100">
          <TableRow>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px] py-6">Nom</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Email / Tel</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Sync</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in items" :key="user.id" class="hover:bg-slate-50/80 border-b border-slate-50">
            <TableCell class="font-bold text-slate-900 py-4">{{ user.nom }}</TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-700">{{ user.email || '-' }}</span>
                <span class="text-xs text-slate-400 font-medium">{{ user.telephone || '-' }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="user.idAuth" class="text-emerald-600 text-xs font-black">OUI</div>
              <Button v-else variant="ghost" size="sm" class="h-8 gap-2 text-[10px] text-orange-600 font-black hover:bg-orange-50 rounded-xl" @click="selectedUser = user; isConfirmSyncOpen = true">
                <RefreshCcw class="w-3.5 h-3.5" /> SYNC
              </Button>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-slate-100" @click="openEdit(user)"><Edit class="w-4 h-4 text-slate-600" /></Button>
                <Button variant="ghost" size="icon" class="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500" @click="userToDelete = user; isConfirmDeleteOpen = true"><Trash2 class="w-4 h-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>

  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-[600px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
        <DialogTitle class="text-2xl font-black text-slate-900">{{ formData.id ? 'Modifier' : 'Nouveau' }} Utilisateur</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">Remplissez les informations ci-dessous pour gérer l'utilisateur.</DialogDescription>
      </DialogHeader>
      <div class="p-10 space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2"><Label>Nom complet</Label><Input v-model="formData.nom" class="rounded-xl" /></div>
          <div class="space-y-2"><Label>Email</Label><Input v-model="formData.email" class="rounded-xl" /></div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2"><Label>Téléphone</Label><Input v-model="formData.telephone" class="rounded-xl" /></div>
          <div class="space-y-2"><Label>Type</Label>
            <select v-model="formData.nature" class="w-full border border-slate-200 rounded-xl h-10 px-3 text-sm font-bold bg-white">
              <option value="P">Poste</option><option value="C">Client</option><option value="A">Adhérent</option>
            </select>
          </div>
        </div>
      </div>
      <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100"><Button @click="handleSave" class="rounded-xl bg-slate-900 px-8">Enregistrer</Button></DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isConfirmSyncOpen">
    <DialogContent class="sm:max-w-[400px] rounded-[2rem] p-10 font-['Outfit'] border-none">
      <div class="text-center space-y-6">
        <RefreshCcw class="w-12 h-12 text-orange-600 mx-auto" />
        <DialogTitle class="text-2xl font-black">Synchroniser ?</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">Cette action mettra à jour les informations de l'utilisateur avec Keycloak.</DialogDescription>
        <div class="flex gap-4 pt-4">
          <Button variant="ghost" class="flex-1" @click="isConfirmSyncOpen = false">Non</Button>
          <Button class="flex-1 bg-orange-600 shadow-xl" @click="handleSync">Oui</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isConfirmDeleteOpen">
    <DialogContent class="sm:max-w-[400px] rounded-[2rem] p-10 font-['Outfit'] border-none">
      <div class="text-center space-y-6">
        <Trash2 class="w-12 h-12 text-red-600 mx-auto" />
        <DialogTitle class="text-2xl font-black">Supprimer ?</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.</DialogDescription>
        <div class="flex gap-4 pt-4">
          <Button variant="ghost" class="flex-1" @click="isConfirmDeleteOpen = false">Annuler</Button>
          <Button variant="destructive" class="flex-1 shadow-xl" @click="handleDelete">Supprimer</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>