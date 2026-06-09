<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  sinistre: any
}>()

const emit = defineEmits(['close', 'success'])

const { t } = useI18n()

const uploadType = ref('')
const uploadFile = ref<File | null>(null)
const uploadLoading = ref(false)
const uploadError = ref('')

watch(() => props.open, (newVal) => {
  if (newVal) {
    uploadType.value = ''
    uploadFile.value = null
    uploadError.value = ''
  }
})

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  uploadFile.value = target.files?.[0] || null
  uploadError.value = ''
}

const handleUpload = async () => {
  uploadError.value = ''

  if (!uploadFile.value || !uploadType.value.trim()) {
    uploadError.value = t('sinistres.upload_doc_required')
    return
  }

  const sinId = props.sinistre?.id ?? props.sinistre?.Id ?? props.sinistre?.ID
  if (!sinId) {
    uploadError.value = t('sinistres.upload_doc_error')
    return
  }

  const MAX_SIZE = 20 * 1024 * 1024 // 20 Mo
  if (uploadFile.value.size > MAX_SIZE) {
    uploadError.value = t('sinistres.upload_doc_size_error')
    return
  }

  uploadLoading.value = true
  try {
    // Lecture du fichier en base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(uploadFile.value!)
    })

    await api.document.uploadDocument(
      'Sinistre',
      sinId,
      uploadType.value.trim(),
      fileBase64
    )

    toast.success(t('sinistres.upload_doc_success'))
    emit('success')
    emit('close')
  } catch (err: any) {
    uploadError.value = err?.message || t('sinistres.upload_doc_error')
  } finally {
    uploadLoading.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[480px] font-['Outfit'] bg-white">
      <DialogHeader>
        <DialogTitle class="text-lg font-black text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload class="w-4 h-4 text-primary" />
          </div>
          {{ $t('sinistres.upload_doc_title') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          Formulaire pour charger un document justificatif pour le sinistre sélectionné.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <!-- Type de document -->
        <div class="space-y-2">
          <Label for="doc-type" class="text-sm font-bold text-slate-700">
            {{ $t('sinistres.upload_doc_type_label') }}
            <span class="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            id="doc-type"
            v-model="uploadType"
            :placeholder="$t('sinistres.upload_doc_type_placeholder')"
            class="border-slate-200 focus:border-primary focus:ring-primary/20"
          />
        </div>

        <!-- Fichier -->
        <div class="space-y-2">
          <Label for="doc-file" class="text-sm font-bold text-slate-700">
            {{ $t('sinistres.upload_doc_file_label') }}
            <span class="text-red-500 ml-0.5">*</span>
          </Label>
          <div class="relative">
            <label
              for="doc-file"
              class="flex items-center gap-3 w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 p-4 transition-all duration-200"
            >
              <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <FileText class="w-5 h-5 text-slate-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p v-if="uploadFile" class="text-sm font-bold text-slate-800 truncate">{{ uploadFile.name }}</p>
                <p v-else class="text-sm text-slate-400">PDF, JPG, PNG, DOCX... (max 20 Mo)</p>
              </div>
            </label>
            <input
              id="doc-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls"
              class="sr-only"
              @change="onFileChange"
            />
          </div>
        </div>

        <!-- Erreur -->
        <p v-if="uploadError" class="text-sm text-red-500 font-medium flex items-center gap-1.5">
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ uploadError }}
        </p>
      </div>

      <DialogFooter class="gap-2 pt-2">
        <Button
          variant="outline"
          :disabled="uploadLoading"
          class="font-bold"
          @click="emit('close')"
        >
          {{ $t('commun.cancel') }}
        </Button>
        <Button
          :disabled="uploadLoading || !uploadFile || !uploadType.trim()"
          class="gap-2 font-bold text-white bg-primary hover:bg-primary/95"
          @click="handleUpload"
        >
          <Loader2 v-if="uploadLoading" class="w-4 h-4 animate-spin" />
          <Upload v-else class="w-4 h-4" />
          {{ $t('commun.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
