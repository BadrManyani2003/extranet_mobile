<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileDown } from 'lucide-vue-next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import DataTableWrapper from '@/components/shared/DataTableWrapper.vue'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import * as XLSX from 'xlsx-js-style'

const quittances = ref<any[]>([])
const loading = ref(true)

const fetchAllQuittances = async () => {
  try {
    loading.value = true
    const res = await api.data.getImpayes(undefined, 'N')
    quittances.value = res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  if (!quittances.value.length) return

  const { t } = useI18n()
  const headers = [
    t('quittances.num'), t('contrats.num'), t('contrats.branche'), t('quittances.from'), t('quittances.to'), t('quittances.total'), t('quittances.unpaid')
  ]

  const headerStyle = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "F1F5F9" } }, // Gris clair (slate-100)
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    },
    alignment: { horizontal: "center", vertical: "center" }
  }

  const cellStyle = {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    },
    alignment: { vertical: "center" }
  }

  // 2. Création de la matrice de données
  const data = [
    headers.map(h => ({ v: h, s: headerStyle })), // Ligne d'en-tête
    ...quittances.value.map(item => [
      { v: item.numero, s: cellStyle },
      { v: item.numPolice, s: cellStyle },
      { v: item.branche, s: cellStyle },
      { v: formatDate(item.dateDebut), s: cellStyle },
      { v: formatDate(item.dateFin), s: cellStyle },
      { v: item.montantTotal, s: { ...cellStyle, alignment: { horizontal: "right" } }, t: 'n', z: '#,##0.00' },
      { v: item.montantImpaye, s: { ...cellStyle, alignment: { horizontal: "right" }, font: { color: { rgb: item.montantImpaye > 0 ? "DC2626" : "059669" } } }, t: 'n', z: '#,##0.00' }
    ])
  ]

  // 3. Création de la feuille
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // Ajustement des largeurs
  ws['!cols'] = [
    { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Relevé Global')

  XLSX.writeFile(wb, `Releve_Global_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(() => {
  fetchAllQuittances()
})
</script>

<template>
  <DataTableWrapper 
    :title="$t('vue_releve_global.title')" 
    :description="$t('vue_releve_global.subtitle')"
    :items="quittances" 
    :loading="loading" 
    :search-placeholder="$t('vue_releve_global.search')"
  >
    <template #extra-actions>
      <Button 
        variant="outline" 
        class="rounded-2xl h-12 px-6 gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black shadow-sm"
        @click="exportToExcel"
        :disabled="!quittances.length"
      >
        <FileDown class="w-5 h-5 text-slate-900" />
        {{ $t('commun.download', 'Télécharger') }}
      </Button>
    </template>

    <template #default="{ items }">
      <div class="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table class="w-full min-w-[1000px]">
          <TableHeader class="bg-slate-50/50">
            <TableRow>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[14px] py-4 px-6">{{ $t('quittances.num') }}</TableHead>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[14px] py-4">{{ $t('contrats.num') }}</TableHead>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[14px] py-4">{{ $t('contrats.branche') }}</TableHead>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[14px] py-4">{{ $t('quittances.from') }}</TableHead>
              <TableHead class="font-black text-slate-900 uppercase tracking-widest text-[14px] py-4">{{ $t('quittances.to') }}</TableHead>
              <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[14px] py-4">{{ $t('quittances.total') }}</TableHead>
              <TableHead class="text-right font-black text-slate-900 uppercase tracking-widest text-[14px] py-4 px-6">{{ $t('quittances.unpaid') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in items" :key="item.id" class="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
              <TableCell class="py-4 px-6 font-black text-slate-900 text-sm">
                {{ item.numero }}
              </TableCell>
              
              <TableCell class="text-sm text-slate-600 font-bold">
                {{ item.numPolice }}
              </TableCell>

              <TableCell class="text-sm text-slate-500 font-medium">
                {{ item.branche }}
              </TableCell>

              <TableCell class="text-sm text-slate-600 font-bold">
                {{ formatDate(item.dateDebut) }}
              </TableCell>

              <TableCell class="text-sm text-slate-600 font-bold">
                {{ formatDate(item.dateFin) }}
              </TableCell>

              <TableCell class="text-right text-sm font-black text-slate-900">
                {{ formatCurrency(item.montantTotal) }}
              </TableCell>

              <TableCell class="text-right py-4 px-6">
                <span :class="item.montantImpaye > 0 ? 'text-orange-600 font-black' : 'text-emerald-600 font-bold'" class="text-sm">
                  {{ formatCurrency(item.montantImpaye) }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>
  </DataTableWrapper>
</template>


