<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Loader2, FolderOpen } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { useI18n } from 'vue-i18n'
import { toast } from '@/components/ui/sonner'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  doc: any
}>()

const emit = defineEmits(['close'])

const loadingDoc = ref(false)
const viewerSrc = ref<string | null>(null)
const viewerError = ref('')
const docMimeType = ref('')

const fetchDocumentContent = async (docId: number) => {
  loadingDoc.value = true
  // Revoke old object URL if exists
  if (viewerSrc.value && viewerSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(viewerSrc.value)
  }
  viewerSrc.value = null
  viewerError.value = ''
  docMimeType.value = ''
  try {
    const result = await api.document.getDocumentById(docId)
    if (!result?.document) throw new Error(t('documents.empty_content'))

    const raw = result.document as string
    let mimeType = 'application/octet-stream'
    const header = atob(raw.slice(0, 8))
    if (header.startsWith('%PDF'))          mimeType = 'application/pdf'
    else if (header.startsWith('\xFF\xD8')) mimeType = 'image/jpeg'
    else if (header.startsWith('\x89PNG'))  mimeType = 'image/png'
    else if (header.startsWith('GIF'))      mimeType = 'image/gif'

    docMimeType.value = mimeType

    // Convert base64 to Blob URL
    const byteCharacters = atob(raw)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    
    viewerSrc.value = URL.createObjectURL(blob)
  } catch (err: any) {
    viewerError.value = err?.message || t('documents.toast_load_error')
  } finally {
    loadingDoc.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.doc?.id) {
    fetchDocumentContent(props.doc.id)
  } else {
    if (viewerSrc.value && viewerSrc.value.startsWith('blob:')) {
      URL.revokeObjectURL(viewerSrc.value)
    }
    viewerSrc.value = null
    viewerError.value = ''
    docMimeType.value = ''
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const isImage = (src: string | null) =>
  docMimeType.value.startsWith('image/')

const isPdf = (src: string | null) =>
  docMimeType.value === 'application/pdf'
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[780px] max-h-[90vh] flex flex-col font-['Outfit'] bg-white">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ $t('documents.view_title') }}</DialogTitle>
        <DialogDescription>{{ $t('documents.view_desc') }}</DialogDescription>
      </DialogHeader>

      <!-- Contenu -->
      <div class="flex-1 overflow-auto mt-4 min-h-[300px] bg-slate-100 rounded-xl flex items-center justify-center">
        <!-- Chargement -->
        <div v-if="loadingDoc" class="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 class="w-10 h-10 animate-spin text-primary" />
          <p class="text-sm font-bold">{{ $t('documents.loading') }}</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="viewerError" class="text-center p-8">
          <p class="text-sm font-bold text-red-500">{{ viewerError }}</p>
        </div>

        <!-- Image -->
        <img
          v-else-if="isImage(viewerSrc)"
          :src="viewerSrc!"
          alt="Document"
          class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
        />

        <!-- PDF -->
        <iframe
          v-else-if="isPdf(viewerSrc)"
          :src="viewerSrc!"
          class="w-full h-[60vh] rounded-lg border-0"
          :title="$t('documents.pdf_title')"
        />

        <!-- Autre format -->
        <div v-else-if="viewerSrc" class="text-center p-8 space-y-3">
          <FolderOpen class="w-12 h-12 text-slate-400 mx-auto" />
          <p class="text-sm font-bold text-slate-600">{{ $t('documents.unsupported_format') }}</p>
          <a
            :href="viewerSrc"
            :download="`document-${doc?.id}`"
            class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            {{ $t('commun.download') }}
          </a>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
