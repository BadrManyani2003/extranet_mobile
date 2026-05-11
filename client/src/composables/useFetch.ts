import { ref } from 'vue'
import { toast } from '@/components/ui/sonner'

export function useFetch<T>(apiMethod: (...args: any[]) => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (...args: any[]) => {
    loading.value = true
    error.value = null
    try {
      data.value = await apiMethod(...args)
      return data.value
    } catch (e: any) {
      error.value = e.message || 'Une erreur est survenue'
      toast.error(error.value || 'Une erreur est survenue')
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}