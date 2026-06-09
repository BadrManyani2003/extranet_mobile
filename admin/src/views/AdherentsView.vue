<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, UserPlus, CheckCircle2, Link } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import UserLinkDialog from '@/components/shared/UserLinkDialog.vue'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/sonner'
import { formatDate } from '@/lib/utils'

const { t } = useI18n()

const adherents = ref<any[]>([])
const loading = ref(true)
const linkDialogOpen = ref(false)
const selectedAdherentId = ref<number | null>(null)

const fetchAdherents = async () => {
  loading.value = true
  try { adherents.value = await api.admin.getAdherents() } 
  catch (e: any) { toast.error(e.message || t('adherents.toast_load_error')) } 
  finally { loading.value = false }
}

const handleCreateUser = async (adherentId: number) => {
  try {
    await api.admin.createUserFromAdherent(adherentId)
    toast.success(t('adherents.toast_create_success'))
    fetchAdherents()
  } catch (e: any) { toast.error(e.message) }
}

const openLinkDialog = (adherentId: number) => {
  selectedAdherentId.value = adherentId
  linkDialogOpen.value = true
}

const handleLinkUser = async (userId: number) => {
  if (!selectedAdherentId.value) return
  try {
    await api.admin.linkUserToAdherent(selectedAdherentId.value, userId)
    toast.success(t('adherents.toast_link_success'))
    linkDialogOpen.value = false
    fetchAdherents()
  } catch (e: any) { toast.error(e.message) }
}

onMounted(fetchAdherents)
</script>

<template>
  <DataTableWrapper 
    :title="$t('adherents.title')" 
    :description="$t('adherents.subtitle')"
    :items="adherents"
    :loading="loading"
    :search-placeholder="$t('adherents.search_placeholder')"
  >
    <template #default="{ items }">
      <Table class="border-t border-slate-100 w-full min-w-[1000px]">
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="table-header-text py-6">{{ $t('adherents.table.id') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('adherents.table.name') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('adherents.table.membership_date') }}</TableHead>
            <TableHead class="table-header-text">{{ $t('adherents.table.linked_user') }}</TableHead>
            <TableHead class="text-right table-header-text">{{ $t('adherents.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="adherent in items" :key="adherent.id" class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-400 py-4">{{ adherent.matricule || '-' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                  <User class="w-5 h-5" />
                </div>
                <span class="font-bold text-slate-900 tracking-tight">{{ adherent.nom }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-sm font-medium text-slate-600">{{ formatDate(adherent.dateAdhesion) }}</span>
            </TableCell>
            <TableCell>
              <div v-if="adherent.fkUserId" class="flex items-center gap-2 text-emerald-600 font-bold text-[14px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ adherent.userNom }}
              </div>
              <span v-else class="text-slate-300 font-black text-[14px] uppercase tracking-widest italic">{{ $t('commun.no_results') }}</span>
            </TableCell>
            <TableCell class="text-right">
              <div v-if="!adherent.fkUserId" class="flex justify-end gap-1">
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-slate-600 hover:bg-primary hover:text-primary-foreground" @click="handleCreateUser(adherent.id)">
                  <UserPlus class="w-4 h-4" /> {{ $t('users.add_button') }}
                </Button>
                <Button variant="ghost" size="sm" class="h-9 gap-2 premium-button text-emerald-600 hover:bg-emerald-50" @click="openLinkDialog(adherent.id)">
                  <Link class="w-4 h-4" /> {{ $t('commun.link') }}
                </Button>
              </div>
              <div v-else class="text-emerald-500 pr-4">
                <CheckCircle2 class="w-5 h-5 ml-auto" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>

  <UserLinkDialog 
    :open="linkDialogOpen"
    :title="$t('users.link_dialog_title')"
    :description="$t('users.link_dialog_desc_adherent')"
    @close="linkDialogOpen = false"
    @select="handleLinkUser"
  />
</template>

