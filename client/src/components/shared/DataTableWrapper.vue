<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Loader2, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  title: string
  description: string
  items: any[]
  loading: boolean
  searchPlaceholder?: string
  addButtonLabel?: string
}>()

const emit = defineEmits(['add', 'search'])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 5

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  const q = searchQuery.value.toLowerCase()

  return props.items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(q)
    )
  )
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchQuery.value)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Outfit']">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-black tracking-tight text-slate-900">{{ title }}</h2>
        <p class="text-slate-500 font-medium mt-1">{{ description }}</p>
      </div>
      <div class="flex items-center gap-3">
        <slot name="extra-actions"></slot>
        <Button v-if="addButtonLabel" class="rounded-2xl h-12 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20" @click="$emit('add')">
          <Plus class="w-5 h-5" /> {{ addButtonLabel }}
        </Button>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          v-model="searchQuery"
          type="text" 
          :placeholder="searchPlaceholder || $t('commun.search_placeholder')" 
          class="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm"
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="border border-slate-200 rounded-[2rem] bg-white shadow-xl overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center p-24">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
      </div>
      <template v-else>
        <div class="overflow-x-auto w-full">
          <slot :items="paginatedItems"></slot>
        </div>

        <div class="border-t border-slate-100 p-6 flex items-center justify-between bg-slate-50/30">
          <p class="text-xs text-slate-400 font-black uppercase tracking-widest">
            {{ $t('commun.total_count', { count: filteredItems.length }) }}
          </p>
          <div class="flex items-center gap-3">
            <Button variant="outline" size="sm" :disabled="currentPage === 1" class="rounded-xl h-10 w-10 border-slate-200" @click="currentPage--">
              <ChevronLeft class="w-5 h-5" />
            </Button>
            <div class="flex items-center px-4 h-10 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 shadow-sm">
              {{ currentPage }} <span class="mx-2 text-slate-200">/</span> {{ totalPages || 1 }}
            </div>
            <Button variant="outline" size="sm" :disabled="currentPage === totalPages || totalPages === 0" class="rounded-xl h-10 w-10 border-slate-200" @click="currentPage++">
              <ChevronRight class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>