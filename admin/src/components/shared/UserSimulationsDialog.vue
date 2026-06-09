<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Search, UserPlus, Users, Trash2 } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  user: any
}>()

const emit = defineEmits(['close'])

const processing = ref(false)
const allClients = ref<any[]>([])
const simulationClients = ref<any[]>([])
const selectedClientId = ref<number | null>(null)

// Dropdown/Search state
const clientSearchQuery = ref('')
const isClientDropdownOpen = ref(false)
const clientDropdownRef = ref<HTMLElement | null>(null)

const fetchAssociatedClients = async (userId: number) => {
  try {
    simulationClients.value = await api.admin.getSimulationClients(userId)
  } catch (e: any) {
    toast.error(e.message || t('users.toast_simulation_load_error'))
  }
}

const fetchAllClients = async () => {
  try {
    allClients.value = await api.admin.getClients()
  } catch (e) {
    console.error("Erreur chargement clients:", e)
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.user) {
    simulationClients.value = []
    selectedClientId.value = null
    clientSearchQuery.value = ''
    isClientDropdownOpen.value = false
    
    await fetchAssociatedClients(props.user.id)
    
    if (allClients.value.length === 0) {
      await fetchAllClients()
    }
  }
})

const handleAddSimulationClient = async () => {
  if (!props.user || !selectedClientId.value) return
  processing.value = true
  try {
    await api.admin.addSimulationClient(props.user.id, selectedClientId.value)
    toast.success(t('users.toast_simulation_add_success'))
    await fetchAssociatedClients(props.user.id)
    selectedClientId.value = null
  } catch (e: any) {
    toast.error(e.message || t('users.toast_simulation_add_error'))
  } finally {
    processing.value = false
  }
}

const handleDeleteSimulationClient = async (clientId: number) => {
  if (!props.user) return
  try {
    await api.admin.deleteSimulationClient(props.user.id, clientId)
    toast.success(t('users.toast_simulation_delete_success'))
    await fetchAssociatedClients(props.user.id)
  } catch (e: any) {
    toast.error(e.message || t('users.toast_simulation_delete_error'))
  }
}

const filteredClientsForSimulation = computed(() => {
  const query = clientSearchQuery.value.toLowerCase().trim()
  const entreprises = allClients.value.filter(c => c.particulier === 'N')
  if (!query) return entreprises
  return entreprises.filter(c => 
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
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="w-[92%] sm:max-w-[720px] max-h-[90vh] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit'] bg-white">
      <DialogHeader class="p-8 bg-primary text-primary-foreground shrink-0">
        <DialogTitle class="text-xl font-black tracking-tight text-white">{{ $t('users.simulation.title') }}</DialogTitle>
        <DialogDescription class="text-slate-200 text-xs">{{ $t('users.simulation.desc', { name: user?.nom }) }}</DialogDescription>
      </DialogHeader>
      
      <div class="p-8 space-y-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Add Client Selection Section (Top Stacked Card) -->
        <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <UserPlus class="w-4 h-4 text-white" />
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
                    :class="selectedClientId === client.id ? 'bg-primary text-primary-foreground' : 'text-slate-700 hover:bg-slate-50'"
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
              class="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-primary-foreground shadow-lg text-xs"
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
                class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm group/item hover:border-primary/20 transition-colors"
              >
                <div class="min-w-0 pr-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-slate-100 group-hover/item:bg-primary group-hover/item:text-primary-foreground flex items-center justify-center text-slate-500 transition-colors font-bold text-xs uppercase shadow-sm">
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
        <Button variant="outline" class="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-100" @click="emit('close')">{{ $t('commun.close') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
