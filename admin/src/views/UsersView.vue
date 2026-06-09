<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, RefreshCcw, ShieldCheck, UserCircle, Users } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import UserFormDialog from '@/components/shared/UserFormDialog.vue'
import UserRolesDialog from '@/components/shared/UserRolesDialog.vue'
import UserSimulationsDialog from '@/components/shared/UserSimulationsDialog.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// -- States
const users = ref<any[]>([])
const loading = ref(true)
const processing = ref(false)

const dialogs = ref({
  edit: false,
  roles: false,
  delete: false,
  sync: false,
  simulations: false
})

const activeUser = ref<any>(null)

// -- Actions
const fetchUsers = async () => {
  loading.value = true
  try { users.value = await api.admin.getUsers() } 
  catch (e: any) { toast.error(e.message || t('users.toast_load_error')) } 
  finally { loading.value = false }
}

const openEdit = (user: any = null) => {
  activeUser.value = user
  dialogs.value.edit = true
}

const openRoles = (user: any) => {
  activeUser.value = user
  dialogs.value.roles = true
}

const handleSync = async () => {
  if (!activeUser.value) return
  processing.value = true
  try {
    await api.admin.syncKeycloak(activeUser.value.id)
    toast.success(t('users.toast_sync_success'))
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
    toast.success(t('users.toast_delete_success'))
    dialogs.value.delete = false
    fetchUsers()
  } catch (e: any) { toast.error(e.message) }
  finally { processing.value = false }
}

const openSimulations = (user: any) => {
  activeUser.value = user
  dialogs.value.simulations = true
}

onMounted(() => {
  fetchUsers()
})
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
      <Table class="border-t border-slate-100 w-full min-w-[1000px]">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="table-header-text min-w-[260px]">{{ $t('users.table.name') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.email') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.nature') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.roles', 'Rôles') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('users.table.status') }}</TableHead>
            <TableHead class="text-right table-header-text pr-8">{{ $t('users.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in items" :key="user.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                  <UserCircle class="w-6 h-6" />
                </div>
                <div>
                  <div class="font-bold text-slate-900 tracking-tight text-base">{{ user.nom }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-700">{{ user.email }}</span>
                <span class="text-[14px] text-slate-400 font-medium mt-0.5">{{ user.telephone || '---' }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge v-if="user.nature === 'C'" variant="secondary" class="bg-emerald-50 text-emerald-600 border-emerald-100 text-[14px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.client') }}</Badge>
              <Badge v-else-if="user.nature === 'A'" variant="secondary" class="bg-orange-50 text-orange-600 border-orange-100 text-[14px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.cabinet') }}</Badge>
              <Badge v-else-if="user.nature === 'E'" variant="secondary" class="bg-blue-50 text-blue-600 border-blue-100 text-[14px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.expert') }}</Badge>
              <Badge v-else-if="user.nature === 'P'" variant="secondary" class="bg-indigo-50 text-indigo-600 border-indigo-100 text-[14px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{{ $t('users.natures.poste') }}</Badge>
              <span v-else class="text-slate-300 italic text-[14px]">{{ user.nature || '-' }}</span>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1 max-w-[280px]">
                <Badge v-for="role in (user.roles?.split(', ') || [])" :key="role" 
                  class="bg-white border border-slate-100 text-slate-500 text-[14px] font-black uppercase tracking-tight py-0.5 px-1.5 shadow-sm">
                  {{ role }}
                </Badge>
                <span v-if="!user.roles" class="text-[14px] text-slate-300 font-bold uppercase tracking-widest italic">{{ $t('statuts.standard') }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1.5">
                <div v-if="user.idAuth" class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span class="text-emerald-600 text-[14px] font-black uppercase tracking-widest">{{ $t('statuts.actif') }}</span>
                </div>
                <Button v-else variant="ghost" size="sm" class="h-8 gap-2 text-[14px] text-orange-600 font-black hover:bg-orange-50 rounded-xl px-2" @click="activeUser = user; dialogs.sync = true">
                  <RefreshCcw class="w-3 h-3" /> {{ $t('statuts.sync') }}
                </Button>
              </div>
            </TableCell>
            <TableCell class="text-right pr-8">
              <div class="flex justify-end gap-1">
                <Button v-if="['A', 'E', 'P'].includes(user.nature) || user.roles?.toLowerCase().includes('admin') || user.roles?.toLowerCase().includes('commercial')" variant="ghost" size="sm" class="h-9 px-3 premium-button text-slate-600 hover:bg-primary hover:text-primary-foreground" @click="openSimulations(user)">
                  <Users class="w-4 h-4 mr-2" /> {{ $t('statuts.simulations') }}
                </Button>
                <Button v-if="user.idAuth" variant="ghost" size="sm" class="h-9 px-3 premium-button text-slate-600 hover:bg-primary hover:text-primary-foreground" @click="openRoles(user)">
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

  <!-- Form Dialog -->
  <UserFormDialog
    :open="dialogs.edit"
    :user="activeUser"
    @saved="fetchUsers"
    @close="dialogs.edit = false"
  />

  <!-- Roles Dialog -->
  <UserRolesDialog
    :open="dialogs.roles"
    :user="activeUser"
    @saved="fetchUsers"
    @close="dialogs.roles = false"
  />

  <!-- Simulations Dialog -->
  <UserSimulationsDialog
    :open="dialogs.simulations"
    :user="activeUser"
    @close="dialogs.simulations = false"
  />
</template>

