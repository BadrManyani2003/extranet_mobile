<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Smartphone } from 'lucide-vue-next'
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
const formData = ref({
  id: 0,
  idAuth: '',
  nom: '',
  email: '',
  telephone: '',
  nature: 'A',
  extranet: 'O',
  mobile: 'N'
})

const natureLabel = computed(() => {
  if (formData.value.nature === 'A') return t('users.natures.cabinet')
  if (formData.value.nature === 'P') return t('users.natures.poste')
  if (formData.value.nature === 'C') return t('users.natures.client')
  if (formData.value.nature === 'E') return t('users.natures.expert')
  return formData.value.nature || ''
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.user) {
      formData.value = { ...props.user }
    } else {
      formData.value = {
        id: 0,
        idAuth: '',
        nom: '',
        email: '',
        telephone: '',
        nature: 'A',
        extranet: 'O',
        mobile: 'N'
      }
    }
  }
})

const handleSave = async () => {
  processing.value = true
  try {
    await api.admin.saveUser(formData.value)
    toast.success(t('users.toast_save_success'))
    emit('saved')
    emit('close')
  } catch (e: any) {
    toast.error(e.message || t('users.toast_save_error'))
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="w-[92%] sm:max-w-[720px] max-h-[90vh] !flex !flex-col !gap-0 !p-0 rounded-[2rem] shadow-2xl overflow-hidden border-none font-['Outfit'] bg-white">
      <DialogHeader class="p-8 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <DialogTitle class="text-xl font-black text-slate-900">
          {{ formData.id ? $t('users.form.edit_title') : $t('users.form.add_title') }}
        </DialogTitle>
      </DialogHeader>

      <div class="p-8 space-y-6 flex-1 overflow-y-auto">
        <div class="space-y-1.5">
          <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.full_name') }}</Label>
          <Input v-model="formData.nom" :placeholder="$t('users.form.full_name_placeholder')" class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.email') }}</Label>
            <Input v-model="formData.email" :placeholder="$t('users.form.email_placeholder')" class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.phone') }}</Label>
            <Input v-model="formData.telephone" :placeholder="$t('users.form.phone_placeholder')" class="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-900/10" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Nature (Affiché en lecture seule / désactivé) -->
          <div class="space-y-1.5">
            <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400">{{ $t('users.form.nature') }}</Label>
            <input :value="natureLabel" disabled class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 font-bold shadow-sm cursor-not-allowed focus-visible:outline-none" />
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
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm transition-colors duration-200" :class="formData.extranet === 'O' ? 'bg-primary text-primary-foreground' : 'group-hover:bg-slate-200'">
                  <Globe class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900 transition-colors" :class="formData.extranet === 'O' ? 'text-slate-950' : 'text-slate-700'">{{ $t('users.form.extranet_access') }}</div>
                  <div class="text-xs text-slate-400 font-medium mt-0.5">{{ $t('users.form.extranet_access_desc') }}</div>
                </div>
              </div>
              
              <!-- Bascule de style Switch Toggle -->
              <div 
                class="w-10 h-6 rounded-full p-0.5 transition-colors duration-350 ease-out"
                :class="formData.extranet === 'O' ? 'bg-primary' : 'bg-slate-200'"
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
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm transition-colors duration-200" :class="formData.mobile === 'O' ? 'bg-primary text-primary-foreground' : 'group-hover:bg-slate-200'">
                  <Smartphone class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900 transition-colors" :class="formData.mobile === 'O' ? 'text-slate-950' : 'text-slate-700'">{{ $t('users.form.mobile_access') }}</div>
                  <div class="text-xs text-slate-400 font-medium mt-0.5">{{ $t('users.form.mobile_access_desc') }}</div>
                </div>
              </div>
              
              <!-- Bascule de style Switch Toggle -->
              <div 
                class="w-10 h-6 rounded-full p-0.5 transition-colors duration-350 ease-out"
                :class="formData.mobile === 'O' ? 'bg-primary' : 'bg-slate-200'"
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
        <Button @click="handleSave" :disabled="processing" class="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all">
          <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ formData.id ? $t('users.form.save') : $t('users.form.create') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
