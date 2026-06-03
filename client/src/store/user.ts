import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const getInitialImpersonated = () => {
    try {
      const stored = sessionStorage.getItem('extranet-impersonated-user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
  const impersonatedUser = ref<any>(getInitialImpersonated())

  const isAuthenticated = computed(() => !!user.value)
  const activeUser = computed(() => impersonatedUser.value || user.value)
  const userName = computed(() => {
    if (!activeUser.value) return '...'
    return activeUser.value.Nom || activeUser.value.nom || activeUser.value.name || activeUser.value.username || 'Utilisateur'
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
    impersonatedUser.value = null
    sessionStorage.removeItem('extranet-impersonated-user')
  }

  function startImpersonation(targetUser: any) {
    impersonatedUser.value = targetUser
    sessionStorage.setItem('extranet-impersonated-user', JSON.stringify(targetUser))
    // reload the page to apply new state correctly across all components
    window.location.href = '/'
  }

  function stopImpersonation() {
    impersonatedUser.value = null
    sessionStorage.removeItem('extranet-impersonated-user')
    window.location.href = '/admin/users'
  }

  return {
    user,
    loading,
    error,
    impersonatedUser,
    activeUser,
    isAuthenticated,
    userName,
    fetchUser,
    setUser,
    clearUser,
    startImpersonation,
    stopImpersonation
  }
})
