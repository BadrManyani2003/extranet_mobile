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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits(['close', 'submit'])

const sujet = ref('')
const nature = ref('S')
const message = ref('')

watch(() => props.open, (newVal) => {
  if (newVal) {
    sujet.value = ''
    nature.value = 'S'
    message.value = ''
  }
})

const handleSubmit = () => {
  if (!sujet.value.trim() || !message.value.trim()) return
  emit('submit', {
    sujet: sujet.value.trim(),
    nature: nature.value,
    message: message.value.trim()
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[500px] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit'] bg-white">
      <DialogHeader class="p-10 bg-slate-50/50 border-b border-slate-100">
        <DialogTitle class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('reclamations.new_request') }}</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">{{ $t('reclamations.subtitle') }}</DialogDescription>
      </DialogHeader>

      <div class="p-10 space-y-8">
        <div class="space-y-3">
          <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.subject') }}</Label>
          <Input v-model="sujet" :placeholder="$t('reclamations.subject_placeholder')" class="h-12 rounded-xl border-slate-200 bg-white font-bold" />
        </div>

        <div class="space-y-3">
          <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.nature') }}</Label>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="n in [
              {id:'S', l: $t('reclamations.nature_s')}, 
              {id:'C', l: $t('reclamations.nature_c')}, 
              {id:'I', l: $t('reclamations.nature_i')}, 
              {id:'D', l: $t('reclamations.nature_d')}
            ]" :key="n.id"
              @click="nature = n.id"
              :class="nature === n.id ? 'bg-primary text-primary-foreground' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
              class="h-10 rounded-xl text-[14px] font-bold uppercase tracking-tight transition-all">
              {{ n.l }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <Label class="text-[14px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ $t('reclamations.message') }}</Label>
          <Textarea v-model="message" :placeholder="$t('reclamations.message_placeholder')" class="min-h-[120px] rounded-xl border-slate-200 bg-white font-bold resize-none" />
        </div>
      </div>

      <DialogFooter class="p-10 bg-slate-50/50 border-t border-slate-100">
        <Button 
          @click="handleSubmit" 
          :disabled="!sujet || !message || loading" 
          class="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-xl transition-all"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ $t('reclamations.send') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
