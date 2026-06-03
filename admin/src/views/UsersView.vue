<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, RefreshCcw, ShieldCheck, Check, UserCircle, Users, Globe, Smartphone, Search, UserPlus } from 'lucide-vue-next'
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
  sync: false,
  simulations: false
})

const activeUser = ref<any>(null)
const selectedRoles = ref<string[]>([])
const formData = ref({ id: 0, idAuth: '', nom: '', email: '', telephone: '', nature: 'P', extranet: 'N', mobile: 'N' })

const allClients = ref<any[]>([])
const simulationClients = ref<any[]>([])
const selectedClientId = ref<number | null>(null)

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
  selectedRoles.value = user.roles ? user.roles.split(', ').map((r: string) => r.trim().toLowerCase()) : []
  dialogs.value.roles = true
  if (allRoles.value.length === 0) {
    try { allRoles.value = await api.admin.getRoles() } catch (e) { console.error(e) }
  }
}

const handleSaveRoles = async () => {
  if (!activeUser.value) return
  processing.value = true
  try {
    const rolesToAssign = allRoles.value.filter(r => selectedRoles.value.includes(r.name.toLowerCase()))
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

const openSimulations = async (user: any) => {
  activeUser.value = user
  simulationClients.value = []
  selectedClientId.value = null
  dialogs.value.simulations = true
  
  try {
    simulationClients.value = await api.admin.getSimulationClients(user.id)
  } catch (e: any) {
    toast.error(e.message || "Erreur de chargement")
  }
  
  if (allClients.value.length === 0) {
    try {
      allClients.value = await api.admin.getClients()
    } catch (e) {
      console.error("Erreur chargement clients:", e)
    }
  }
}

const handleAddSimulationClient = async () => {
  if (!activeUser.value || !selectedClientId.value) return
  processing.value = true
  try {
    await api.admin.addSimulationClient(activeUser.value.id, selectedClientId.value)
    toast.success("Client ajouté aux simulations")
    simulationClients.value = await api.admin.getSimulationClients(activeUser.value.id)
    selectedClientId.value = null
  } catch (e: any) {
    toast.error(e.message || "Erreur lors de l'ajout")
  } finally {
    processing.value = false
  }
}

const handleDeleteSimulationClient = async (clientId: number) => {
  if (!activeUser.value) return
  try {
    await api.admin.deleteSimulationClient(activeUser.value.id, clientId)
    toast.success("Client supprimé des simulations")
    simulationClients.value = await api.admin.getSimulationClients(activeUser.value.id)
  } catch (e: any) {
    toast.error(e.message || "Erreur lors de la suppression")
  }
}

// -- Searchable Simulation Clients Dropdown
const clientSearchQuery = ref('')
const isClientDropdownOpen = ref(false)
const clientDropdownRef = ref<HTMLElement | null>(null)

const filteredClientsForSimulation = computed(() => {
  const query = clientSearchQuery.value.toLowerCase().trim()
  if (!query) return allClients.value
  return allClients.value.filter(c => 
    (c.raisonSociale || '').toLowerCase().includes(query) || 
    (c.email || '').toLowerCase().includes(query)
  )
})

const handleClickOutside = (event: MouseEvent) => {
  if (clientDropdownRef.value && !clientDropdownRef.value.contains(event.target as Node)) {
    isClientDropdownOpen.value = false
  }
}

onMounted(() => {
  fetchUsers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
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
              <span v-else class="text-slate-300 italic text-[14px]">{{ user.nature || '-' }}</span>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1 max-w-[280px]">
                <Badge v-for="role in (user.roles?.split(', ') || [])" :key="role" 
                  class="bg-white border border-slate-100 text-slate-500 text-[14px] font-black uppercase tracking-tight py-0.5 px-1.5 shadow-sm">
                  {{ role }}
                </Badge>
                <span v-if="!user.roles" class="text-[14px] text-slate-300 font-bold uppercase tracking-widest italic">Standard</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1.5">
                <div v-if="user.idAuth" class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span class="text-emerald-600 text-[14px] font-black uppercase tracking-widest">Actif</span>
                </div>
                <Button v-else variant="ghost" size="sm" class="h-8 gap-2 text-[14px] text-orange-600 font-black hover:bg-orange-50 rounded-xl px-2" @click="activeUser = user; dialogs.sync = true">
                  <RefreshCcw class="w-3 h-3" /> Sync
                </Button>
              </div>
            </TableCell>
            <TableCell class="text-right pr-8">
              <div class="flex justify-end gap-1">
                <Button v-if="user.nature === 'A' || user.roles?.toLowerCase().includes('admin') || user.roles?.toLowerCase().includes('commercial')" variant="ghost" size="sm" class="h-9 px-3 premium-button text-slate-600 hover:bg-slate-900 hover:text-white" @click="openSimulations(user)">
                  <Users class="w-4 h-4 mr-2" /> Simulations
                </Button>
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
    <DialogContent class="w-[92%] sm:max-w-[720px] max-h-[90vh] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-8 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <DialogTitle class="text-xl font-black text-slate-900">{{ formData.id ? $t('users.form.edit_title') : $t('users.form.add_title') }}</DialogTitle>
      </DialogHeader>
      <div class="p-8 space-y-6 flex-1 overflow-y-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.full_name') }}</Label>
            <Input v-model="formData.nom" placeholder="Ex: Jean Dupont" class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.email') }}</Label>
            <Input v-model="formData.email" placeholder="email@exemple.com" class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.phone') }}</Label>
            <Input v-model="formData.telephone" placeholder="06..." class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.nature') }}</Label>
            <select v-model="formData.nature" class="w-full border border-slate-200 rounded-xl h-11 px-3 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-slate-900/10 shadow-sm transition-all cursor-pointer">
              <option value="C">{{ $t('users.natures.client') }}</option>
              <option value="A">{{ $t('users.natures.cabinet') }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-3">
          <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400 block">{{ $t('users.form.authorizations') }}</Label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Carte interactive d'accès Extranet -->
            <div 
              @click="formData.extranet = formData.extranet === 'O' ? 'N' : 'O'"
              class="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 group hover:bg-slate-50/50"
              :class="formData.extranet === 'O' ? 'border-slate-950 bg-slate-950/[0.02] ring-1 ring-slate-950' : 'border-slate-100 bg-white hover:border-slate-200'"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm transition-colors duration-200" :class="formData.extranet === 'O' ? 'bg-slate-900 text-white' : 'group-hover:bg-slate-200'">
                  <Globe class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900 transition-colors" :class="formData.extranet === 'O' ? 'text-slate-950' : 'text-slate-700'">{{ $t('users.form.extranet_access') }}</div>
                  <div class="text-xs text-slate-400 font-medium mt-0.5">Portail Web MyAsk</div>
                </div>
              </div>
              
              <!-- Bascule de style Switch Toggle -->
              <div 
                class="w-10 h-6 rounded-full p-0.5 transition-colors duration-350 ease-out"
                :class="formData.extranet === 'O' ? 'bg-slate-900' : 'bg-slate-200'"
              >
                <div 
                  class="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-350 ease-out"
                  :class="formData.extranet === 'O' ? 'translate-x-4' : 'translate-x-0'"
                ></div>
              </div>
            </div>

            <!-- Carte interactive d'accès Mobile -->
            <div 
              @click="formData.mobile = formData.mobile === 'O' ? 'N' : 'O'"
              class="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 group hover:bg-slate-50/50"
              :class="formData.mobile === 'O' ? 'border-slate-950 bg-slate-950/[0.02] ring-1 ring-slate-950' : 'border-slate-100 bg-white hover:border-slate-200'"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm transition-colors duration-200" :class="formData.mobile === 'O' ? 'bg-slate-900 text-white' : 'group-hover:bg-slate-200'">
                  <Smartphone class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900 transition-colors" :class="formData.mobile === 'O' ? 'text-slate-950' : 'text-slate-700'">{{ $t('users.form.mobile_access') }}</div>
                  <div class="text-xs text-slate-400 font-medium mt-0.5">Application Mobile</div>
                </div>
              </div>
              
              <!-- Bascule de style Switch Toggle -->
              <div 
                class="w-10 h-6 rounded-full p-0.5 transition-colors duration-350 ease-out"
                :class="formData.mobile === 'O' ? 'bg-slate-900' : 'bg-slate-200'"
              >
                <div 
                  class="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-350 ease-out"
                  :class="formData.mobile === 'O' ? 'translate-x-4' : 'translate-x-0'"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100 shrink-0">
        <Button @click="handleSave" :disabled="processing" class="w-full h-12 rounded-xl bg-slate-900 font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all">
          <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ $t('users.form.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Roles Dialog -->
  <Dialog v-model:open="dialogs.roles">
    <DialogContent class="w-[92%] sm:max-w-[480px] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-8 bg-slate-900 text-white">
        <DialogTitle class="text-xl font-black tracking-tight">{{ $t('users.permissions') }}</DialogTitle>
        <DialogDescription class="text-slate-400 text-xs">{{ $t('users.assign_roles') }} {{ activeUser?.nom }}.</DialogDescription>
      </DialogHeader>
      <div class="p-8 max-h-[350px] overflow-y-auto">
        <div class="grid gap-2">
          <button v-for="role in allRoles" :key="role.id"
            @click="selectedRoles.includes(role.name.toLowerCase()) ? selectedRoles = selectedRoles.filter(r => r !== role.name.toLowerCase()) : selectedRoles.push(role.name.toLowerCase())"
            class="flex items-center justify-between p-4 rounded-xl border transition-all text-left"
            :class="selectedRoles.includes(role.name.toLowerCase()) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'">
            <span class="text-xs font-black uppercase tracking-widest">{{ role.name }}</span>
            <Check v-if="selectedRoles.includes(role.name.toLowerCase())" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100">
        <div class="flex gap-3 w-full">
          <Button variant="ghost" class="flex-1 rounded-xl font-bold" @click="dialogs.roles = false">{{ $t('commun.close') }}</Button>
          <Button @click="handleSaveRoles" :disabled="processing" class="flex-1 rounded-xl bg-slate-900 font-bold shadow-lg">
            <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ $t('commun.save') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Simulations Dialog -->
  <Dialog v-model:open="dialogs.simulations">
    <DialogContent class="w-[92%] sm:max-w-[720px] max-h-[90vh] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit']">
      <DialogHeader class="p-8 bg-slate-900 text-white shrink-0">
        <DialogTitle class="text-xl font-black tracking-tight">{{ $t('users.simulation.title') }}</DialogTitle>
        <DialogDescription class="text-slate-400 text-xs">{{ $t('users.simulation.desc', { name: activeUser?.nom }) }}</DialogDescription>
      </DialogHeader>
      
      <div class="p-8 space-y-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Add Client Selection Section (Top Stacked Card) -->
        <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <UserPlus class="w-4 h-4" />
            </div>
            <Label class="text-xs font-black uppercase tracking-widest text-slate-500">{{ $t('users.simulation.associate_title') }}</Label>
          </div>
          <p class="text-xs font-medium text-slate-400 leading-normal">
            {{ $t('users.simulation.associate_desc') }}
          </p>
          
          <div class="space-y-4 relative" ref="clientDropdownRef">
            <div class="relative">
              <!-- Select Trigger Button -->
              <button 
                type="button"
                @click="isClientDropdownOpen = !isClientDropdownOpen"
                class="w-full border border-slate-200 rounded-xl h-11 px-4 text-xs font-bold bg-white text-left flex items-center justify-between outline-none focus:ring-2 focus:ring-slate-900/10 shadow-sm transition-all hover:bg-slate-50/50"
              >
                <span :class="selectedClientId ? 'text-slate-900' : 'text-slate-400 font-medium'">
                  {{ selectedClientId ? allClients.find(c => c.id === selectedClientId)?.raisonSociale : $t('users.simulation.select_placeholder') }}
                </span>
                <!-- Chevron Down icon -->
                <svg class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0" :class="isClientDropdownOpen ? 'transform rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Content Panel -->
              <div 
                v-if="isClientDropdownOpen"
                class="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 space-y-2 max-h-[200px] flex flex-col font-['Outfit'] animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <!-- Search Input inside dropdown -->
                <div class="relative shrink-0">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    v-model="clientSearchQuery"
                    :placeholder="$t('users.simulation.search_placeholder')"
                    class="w-full bg-slate-50 border border-slate-100 rounded-xl h-9 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all"
                    @click.stop
                  />
                </div>

                <!-- Clients list -->
                <div class="flex-1 overflow-y-auto max-h-[130px] space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-100">
                  <button
                    v-if="filteredClientsForSimulation.length > 0"
                    v-for="client in filteredClientsForSimulation" 
                    :key="client.id"
                    type="button"
                    @click="selectedClientId = client.id; isClientDropdownOpen = false; clientSearchQuery = ''"
                    class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                    :class="selectedClientId === client.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'"
                  >
                    <span class="truncate pr-2">{{ client.raisonSociale }}</span>
                    <span v-if="client.email" class="text-[10px] opacity-60 font-medium font-mono truncate max-w-[120px] shrink-0">{{ client.email }}</span>
                  </button>
                  <div v-else class="text-center py-6 text-slate-400 text-xs italic font-medium">
                    {{ $t('users.simulation.no_client_found') }}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              @click="handleAddSimulationClient" 
              :disabled="processing || !selectedClientId" 
              class="w-full h-11 rounded-xl bg-slate-900 font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-white shadow-lg text-xs"
            >
              {{ $t('users.simulation.associate_button') }}
            </Button>
          </div>
        </div>

        <!-- Current Mapped Clients List (Bottom Stacked Card) -->
        <div class="space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div class="flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                <Users class="w-4 h-4" />
              </div>
              <Label class="text-xs font-black uppercase tracking-widest text-slate-500">{{ $t('users.simulation.authorized_clients') }}</Label>
            </div>
            <Badge variant="secondary" class="bg-slate-100 text-slate-600 border-none font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-sm">
              {{ $t('users.simulation.client_count', { count: simulationClients.length }) }}
            </Badge>
          </div>
          
          <div class="flex-1 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50 min-h-[100px] scrollbar-thin scrollbar-thumb-slate-200 flex flex-col">
            <div v-if="simulationClients.length === 0" class="text-center my-auto py-12 text-slate-400 text-xs italic font-medium shrink-0">
              {{ $t('users.simulation.no_associated_client') }}
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
              <div 
                v-for="client in simulationClients" 
                :key="client.id" 
                class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group/item hover:border-slate-200 transition-colors"
              >
                <div class="min-w-0 pr-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-slate-100 group-hover/item:bg-slate-900 group-hover/item:text-white flex items-center justify-center text-slate-500 transition-colors font-bold text-xs uppercase shadow-sm">
                    {{ client.raisonSociale?.charAt(0) || 'C' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 text-xs truncate">{{ client.raisonSociale }}</p>
                    <p class="text-[10px] text-slate-400 font-medium font-mono truncate mt-0.5">{{ client.email || '—' }}</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0 transition-colors" 
                  @click="handleDeleteSimulationClient(client.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100 shrink-0">
        <Button variant="outline" class="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-100" @click="dialogs.simulations = false">{{ $t('commun.close') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

