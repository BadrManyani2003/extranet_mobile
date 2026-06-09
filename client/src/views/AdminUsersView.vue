<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, LogOut, UserX } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { useFetch } from '@/composables/useFetch'
import { useUserStore } from '@/store/user'
import keycloakService from '@/services/keycloak'

const { data: users, loading, execute: fetchUsers } = useFetch(api.admin.getSimulationUsers)
const search = ref('')
const userStore = useUserStore()

const adminName = computed(() => {
  const u = userStore.user
  if (!u) return 'Admin'
  return u.Nom || u.nom || u.name || u.username || 'Admin'
})

const filteredUsers = computed(() => {
  if (!users.value) return []
  const q = search.value.toLowerCase()
  if (!q) return users.value as any[]
  return (users.value as any[]).filter((u: any) =>
    String(u.nom || u.Nom || '').toLowerCase().includes(q) ||
    String(u.email || u.Email || '').toLowerCase().includes(q)
  )
})

const handleSimulate = (user: any) => {
  userStore.startImpersonation(user)
}

const handleLogout = () => {
  keycloakService.logout()
}

onMounted(fetchUsers)
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-['Outfit']">
    <!-- Header strip -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold select-none">
          {{ adminName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="text-xs text-gray-400 leading-none">{{ $t('admin_users.connected_as') }}</p>
          <p class="font-semibold text-gray-900 text-sm">{{ adminName }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <LogOut class="w-4 h-4" />
        {{ $t('admin_users.logout') }}
      </button>
    </div>

    <!-- Main content -->
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ $t('admin_users.title') }}</h1>
      <p class="text-gray-500 text-sm mb-6">{{ $t('admin_users.subtitle') }}</p>

      <!-- Search -->
      <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="search"
          type="text"
          :placeholder="$t('admin_users.search_placeholder')"
          class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl p-4 border border-gray-100 animate-pulse flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-4 w-36 bg-gray-200 rounded"></div>
            <div class="h-3 w-52 bg-gray-100 rounded"></div>
          </div>
          <div class="h-8 w-20 bg-gray-100 rounded-lg"></div>
        </div>
      </div>

      <!-- User list -->
      <div v-else-if="filteredUsers.length > 0" class="space-y-2">
        <div
          v-for="user in filteredUsers"
          :key="user.id || user.Id"
          class="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between hover:border-slate-300 transition-colors group"
        >
          <div class="min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ user.nom || user.Nom || '—' }}</p>
            <p class="text-sm text-gray-400 truncate">{{ user.email || user.Email || '—' }}</p>
          </div>
          <button
            @click="handleSimulate(user)"
            class="ml-4 shrink-0 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-95 transition-all"
          >
            {{ $t('admin_users.simulate') }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16 text-gray-400">
        <UserX class="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p class="text-sm">{{ $t('admin_users.no_users') }}</p>
      </div>
    </div>
  </div>
</template>
