import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => {
    if (!user.value) return '...'
    return user.value.nom || user.value.name || user.value.username || 'Utilisateur'
  })

  async function fetchUser() {
    loading.value = true
    error.value = null
    try {
      const userData = await api.data.getUserInfo()
      user.value = userData
      return userData
    } catch (e: any) {
      error.value = e.message
      user.value = null
      throw e
    } finally {
      loading.value = false
    }
  }

  function setUser(data: any) {
    user.value = data
  }

  function clearUser() {
    user.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userName,
    fetchUser,
    setUser,
    clearUser
  }
})
