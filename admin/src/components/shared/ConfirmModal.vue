<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Trash2, HelpCircle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'success' | 'info' | 'warning'
  loading?: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const icons = {
  danger: Trash2,
  success: CheckCircle2,
  info: HelpCircle,
  warning: AlertCircle
}

const iconColors = {
  danger: 'text-red-600 bg-red-50',
  success: 'text-emerald-600 bg-emerald-50',
  info: 'text-slate-600 bg-slate-50',
  warning: 'text-orange-600 bg-orange-50'
}

const buttonVariants: Record<string, "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"> = {
  danger: 'destructive',
  success: 'default',
  info: 'default',
  warning: 'default'
}

</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[400px] rounded-[2rem] p-10 font-['Outfit'] border-none shadow-2xl">
      <div class="text-center space-y-6">
        <div :class="['w-20 h-20 rounded-full flex items-center justify-center mx-auto', iconColors[variant || 'info']]">
          <component :is="icons[variant || 'info']" class="w-10 h-10" />
        </div>
        
        <div class="space-y-2">
          <DialogTitle class="text-2xl font-black text-slate-900 tracking-tight">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" class="text-slate-500 font-medium leading-relaxed">
            {{ description }}
          </DialogDescription>
        </div>

        <div class="flex gap-4 pt-4">
          <Button variant="ghost" class="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-100" @click="emit('close')">
            {{ cancelText || $t('commun.cancel') }}
          </Button>
          <Button 
            :variant="buttonVariants[variant || 'info']" 
            class="flex-1 rounded-xl h-12 font-bold shadow-xl"
            :disabled="loading"
            @click="emit('confirm')"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            {{ confirmText || $t('commun.confirm') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
