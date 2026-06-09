<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  user: any
}>()

const emit = defineEmits(['close', 'saved'])

const processing = ref(false)
const selectedRoles = ref<string[]>([])
const allRoles = ref<any[]>([])

const fetchRoles = async () => {
  try {
    allRoles.value = await api.admin.getRoles()
  } catch (e: any) {
    console.error(e)
    toast.error(t('users.toast_roles_load_error'))
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.user) {
    selectedRoles.value = props.user.roles 
      ? props.user.roles.split(', ').map((r: string) => r.trim().toLowerCase()) 
      : []
    
    if (allRoles.value.length === 0) {
      await fetchRoles()
    }
  }
})

const toggleRole = (roleName: string) => {
  const nameLower = roleName.toLowerCase()
  if (selectedRoles.value.includes(nameLower)) {
    selectedRoles.value = selectedRoles.value.filter(r => r !== nameLower)
  } else {
    selectedRoles.value.push(nameLower)
  }
}

const handleSaveRoles = async () => {
  if (!props.user) return
  processing.value = true
  try {
    const rolesToAssign = allRoles.value.filter(r => 
      selectedRoles.value.includes(r.name.toLowerCase())
    )
    await api.admin.updateUserRoles(props.user.id, props.user.idAuth, rolesToAssign)
    toast.success(t('users.toast_roles_update_success'))
    emit('saved')
    emit('close')
  } catch (e: any) {
    toast.error(e.message || t('users.toast_roles_update_error'))
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="w-[92%] sm:max-w-[480px] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit'] bg-white">
      <DialogHeader class="p-8 bg-primary text-primary-foreground">
        <DialogTitle class="text-xl font-black tracking-tight text-white">{{ $t('users.permissions') }}</DialogTitle>
        <DialogDescription class="text-slate-200 text-xs">{{ $t('users.assign_roles') }} {{ user?.nom }}.</DialogDescription>
      </DialogHeader>

      <div class="p-8 max-h-[360px] overflow-y-auto">
        <div class="grid gap-2">
          <button v-for="role in allRoles" :key="role.id"
            @click="toggleRole(role.name)"
            class="flex items-center justify-between p-4 rounded-xl border transition-all text-left"
            :class="selectedRoles.includes(role.name.toLowerCase()) ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'">
            <span class="text-xs font-black uppercase tracking-widest">{{ role.name }}</span>
            <Check v-if="selectedRoles.includes(role.name.toLowerCase())" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100">
        <div class="flex gap-3 w-full">
          <Button variant="outline" class="flex-1 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-100" @click="emit('close')">{{ $t('commun.close') }}</Button>
          <Button @click="handleSaveRoles" :disabled="processing" class="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg">
            <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ $t('commun.save') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
