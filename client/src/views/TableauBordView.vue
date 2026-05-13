<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { BarChart3, TrendingUp, Activity, AlertCircle, CreditCard, PieChart, ShieldCheck, Loader2, BarChart } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import PageContainer from '@/components/shared/PageContainer.vue'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useI18n } from 'vue-i18n'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler } from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler)

const { locale } = useI18n()
const { data: statistiques, loading: loadingStats, execute: fetchStats } = useFetch(api.data.getStats)
const { loading: loadingContrats, execute: fetchContrats } = useFetch(api.data.getPolices)

const loading = computed(() => loadingStats.value || loadingContrats.value)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 20, font: { family: 'Outfit', size: 10, weight: 'bold' as const } }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      titleFont: { family: 'Outfit', size: 12, weight: 'bold' as const },
      bodyFont: { family: 'Outfit', size: 11 },
      cornerRadius: 8
    }
  }
}

const statsCards = computed(() => {
  const s = (statistiques.value as any)?.[0]?.[0] || {}
  return [
    { title: (locale.value === 'fr' ? 'Nombre de contrats' : 'Number of contracts'), value: formatNumber(s.totalPolices || 0), icon: ShieldCheck, color: 'text-slate-900' },
    { title: (locale.value === 'fr' ? 'Sinistres en cours' : 'Ongoing claims'), value: formatNumber(s.sinistresEnCours || 0), icon: AlertCircle, color: 'text-orange-600' },
    { title: (locale.value === 'fr' ? 'Prime annuelle' : 'Annual premium'), value: formatCurrency(s.primeAnnuelle || 0), icon: Activity, color: 'text-emerald-600' },
    { title: (locale.value === 'fr' ? 'Primes impayées' : 'Unpaid premiums'), value: formatCurrency(s.totalImpayes || 0), icon: CreditCard, color: 'text-red-600' }
  ]
})

const evolutionData = computed(() => {
  const items = (statistiques.value as any)?.[2] || []
  const months = locale.value === 'fr' 
    ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const totals = new Array(12).fill(0)
  const impayes = new Array(12).fill(0)
  items.forEach((i: any) => { 
    if (i.month_num <= 12) {
      totals[i.month_num - 1] = i.total
      impayes[i.month_num - 1] = i.impayes
    }
  })
  return {
    labels: months,
    datasets: [
      {
        label: (locale.value === 'fr' ? 'Primes réglées' : 'Settled premiums'),
        data: totals,
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.4
      },
      {
        label: (locale.value === 'fr' ? 'Impayés' : 'Unpaid'),
        data: impayes,
        borderColor: '#ef4444', // Red 500
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const distributionData = computed(() => {
  const items = (statistiques.value as any)?.[1] || []
  return {
    labels: items.map((i: any) => i.label),
    datasets: [{
      data: items.map((i: any) => i.value),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
      borderWidth: 0
    }]
  }
})

const brancheData = computed(() => {
  const items = (statistiques.value as any)?.[3] || []
  return {
    labels: items.map((i: any) => i.branche),
    datasets: [
      {
        label: (locale.value === 'fr' ? 'Primes' : 'Premiums'),
        data: items.map((i: any) => i.totalPrime),
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: (locale.value === 'fr' ? 'Impayés' : 'Unpaid'),
        data: items.map((i: any) => i.totalImpaye),
        backgroundColor: '#ef4444',
        borderRadius: 6
      }
    ]
  }
})

onMounted(() => {
  Promise.all([fetchStats(), fetchContrats()])
})
</script>

<template>
  <PageContainer :title="$t('tableau_bord.title')" :subtitle="$t('tableau_bord.subtitle')">
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div class="relative">
        <Loader2 class="w-12 h-12 animate-spin text-slate-900" />
        <div class="absolute inset-0 blur-xl bg-slate-900/20 animate-pulse rounded-full"></div>
      </div>
      <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Chargement...</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card v-for="stat in statsCards" :key="stat.title" class="glass-card group border-none">
        <CardContent class="p-5 sm:p-6 flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-3">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 transition-transform group-hover:scale-110 shrink-0', stat.color]">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="flex-1 sm:flex-none text-left sm:text-center">
            <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{{ stat.title }}</p>
            <h3 class="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">{{ stat.value }}</h3>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <Card class="lg:col-span-2 glass-card p-8 md:p-10 border-none">
        <div class="flex items-center justify-between mb-8">
          <CardTitle class="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">{{ $t('tableau_bord.premium_evolution') }} & {{ $t('tableau_bord.unpaid_evolution') }}</CardTitle>
          <TrendingUp class="w-5 h-5 text-slate-400" />
        </div>
        <div class="h-[250px] sm:h-[300px] w-full">
          <Line :data="evolutionData" :options="chartOptions" />
        </div>
      </Card>

      <Card class="lg:col-span-1 glass-card p-8 md:p-10 border-none">
        <div class="flex items-center justify-between mb-8">
          <CardTitle class="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">{{ $t('tableau_bord.coverage_distribution') }}</CardTitle>
          <PieChart class="w-5 h-5 text-slate-400" />
        </div>
        <div class="h-[250px] sm:h-[300px] w-full relative">
          <Doughnut :data="distributionData" :options="{ ...chartOptions, cutout: '75%' }" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
            <span class="text-3xl font-black text-slate-900 leading-none">{{ (statistiques?.[0]?.[0]?.totalPolices) || 0 }}</span>
            <span class="text-[9px] text-slate-400 font-black uppercase tracking-widest">{{ $t('tableau_bord.total_policies') }}</span>
          </div>
        </div>
      </Card>
    </div>

    <Card class="glass-card p-8 md:p-10 border-none">
      <div class="flex items-center justify-between mb-8">
        <CardTitle class="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">{{ $t('tableau_bord.expert_analysis') }}</CardTitle>
        <BarChart class="w-5 h-5 text-slate-400" />
      </div>
      <div class="h-[300px] sm:h-[400px] w-full">
        <Bar :data="brancheData" :options="chartOptions" />
      </div>
    </Card>
  </PageContainer>
</template>