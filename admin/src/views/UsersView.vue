<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, RefreshCcw, ShieldCheck, Check, UserCircle } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'

// -- States
const users = ref<any[]>([])
const allRoles = ref<any[]>([])
const loading = ref(true)
const processing = ref(false)

const dialogs = ref({
  edit: false,
  roles: false,
  delete: false,
  sync: false
})

const activeUser = ref<any>(null)
const selectedRoles = ref<string[]>([])
const formData = ref({ id: 0, idAuth: '', nom: '', email: '', telephone: '', nature: 'P', extranet: 'N', mobile: 'N' })

// -- Actions
const fetchUsers = async () => {
  loading.value = true
  try { users.value = await api.admin.getUsers() } 
  catch (e: any) { toast.error(e.message || "Erreur de chargement") } 
  finally { loading.value = false }
}

const openEdit = (user: any = null) => {
  activeUser.value = user
  formData.value = user ? { ...user } : { id: 0, idAuth: '', nom: '', email: '', telephone: '', nature: 'P', extranet: 'N', mobile: 'N' }
  dialogs.value.edit = true
}

const handleSave = async () => {
  processing.value = true
  try {
    await api.admin.saveUser(formData.value)
    toast.success("Utilisateur enregistré")
    dialogs.value.edit = false
    fetchUsers()
  } catch (e: any) { toast.error(e.message) }
  finally { processing.value = false }
}

const openRoles = async (user: any) => {
  activeUser.value = user
  selectedRoles.value = user.roles ? user.roles.split(', ').map((r: string) => r.trim()) : []
  dialogs.value.roles = true
  if (allRoles.value.length === 0) {
    try { allRoles.value = await api.admin.getRoles() } catch (e) { console.error(e) }
  }
}

const handleSaveRoles = async () => {
  if (!activeUser.value) return
  processing.value = true
  try {
    const rolesToAssign = allRoles.value.filter(r => selectedRoles.value.includes(r.name))
    await api.admin.updateUserRoles(activeUser.value.id, activeUser.value.idAuth, rolesToAssign)
    toast.success("Rôles mis à jour")
    dialogs.value.roles = false
    fetchUsers()
  } catch (e: any) { toast.error(e.message) }
  finally { processing.value = false }
}

const handleSync = async () => {
  if (!activeUser.value) return
  processing.value = true
  try {
    await api.admin.syncKeycloak(activeUser.value.id)
    toast.success("Synchronisation réussie")
    dialogs.value.sync = false
    fetchUsers()
  } catch (e: any) { toast.error(e.message) }
  finally { processing.value = false }
}

const handleDelete = async () => {
  if (!activeUser.value) return
  processing.value = true
  try {
    await api.admin.deleteUser(activeUser.value.id)
    toast.success("Utilisateur supprimé")
    dialogs.value.delete = false
    fetchUsers()
  } catch (e: any) { toast.error(e.message) }
  finally { processing.value = false }
}

onMounted(fetchUsers)
</script>

<template>
  <DataTableWrapper 
    :title="$t('users.title')" 
    :description="$t('users.subtitle')"
    :items="users"
    :loading="loading"
    :add-button-label="$t('users.add_button')"
    :search-placeholder="$t('users.search_placeholder')"
    @add="openEdit()"
  >
    <template #default="{ items }">
      <Table class="border-t border-slate-100">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="table-header-text py-6">{{ $t('users.table.name') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.email') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.nature') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.status') }}</TableHead>
            <TableHead class="text-right table-header-text pr-8">{{ $t('users.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in items" :key="user.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <UserCircle class="w-6 h-6" />
                </div>
                <div>
                  <div class="font-bold text-slate-900 tracking-tight">{{ user.nom }}</div>
                  <div class="text-[10px] text-slate-400 font-medium">{{ user.telephone || '---' }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-700">{{ user.email }}</span>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ user.idAuth || '---' }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge v-if="user.nature === 'C'" variant="secondary" class="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.client') }}</Badge>
              <Badge v-else-if="user.nature === 'A'" variant="secondary" class="bg-orange-50 text-orange-600 border-orange-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.cabinet') }}</Badge>
              <span v-else class="text-slate-300 italic text-[10px]">{{ user.nature || '-' }}</span>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1 max-w-[280px]">
                <Badge v-for="role in (user.roles?.split(', ') || [])" :key="role" 
                  class="bg-white border border-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tight py-0.5 px-1.5 shadow-sm">
                  {{ role }}
                </Badge>
                <span v-if="!user.roles" class="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Standard</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1.5">
                <div v-if="user.idAuth" class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span class="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Actif</span>
                </div>
                <Button v-else variant="ghost" size="sm" class="h-8 gap-2 text-[10px] text-orange-600 font-black hover:bg-orange-50 rounded-xl px-2" @click="activeUser = user; dialogs.sync = true">
                  <RefreshCcw class="w-3 h-3" /> Sync
                </Button>
              </div>
            </TableCell>
            <TableCell class="text-right pr-8">
              <div class="flex justify-end gap-1">
                <Button v-if="user.idAuth" variant="ghost" size="sm" class="h-9 px-3 premium-button text-slate-600 hover:bg-slate-900 hover:text-white" @click="openRoles(user)">
                  <ShieldCheck class="w-4 h-4 mr-2" /> {{ $t('users.table.roles', 'Rôles') }}
                </Button>
                <Button variant="ghost" size="icon" class="h-9 w-9 rounded-xl hover:bg-slate-200" @click="openEdit(user)"><Edit class="w-4 h-4 text-slate-600" /></Button>
                <Button variant="ghost" size="icon" class="h-9 w-9 rounded-xl hover:bg-red-50 text-red-500" @click="activeUser = user; dialogs.delete = true"><Trash2 class="w-4 h-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>

  <!-- Modals -->
  <ConfirmModal 
    :open="dialogs.sync" 
    :title="$t('commun.sync') + ' ?'" 
    :description="$t('users.sync_desc', 'Lier ce compte pour activer les accès.')"
    :confirm-text="$t('commun.sync')"
    variant="warning"
    :loading="processing"
    @close="dialogs.sync = false"
    @confirm="handleSync"
  />

  <ConfirmModal 
    :open="dialogs.delete" 
    :title="$t('commun.delete') + ' ?'" 
    :description="$t('users.delete_desc', 'Cette action est définitive et supprimera l\'utilisateur de la base.')"
    :confirm-text="$t('commun.delete')"
    variant="danger"
    :loading="processing"
    @close="dialogs.delete = false"
    @confirm="handleDelete"
  />

  <!-- Edit Dialog -->
  <Dialog v-model:open="dialogs.edit">
    <DialogContent class="sm:max-w-[600px] rounded-[2rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-8 bg-slate-50/50 border-b border-slate-100">
        <DialogTitle class="text-xl font-black text-slate-900">{{ formData.id ? $t('users.form.edit_title') : $t('users.form.add_title') }}</DialogTitle>
      </DialogHeader>
      <div class="p-8 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.full_name') }}</Label>
            <Input v-model="formData.nom" placeholder="Ex: Jean Dupont" class="h-11 rounded-lg border-slate-200" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.email') }}</Label>
            <Input v-model="formData.email" placeholder="email@exemple.com" class="h-11 rounded-lg border-slate-200" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.phone') }}</Label>
            <Input v-model="formData.telephone" placeholder="06..." class="h-11 rounded-lg border-slate-200" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.nature') }}</Label>
            <select v-model="formData.nature" class="w-full border border-slate-200 rounded-lg h-11 px-3 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-slate-900/10">
              <option value="C">{{ $t('users.natures.client') }}</option>
              <option value="A">{{ $t('users.natures.cabinet') }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{{ $t('users.form.authorizations') }}</Label>
            <div class="flex flex-col gap-3">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="formData.extranet" true-value="O" false-value="N" class="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 checked:bg-slate-900 checked:border-slate-900 transition-all" />
                  <Check class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition-all" />
                </div>
                <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{{ $t('users.form.extranet_access') }}</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="formData.mobile" true-value="O" false-value="N" class="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 checked:bg-slate-900 checked:border-slate-900 transition-all" />
                  <Check class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition-all" />
                </div>
                <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{{ $t('users.form.mobile_access') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100">
        <Button @click="handleSave" :disabled="processing" class="w-full h-12 rounded-xl bg-slate-900 font-bold shadow-lg hover:scale-[1.02] transition-transform">
          <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ $t('users.form.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Roles Dialog -->
  <Dialog v-model:open="dialogs.roles">
    <DialogContent class="sm:max-w-[480px] rounded-[2rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-8 bg-slate-900 text-white">
        <DialogTitle class="text-xl font-black tracking-tight">{{ $t('users.permissions', 'Permissions d\'accès') }}</DialogTitle>
        <DialogDescription class="text-slate-400 text-xs">{{ $t('users.assign_roles', 'Assignez des rôles pour') }} {{ activeUser?.nom }}.</DialogDescription>
      </DialogHeader>
      <div class="p-8 max-h-[350px] overflow-y-auto">
        <div class="grid gap-2">
          <button v-for="role in allRoles" :key="role.id"
            @click="selectedRoles.includes(role.name) ? selectedRoles = selectedRoles.filter(r => r !== role.name) : selectedRoles.push(role.name)"
            class="flex items-center justify-between p-4 rounded-xl border transition-all text-left"
            :class="selectedRoles.includes(role.name) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'">
            <span class="text-xs font-black uppercase tracking-widest">{{ role.name }}</span>
            <Check v-if="selectedRoles.includes(role.name)" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100">
        <div class="flex gap-3 w-full">
          <Button variant="ghost" class="flex-1 rounded-lg font-bold" @click="dialogs.roles = false">Fermer</Button>
          <Button @click="handleSaveRoles" :disabled="processing" class="flex-1 rounded-lg bg-slate-900 font-bold shadow-lg">
            <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            Mettre à jour
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>