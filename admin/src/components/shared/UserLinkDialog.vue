<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'

const props = defineProps<{
  open: boolean
  title: string
  description: string
}>()

const emit = defineEmits(['close', 'select'])

const users = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await api.admin.getUsers()
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

const filteredUsers = () => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.nom?.toLowerCase().includes(q) || 
    u.email?.toLowerCase().includes(q)
  )
}

const handleSelect = (user: any) => {
  emit('select', user.id)
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    fetchUsers()
  }
})

</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="w-[92%] sm:max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl p-0 overflow-hidden border-none font-['Outfit'] flex flex-col bg-white">
      <DialogHeader class="p-8 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <DialogTitle class="text-xl font-black text-slate-900">{{ title }}</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium mt-1">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="p-8 flex-1 flex flex-col min-h-0">
        <div class="relative mb-4 shrink-0">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            v-model="searchQuery" 
            :placeholder="$t('users.search_placeholder_link')" 
            class="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:ring-slate-900/10 shadow-sm"
          />
        </div>

        <div class="flex-1 overflow-y-auto border rounded-2xl border-slate-100 min-h-0 bg-white shadow-sm scrollbar-thin scrollbar-thumb-slate-200">
          <Table>
            <TableHeader class="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[13px] py-4 pl-6">{{ $t('users.table.name') }}</TableHead>
                <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[13px] py-4">{{ $t('users.table.email') }}</TableHead>
                <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[13px] py-4 pr-6">{{ $t('users.table.actions') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading" v-for="i in 3" :key="i">
                <TableCell colspan="3" class="h-14 animate-pulse bg-slate-50/50"></TableCell>
              </TableRow>
              <TableRow v-else v-for="user in filteredUsers()" :key="user.id" class="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                <TableCell class="py-4 pl-6">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm font-bold text-xs uppercase">
                      {{ user.nom?.charAt(0) }}
                    </div>
                    <span class="font-bold text-slate-900">{{ user.nom }}</span>
                  </div>
                </TableCell>
                <TableCell class="py-4 text-sm font-medium text-slate-500">{{ user.email }}</TableCell>
                <TableCell class="py-4 pr-6 text-right">
                  <Button variant="outline" size="sm" class="rounded-xl h-8 font-black text-[13px] uppercase tracking-widest border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all" @click="handleSelect(user)">
                    {{ $t('commun.select') }}
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="!loading && filteredUsers().length === 0">
                <TableCell colspan="3" class="h-32 text-center text-slate-400 font-medium italic">
                  {{ $t('commun.no_results') }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter class="p-8 bg-slate-50/50 border-t border-slate-100 shrink-0">
        <Button variant="ghost" class="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-100" @click="emit('close')">{{ $t('commun.cancel') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>


