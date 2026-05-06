<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CreditCard,
  PieChart,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldCheck
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/lib/api'
import { useI18n } from 'vue-i18n'

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

const statistiques = ref<any[]>([])
const contrats = ref<any[]>([])
const chargementEnCours = ref(true)
const periode = ref('monthly')

const iconeMap: Record<string, any> = {
  ShieldCheck,
  Activity,
  AlertCircle,
  CreditCard
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
      displayColors: false
    }
  }
} as const

const donneesBranche = computed(() => {
  const branches = contrats.value.reduce((acc: Record<string, number>, c) => {
    acc[c.branche] = (acc[c.branche] || 0) + 1
    return acc
  }, {})

  return {
    labels: Object.keys(branches),
    datasets: [{
      data: Object.values(branches),
      backgroundColor: [
        '#0f172a', // slate-900
        '#475569', // slate-600
        '#94a3b8', // slate-400
        '#cbd5e1'  // slate-200
      ],
      borderWidth: 0,
      hoverOffset: 15
    }]
  }
})

const donneesEvolution = computed(() => ({
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: t('tableau_bord.premium_evolution'),
      data: [1200, 1200, 1500, 1200, 1200, 1800, 1200, 1200, 1200, 1500, 1200, 1200],
      borderColor: '#0f172a',
      backgroundColor: 'rgba(15, 23, 42, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0f172a',
      pointBorderWidth: 2
    }
  ]
}))

const donneesSinistre = computed(() => {
  const labels = Array.from(new Set(contrats.value.map(c => c.branche)))
  const enCours = labels.map(label => {
    return contrats.value
      .filter(c => c.branche === label)
      .reduce((sum, c) => sum + (c.sinistres?.filter((s: any) => s.statut === 'En cours').length || 0), 0)
  })
  const clotures = labels.map(label => {
    return contrats.value
      .filter(c => c.branche === label)
      .reduce((sum, c) => sum + (c.sinistres?.filter((s: any) => s.statut === 'Clôturé').length || 0), 0)
  })

  return {
    labels,
    datasets: [
      {
        label: t('tableau_bord.pending_claims'),
        backgroundColor: '#94a3b8',
        data: enCours,
        borderRadius: 6
      },
      {
        label: t('statuts.clôturé'),
        backgroundColor: '#0f172a',
        data: clotures,
        borderRadius: 6
      }
    ]
  }
})

const statsWithDefault = computed(() => {
  return statistiques.value.map(stat => ({
    ...stat,
    change: stat.change || '0%'
  }))
})

onMounted(async () => {
  try {
    const [statsRes, contratsRes] = await Promise.all([
      api.data.getStats(),
      api.data.getPolices()
    ])
    statistiques.value = statsRes
    contrats.value = contratsRes
  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error)
  } finally {
    chargementEnCours.value = false
  }
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Outfit'] pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-4xl font-black tracking-tight text-slate-900">{{ $t('tableau_bord.title') }}</h2>
      </div>
      
      <div class="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button 
          @click="periode = 'monthly'"
          class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
          :class="periode === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
        >
          {{ $t('tableau_bord.monthly') }}
        </button>
        <button 
          @click="periode = 'annually'"
          class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
          :class="periode === 'annually' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
        >
          {{ $t('tableau_bord.annually') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <template v-if="chargementEnCours">
        <div v-for="i in 3" :key="i" class="h-32 bg-white border border-slate-200 rounded-3xl animate-pulse"></div>
      </template>
      <Card v-else v-for="stat in statsWithDefault" :key="stat.title" 
        class="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500 bg-white group border-b-4"
        :style="{ borderBottomColor: stat.bg.includes('slate-200') ? '#0f172a' : stat.bg.includes('slate-100') ? '#475569' : '#94a3b8' }"
      >
        <CardContent class="p-8 flex items-center gap-6">
          <div :class="`w-16 h-16 rounded-[1.25rem] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 text-white`">
            <component :is="iconeMap[stat.icon]" class="w-8 h-8" />
          </div>
          <div class="flex-1">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{{ $t('tableau_bord.' + stat.title) }}</p>
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-3xl font-black text-slate-900">{{ stat.value }}</h3>
              <div :class="stat.change.startsWith('+') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'" 
                   class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black">
                <ArrowUpRight v-if="stat.change.startsWith('+')" class="w-3 h-3" />
                <ArrowDownRight v-else-if="stat.change.startsWith('-')" class="w-3 h-3" />
                {{ stat.change.replace('+', '').replace('-', '') }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card class="lg:col-span-2 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white p-8">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-2xl font-black text-slate-900">{{ $t('tableau_bord.premium_evolution') }}</CardTitle>
          </div>
          <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
            <TrendingUp class="w-6 h-6" />
          </div>
        </CardHeader>
        <div class="h-[350px] w-full">
          <Line :data="donneesEvolution" :options="optionsGraphique" />
        </div>
      </Card>

      <Card class="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white p-8">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-xl font-black text-slate-900">{{ $t('tableau_bord.coverage_distribution') }}</CardTitle>
          </div>
          <div class="w-12 h-12 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center">
            <PieChart class="w-6 h-6" />
          </div>
        </CardHeader>
        <div class="h-[300px] w-full relative">
          <Doughnut :data="donneesBranche" :options="{ ...optionsGraphique, cutout: '70%' }" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
            <span class="text-3xl font-black text-slate-900">{{ contrats.length }}</span>
            <span class="text-[10px] text-slate-400 font-bold uppercase">{{ $t('tableau_bord.total_policies') }}</span>
          </div>
        </div>
      </Card>

      <Card class="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white p-8">
        <CardHeader class="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-xl font-black text-slate-900">{{ $t('tableau_bord.claims_status') }}</CardTitle>
          </div>
          <div class="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
            <BarChart3 class="w-6 h-6" />
          </div>
        </CardHeader>
        <div class="h-[300px] w-full">
          <Bar :data="donneesSinistre" :options="optionsGraphique" />
        </div>
      </Card>
    </div>

  </div>
</template>
