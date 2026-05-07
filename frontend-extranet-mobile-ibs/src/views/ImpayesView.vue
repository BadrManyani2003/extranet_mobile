<script setup lang="ts">
import { onMounted } from 'vue'
import { FileText } from 'lucide-vue-next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useFetch } from '@/composables/useFetch'

const { data: quittancesImpayees, loading: chargementEnCours, execute: fetchImpayes } = useFetch(api.data.getImpayes)

onMounted(() => {
  fetchImpayes()
})
</script>

<template>
  <DataTableWrapper 
    :title="$t('vue_impayes.title')"
    :description="$t('vue_impayes.subtitle')"
    :items="quittancesImpayees || []"
    :loading="chargementEnCours"
    :search-placeholder="$t('vue_impayes.search')"
  >
    <template #default="{ items }">
      <Table>
        <TableHeader class="bg-slate-50/50 border-b border-slate-100">
          <TableRow>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px] py-6">{{ $t('contrats.statut') }}</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('contrats.branche') }}</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('quittances.num') }}</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('quittances.from') }}</TableHead>
            <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('quittances.to') }}</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('quittances.total') }}</TableHead>
            <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">{{ $t('quittances.unpaid') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in items" :key="item.id" class="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
            <TableCell class="font-bold text-slate-900 py-4">{{ item.Police || '-' }}</TableCell>
            <TableCell class="text-sm text-slate-600 font-bold">{{ item.Branche || '-' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-slate-400" />
                <span class="font-black text-slate-800 text-sm">{{ item.numero }}</span>
              </div>
            </TableCell>
            <TableCell class="text-sm text-slate-600 font-bold">{{ item.dateDebut ? new Date(item.dateDebut).toLocaleDateString() : '-' }}</TableCell>
            <TableCell class="text-sm text-slate-600 font-bold">{{ item.dateFin ? new Date(item.dateFin).toLocaleDateString() : '-' }}</TableCell>
            <TableCell class="text-sm font-bold text-slate-900 text-right">{{ formatCurrency(item.montantTotal) }}</TableCell>
            <TableCell class="text-sm font-black text-right text-slate-900">{{ formatCurrency(item.montantImpaye) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </DataTableWrapper>
</template>
