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
    <DialogContent class="max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="text-xl font-black text-slate-900">{{ title }}</DialogTitle>
        <DialogDescription class="text-slate-500 font-medium">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="relative my-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          v-model="searchQuery" 
          placeholder="Rechercher un utilisateur par nom ou email..." 
          class="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-emerald-500"
        />
      </div>

      <div class="flex-1 overflow-y-auto border rounded-xl border-slate-100">
        <Table>
          <TableHeader class="bg-slate-50 sticky top-0 z-10">
            <TableRow>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Utilisateur</TableHead>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">Email</TableHead>
              <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading" v-for="i in 3" :key="i">
              <TableCell colspan="3" class="h-12 animate-pulse bg-slate-50/50"></TableCell>
            </TableRow>
            <TableRow v-else v-for="user in filteredUsers()" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm font-bold text-xs">
                    {{ user.nom?.charAt(0) }}
                  </div>
                  <span class="font-bold text-slate-900">{{ user.nom }}</span>
                </div>
              </TableCell>
              <TableCell class="text-sm font-medium text-slate-500">{{ user.email }}</TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm" class="rounded-lg h-8 font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" @click="handleSelect(user)">
                  Sélectionner
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!loading && filteredUsers().length === 0">
              <TableCell colspan="3" class="h-32 text-center text-slate-400 font-medium italic">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <DialogFooter class="mt-4">
        <Button variant="ghost" class="rounded-xl font-bold" @click="emit('close')">Annuler</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
