<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FolderOpen, Search, Eye, Loader2, Filter, X,
  Calendar, User, Tag, CheckCircle2, Clock, Trash2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { api } from '@/lib/api'
import { toast } from 'vue-sonner'

const { t } = useI18n()

// ─── State ───────────────────────────────────────────────────────────────────
const documents     = ref<any[]>([])
const loading       = ref(false)
const showFilters   = ref(false)

// Filters
const filterNature      = ref('')
const filterUser        = ref('')
const filterDate        = ref('') // Contient la date YYYY-MM-DD
const searchQuery       = ref('')

// Formatage personnalisé pour l'affichage (JJ/MM/AAAA)
const filterDateFormatted = computed(() => {
  if (!filterDate.value) return ''
  const parts = filterDate.value.split('-') // YYYY-MM-DD
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return filterDate.value
})

// Pagination
const currentPage  = ref(1)
const itemsPerPage = 10

// Document viewer dialog state (handled in new tab)

// Delete confirmation modal state
const deleteModalOpen = ref(false)
const deleteLoading   = ref(false)
const docToDelete     = ref<number | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const uniqueNatures = computed(() => {
  const natures = documents.value.map(d => d.nature).filter(Boolean)
  return Array.from(new Set(natures)).sort()
})

const uniqueUsers = computed(() => {
  const users = documents.value.map(d => d.utilisateur).filter(Boolean)
  return Array.from(new Set(users)).sort()
})

const filteredDocuments = computed(() => {
  let result = documents.value

  if (filterNature.value) {
    result = result.filter(d => d.nature === filterNature.value)
  }

  if (filterUser.value) {
    result = result.filter(d => d.utilisateur === filterUser.value)
  }

  if (filterDate.value) {
    result = result.filter(d => {
      if (!d.dateCreation) return false
      const dDate = new Date(d.dateCreation).toISOString().split('T')[0]
      return dDate === filterDate.value
    })
  }

  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(d =>
      String(d.nature       || '').toLowerCase().includes(q) ||
      String(d.type         || '').toLowerCase().includes(q) ||
      String(d.utilisateur  || '').toLowerCase().includes(q)
    )
  }

  return result
})

const totalPages    = computed(() => Math.ceil(filteredDocuments.value.length / itemsPerPage))
const paginatedDocs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredDocuments.value.slice(start, start + itemsPerPage)
})

// ─── Methods ──────────────────────────────────────────────────────────────────
const fetchDocuments = async () => {
  loading.value = true
  try {
    documents.value = await api.document.getDocuments()
    currentPage.value = 1
  } catch (err: any) {
    console.error('[Documents] Erreur chargement:', err?.message)
    documents.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filterNature.value      = ''
  filterUser.value        = ''
  filterDate.value        = ''
  searchQuery.value       = ''
  currentPage.value       = 1
}

const openViewer = async (doc: any) => {
  // Open a new blank window immediately to bypass popup blockers
  const newTab = window.open('about:blank', '_blank')
  if (!newTab) {
    toast.error(t('documents.toast_popup_blocker'))
    return
  }

  newTab.document.write(`<p style="font-family: sans-serif; text-align: center; margin-top: 15%; font-weight: bold; color: #64748b;">${t('documents.loading')}</p>`)

  try {
    const result = await api.document.getDocumentById(doc.id)
    if (!result?.document) throw new Error(t('documents.empty_content'))

    const raw = result.document as string
    let mimeType = 'application/octet-stream'
    const header = atob(raw.slice(0, 8))
    if (header.startsWith('%PDF'))          mimeType = 'application/pdf'
    else if (header.startsWith('\xFF\xD8')) mimeType = 'image/jpeg'
    else if (header.startsWith('\x89PNG'))  mimeType = 'image/png'
    else if (header.startsWith('GIF'))      mimeType = 'image/gif'

    // Convert base64 to Blob URL
    const byteCharacters = atob(raw)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    const blobUrl = URL.createObjectURL(blob)

    newTab.location.href = blobUrl
  } catch (err: any) {
    newTab.close()
    toast.error(err?.message || t('documents.toast_load_error'))
  }
}

const openDeleteConfirm = (docId: number) => {
  docToDelete.value = docId
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!docToDelete.value) return
  deleteLoading.value = true
  try {
    await api.document.deleteDocument(docToDelete.value)
    toast.success(t('documents.delete_success'))
    deleteModalOpen.value = false
    await fetchDocuments()
  } catch (err: any) {
    toast.error(err?.message || t('documents.toast_delete_error'))
  } finally {
    deleteLoading.value = false
    docToDelete.value = null
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(fetchDocuments)
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Outfit']">

    <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">
          {{ $t('documents.title') }}
        </h2>
        <p class="text-slate-500 text-sm font-medium">{{ $t('documents.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="gap-2 font-bold rounded-xl border-slate-200 shadow-sm"
          @click="showFilters = !showFilters"
        >
          <Filter class="w-4 h-4" />
          {{ showFilters ? $t('documents.hide_filters') : $t('documents.show_filters') }}
        </Button>
      </div>
    </div>

    <!-- ── Filtres ───────────────────────────────────────────────────────────── -->
    <div v-show="showFilters" class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
      <div class="flex items-center gap-2 mb-1">
        <Filter class="w-4 h-4 text-primary" />
        <span class="text-sm font-black text-slate-700 uppercase tracking-widest">{{ $t('documents.filters') }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Nature -->
        <div class="space-y-1.5">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('documents.col_nature') }}</label>
          <select
            v-model="filterNature"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            @change="currentPage = 1"
          >
            <option value="">{{ $t('documents.all_natures') }}</option>
            <option v-for="n in uniqueNatures" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <!-- User / Client -->
        <div class="space-y-1.5">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('documents.col_user') }}</label>
          <select
            v-model="filterUser"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            @change="currentPage = 1"
          >
            <option value="">{{ $t('documents.all_users') }}</option>
            <option v-for="u in uniqueUsers" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>

        <!-- Date (dd/mm/yyyy) -->
        <div class="space-y-1.5">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('documents.col_date') }}</label>
          <div class="relative">
            <!-- Custom styled input container showing French format -->
            <div class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold flex items-center justify-between">
              <span :class="filterDate ? 'text-slate-700' : 'text-slate-400 font-medium'">
                {{ filterDateFormatted || 'JJ/MM/AAAA' }}
              </span>
              <Calendar class="w-4 h-4 text-slate-400" />
            </div>
            <!-- Invisible native date input layered on top to capture clicks and open datepicker -->
            <input
              v-model="filterDate"
              type="date"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="currentPage = 1"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-1">
        <Button
          class="gap-2 font-bold rounded-xl px-5"
          :disabled="loading"
          @click="fetchDocuments"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <Search v-else class="w-4 h-4" />
          {{ $t('documents.search_btn') }}
        </Button>
        <Button variant="ghost" class="gap-2 font-bold rounded-xl text-slate-500" @click="resetFilters">
          <X class="w-4 h-4" />
          {{ $t('documents.reset_btn') }}
        </Button>
      </div>
    </div>

    <!-- ── Tableau ───────────────────────────────────────────────────────────── -->
    <div class="border border-slate-200 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 overflow-hidden">

      <!-- Barre de recherche texte libre -->
      <div class="p-5 border-b border-slate-100 flex items-center gap-3">
        <div class="relative flex-1 max-w-sm group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('documents.search_placeholder')"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            @input="currentPage = 1"
          />
        </div>
        <span class="text-xs font-black text-slate-400 uppercase tracking-widest ml-auto">
          {{ filteredDocuments.length }} {{ $t('documents.results_count') }}
        </span>
      </div>

      <!-- État chargement -->
      <div v-if="loading" class="flex items-center justify-center p-20">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
      </div>

      <!-- Tableau -->
      <template v-else>
        <div v-if="paginatedDocs.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  {{ $t('documents.col_type') }}
                </th>
                <th class="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span class="flex items-center gap-1.5"><Tag class="w-3.5 h-3.5" /> {{ $t('documents.col_nature') }}</span>
                </th>
                <th class="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  {{ $t('documents.col_reference') }}
                </th>
                <th class="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span class="flex items-center gap-1.5"><User class="w-3.5 h-3.5" /> {{ $t('documents.col_user') }}</span>
                </th>
                <th class="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" /> {{ $t('documents.col_date') }}</span>
                </th>
                <th class="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  {{ $t('documents.col_transfere') }}
                </th>
                <th class="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  {{ $t('commun.actions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="doc in paginatedDocs"
                :key="doc.id"
                class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
              >
                <!-- Type -->
                <td class="py-4 px-6 max-w-[180px]">
                  <p class="text-sm font-bold text-slate-700 truncate" :title="doc.type">{{ doc.type }}</p>
                </td>
                <!-- Nature -->
                <td class="py-4 px-6">
                  <span class="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-black px-2.5 py-1 rounded-lg">
                    {{ doc.nature }}
                  </span>
                </td>
                <!-- Référence -->
                <td class="py-4 px-6">
                  <span class="text-sm font-bold text-slate-700">
                    {{ doc.reference || doc.identifiant }}
                  </span>
                </td>
                <!-- Utilisateur -->
                <td class="py-4 px-6">
                  <span class="text-sm font-bold text-slate-800">{{ doc.utilisateur }}</span>
                </td>
                <!-- Date -->
                <td class="py-4 px-6">
                  <span class="text-sm font-bold text-slate-700">{{ formatDate(doc.dateCreation) }}</span>
                </td>
                <!-- Transféré -->
                <td class="py-4 px-6 text-center">
                  <span v-if="doc.transfere === 'O'" class="inline-flex items-center gap-1 text-emerald-600 font-black text-xs">
                    <CheckCircle2 class="w-4 h-4" /> {{ $t('documents.transfere_oui') }}
                  </span>
                  <span v-else class="inline-flex items-center gap-1 text-slate-400 font-black text-xs">
                    <Clock class="w-4 h-4" /> {{ $t('documents.transfere_non') }}
                  </span>
                </td>
                <!-- Actions -->
                <td class="py-4 px-6 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl transition-all"
                      :title="$t('documents.view_btn')"
                      @click="openViewer(doc)"
                    >
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      :title="$t('commun.delete')"
                      @click="openDeleteConfirm(doc.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-20 gap-3">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FolderOpen class="w-8 h-8 text-slate-400" />
          </div>
          <p class="text-sm font-black text-slate-400 uppercase tracking-widest">{{ $t('documents.empty') }}</p>
        </div>

        <!-- Pagination -->
        <div class="border-t border-slate-100 p-6 flex items-center justify-between bg-slate-50/30">
          <p class="text-xs text-slate-400 font-black uppercase tracking-widest">
            {{ filteredDocuments.length }} {{ $t('documents.results_count') }}
          </p>
          <div class="flex items-center gap-3">
            <Button variant="outline" size="sm" :disabled="currentPage === 1" class="rounded-xl h-10 w-10 border-slate-200" @click="currentPage--">
              <span class="sr-only">{{ $t('commun.previous') }}</span>
              ‹
            </Button>
            <div class="flex items-center px-4 h-10 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 shadow-sm">
              {{ currentPage }} <span class="mx-2 text-slate-200">/</span> {{ totalPages || 1 }}
            </div>
            <Button variant="outline" size="sm" :disabled="currentPage === totalPages || totalPages === 0" class="rounded-xl h-10 w-10 border-slate-200" @click="currentPage++">
              <span class="sr-only">{{ $t('commun.next') }}</span>
              ›
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
  <ConfirmModal
    :open="deleteModalOpen"
    :title="$t('commun.delete')"
    :description="$t('documents.delete_confirm')"
    variant="danger"
    :loading="deleteLoading"
    @close="deleteModalOpen = false"
    @confirm="confirmDelete"
  />
</template>
