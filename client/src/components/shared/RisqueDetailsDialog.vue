<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { formatDate, formatNumber } from '@/lib/utils'

defineProps<{
  open: boolean
  risque: any
  isSante: boolean
  loading: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[700px] bg-white p-6 shadow-xl border border-slate-200 font-['Outfit']">
      <DialogHeader class="border-b border-slate-100 pb-4 mb-4">
        <DialogTitle class="text-lg font-bold text-slate-900">
          {{ isSante ? $t('risques.beneficiaries') : $t('contrats.detail_button') }}
        </DialogTitle>
      </DialogHeader>

      <div v-if="risque">
        <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-4">
          <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
          <p class="text-xs text-slate-500 font-medium tracking-widest uppercase italic">
            {{ isSante ? $t('risques.loading_members') : $t('risques.loading_details') }}
          </p>
        </div>

        <div v-else-if="risque.garanties">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.guarantee') }}</th>
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.capital') }}</th>
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.deductible') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="g in risque.garanties" :key="g.nom">
                <td class="py-3 text-sm text-slate-700">{{ g.nom }}</td>
                <td class="py-3 text-sm font-bold text-slate-900 text-right">{{ formatNumber(g.capital) }}</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ (g.franchise && g.franchise != '0' && g.franchise != 0) ? formatNumber(g.franchise) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="isSante && risque.personnesACharge">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.name') }}</th>
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase">{{ $t('risques.relationship') }}</th>
                <th class="py-2 text-[14px] font-bold text-slate-400 uppercase text-right">{{ $t('risques.birth_date') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="p in risque.personnesACharge" :key="p.nom">
                <td class="py-3 text-sm text-slate-700 font-bold">{{ p.nom }}</td>
                <td class="py-3 text-sm text-slate-500 font-medium">{{ p.lien }}</td>
                <td class="py-3 text-sm text-slate-500 text-right">{{ formatDate(p.dateNaissance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="py-4 text-center text-slate-400 text-sm italic">
          {{ $t('risques.no_details') }}
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <Button @click="emit('close')" variant="outline" class="font-bold">{{ $t('commun.close') }}</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
