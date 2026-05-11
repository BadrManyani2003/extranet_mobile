<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CreditCard,
  PieChart,
  ShieldCheck,
  Users
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import { api } from '@/lib/api'
import { useI18n } from 'vue-i18n'
import { useFetch } from '@/composables/useFetch'
import { formatCurrency, formatNumber } from '@/lib/utils'

const { t } = useI18n()

import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Filler
)

const { data: statistiques, loading: loadingStats, execute: fetchStats } = useFetch(api.data.getStats)
const { loading: loadingContrats, execute: fetchContrats } = useFetch(api.data.getPolices)

const chargementEnCours = computed(() => loadingStats.value || loadingContrats.value)

const iconeMap: Record<string, any> = {
  ShieldCheck,
  Activity,
  AlertCircle,
  CreditCard,
  Users
}

const optionsGraphique = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: 'Outfit', size: 11, weight: 'bold' }
      }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
      bodyFont: { family: 'Outfit', size: 12 },
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== undefined) {
            label += formatCurrency(context.parsed.y);
          } else if (context.parsed !== undefined) {
            label += context.parsed;
          }
          return label;
        }
      }
    }
  }
} as const

const donneesBranche = computed(() => {
  const items = (statistiques.value as any)?.[1] || []
  
  return {
    labels: items.map((i: any) => i.label || 'Inconnu'),
    datasets: [{
      data: items.map((i: any) => i.value || 0),
      backgroundColor: ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 15
    }]
  }
})
const donneesEvolution = computed(() => {
  const items = (statistiques.value as any)?.[2] || []
  
  // Générer les 12 mois de l'année
  const labelsMois = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ]
  
  const dataTotal = new Array(12).fill(0)
  const dataImpayes = new Array(12).fill(0)
  
  items.forEach((i: any) => {
    const idx = i.month_num - 1
    if (idx >= 0 && idx < 12) {
      dataTotal[idx] = i.total
      dataImpayes[idx] = i.impayes
    }
  })

  return {
    labels: labelsMois,
    datasets: [
      {
        label: t('tableau_bord.premium_evolution'),
        data: dataTotal,
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2
      },
      {
        label: t('tableau_bord.unpaid_evolution'),
        data: dataImpayes,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#ef4444',
        pointBorderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  }
})

const donneesSinistre = computed(() => {
  const items = (statistiques.value as any)?.[3] || []
  
  return {
    labels: items.map((i: any) => i.branche),
    datasets: [
      {
        label: t('tableau_bord.premium_evolution'),
        backgroundColor: '#0f172a',
        data: items.map((i: any) => i.totalPrime),
        borderRadius: 6
      },
      {
        label: t('tableau_bord.unpaid_evolution'),
        backgroundColor: '#ef4444',
        data: items.map((i: any) => i.totalImpaye),
        borderRadius: 6
      }
    ]
  }
})

const statsWithDefault = computed(() => {
  const s = (statistiques.value as any)?.[0]?.[0] || {}
  
  return [
    { 
      title: 'total_policies', 
      value: formatNumber(s.totalPolices || 0), 
      icon: 'ShieldCheck', 
      bg: 'bg-slate-900', 
      color: 'text-white'
    },
    { 
      title: 'pending_claims', 
      value: formatNumber(s.sinistresEnCours || 0), 
      icon: 'AlertCircle', 
      bg: 'bg-slate-700', 
      color: 'text-white'
    },
    { 
      title: 'prime_annuelle', 
      value: formatCurrency(s.primeAnnuelle || 0), 
      icon: 'Activity', 
      bg: 'bg-slate-500', 
      color: 'text-white'
    },
    { 
      title: 'mt_impayer', 
      value: formatCurrency(s.totalImpayes || 0), 
      icon: 'CreditCard', 
      bg: 'bg-slate-300', 
      color: 'text-slate-900'
    }
  ]
})

onMounted(() => {
  Promise.all([fetchStats(), fetchContrats()])
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Outfit'] pb-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">{{ $t('tableau_bord.title') }}</h1>
        <p class="text-slate-500 font-medium">{{ $t('tableau_bord.subtitle') }} - {{ new Date().getFullYear() }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
      <LoadingSkeleton v-if="chargementEnCours" :count="4" />
      <Card v-else v-for="stat in statsWithDefault" :key="stat.title" 
        class="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500 bg-white group border-b-4 border-b-slate-900/10"
      >
        <CardContent class="p-4 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 text-center md:text-left">
          <div :class="`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.25rem] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 text-white`">
            <component :is="iconeMap[stat.icon]" class="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div class="flex-1 min-w-0 w-full">
            <p class="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">
              {{ $t('tableau_bord.' + stat.title) }}
            </p>
            <div class="flex items-baseline justify-center md:justify-start gap-1 md:gap-2">
              <h3 class="text-sm md:text-2xl font-black text-slate-900 tracking-tight whitespace-normal">
                {{ stat.value }}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Chart Evolution (Full Width on Desktop) -->
      <Card class="lg:col-span-3 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white overflow-hidden group p-6 md:p-10">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('tableau_bord.premium_evolution') }}</CardTitle>
            <p class="text-slate-500 font-medium text-sm">{{ $t('tableau_bord.premium_desc') }}</p>
          </div>
          <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <TrendingUp class="w-6 h-6" />
          </div>
        </CardHeader>
        <div class="h-[350px] md:h-[400px] w-full">
          <Line :data="donneesEvolution" :options="optionsGraphique" />
        </div>
      </Card>

      <!-- Distribution (Pie) -->
      <Card class="lg:col-span-1 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white p-6 md:p-8 flex flex-col">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <CardTitle class="text-xl font-black text-slate-900 tracking-tight">{{ $t('tableau_bord.coverage_distribution') }}</CardTitle>
          <div class="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
            <PieChart class="w-5 h-5" />
          </div>
        </CardHeader>
        <div class="flex-1 flex flex-col justify-center min-h-[300px]">
          <div class="h-[300px] w-full relative">
            <Doughnut :data="donneesBranche" :options="{ ...optionsGraphique, cutout: '70%' }" />
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
              <span class="text-3xl font-black text-slate-900 leading-none">{{ (statistiques?.[0]?.[0]?.totalPolices) || 0 }}</span>
              <span class="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{{ $t('tableau_bord.total_policies') }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Financials by Branch (Bar) -->
      <Card class="lg:col-span-2 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white p-6 md:p-8">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-xl font-black text-slate-900 tracking-tight">{{ $t('tableau_bord.branch_financials') }}</CardTitle>
          </div>
          <div class="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
            <BarChart3 class="w-5 h-5" />
          </div>
        </CardHeader>
        <div class="h-[300px] md:h-[350px] w-full">
          <Bar :data="donneesSinistre" :options="optionsGraphique" />
        </div>
      </Card>
    </div>
  </div>
</template>