<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { User, ShieldCheck, Send, History, Trash2, Clock } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  messages: any[]
  loading: boolean
  selectedTicket: any
  selfNature: 'Client' | 'Admin'
  currentUserId?: number
}>()

const emit = defineEmits(['send', 'delete-message'])
const nouveauMessage = ref('')
const scrollAreaRef = ref<any>(null)
const bottomRef = ref<HTMLElement | null>(null)

const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick()
  if (bottomRef.value) {
    bottomRef.value.scrollIntoView({ behavior })
  }
}

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom('auto')
})

const handleSend = () => {
  const text = nouveauMessage.value.trim()
  if (!text || props.selectedTicket?.statut === 'Clôturé' || props.selectedTicket?.statut === 'C') return
  emit('send', text)
  nouveauMessage.value = ''
}

const isSelf = (msg: any) => {
  // Le backend renvoie 'Client' ou 'Admin' (ou 'C'/'A' selon le cas)
  // On normalise pour comparer avec selfNature
  const nature = msg.nature === 'C' ? 'Client' : (msg.nature === 'A' ? 'Admin' : msg.nature)
  return nature === props.selfNature
}

const isSameGroup = (m1: any, m2: any) => {
  if (!m1 || !m2) return false
  const n1 = m1.nature === 'C' ? 'Client' : (m1.nature === 'A' ? 'Admin' : m1.nature)
  const n2 = m2.nature === 'C' ? 'Client' : (m2.nature === 'A' ? 'Admin' : m2.nature)
  
  if (n1 !== n2) return false
  
  const t1 = new Date(m1.dateMessage).getTime()
  const t2 = new Date(m2.dateMessage).getTime()
  // Groupement si moins de 2 minutes d'intervalle
  return Math.abs(t1 - t2) < 120000 
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50/50 overflow-hidden font-['Outfit']">
    <!-- Zone des Messages -->
    <ScrollArea ref="scrollAreaRef" class="flex-1">
      <div class="p-4 sm:p-6 md:p-10 min-h-full flex flex-col justify-end">
        <div v-if="loading && messages.length === 0" class="flex flex-col items-center justify-center h-64 gap-4">
          <div class="w-8 h-8 sm:w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronisation...</p>
        </div>

        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-64 gap-6 opacity-40">
          <div class="w-16 h-16 sm:w-20 h-20 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner">
            <History class="w-8 h-8 sm:w-10 h-10 text-slate-200" />
          </div>
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Aucun message</p>
        </div>

        <div v-else class="max-w-4xl mx-auto w-full space-y-1">
          <div v-for="(msg, index) in messages" :key="msg.id || index" 
            class="flex flex-col transition-all duration-500"
            :class="[
              isSelf(msg) ? 'items-end' : 'items-start',
              isSameGroup(msg, messages[index-1]) ? 'mt-0.5' : 'mt-4 sm:mt-6'
            ]"
          >
            <div class="flex items-end gap-2 sm:gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[75%]" :class="isSelf(msg) ? 'flex-row-reverse' : 'flex-row'">
              <!-- Avatar -->
              <div class="w-7 h-7 sm:w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-500"
                :class="[
                  isSelf(msg) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400',
                  isSameGroup(msg, messages[index+1]) ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
                ]"
              >
                <ShieldCheck v-if="(msg.nature === 'Admin' || msg.nature === 'A')" class="w-3.5 h-3.5 sm:w-4 h-4" />
                <User v-else class="w-3.5 h-3.5 sm:w-4 h-4" />
              </div>

              <!-- Message Bubble -->
              <div class="flex flex-col relative group" :class="isSelf(msg) ? 'items-end' : 'items-start'">
                <div class="flex items-center gap-2" :class="isSelf(msg) ? 'flex-row-reverse' : 'flex-row'">
                  <div class="px-4 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-bold leading-relaxed shadow-sm transition-all duration-300"
                    :class="[
                      isSelf(msg) 
                        ? 'bg-slate-900 text-white selection:bg-white/20' 
                        : 'bg-white text-slate-700 border border-slate-100',
                      isSelf(msg)
                        ? (isSameGroup(msg, messages[index-1]) ? 'rounded-xl sm:rounded-2xl rounded-tr-md' : 'rounded-xl sm:rounded-2xl rounded-tr-none')
                        : (isSameGroup(msg, messages[index-1]) ? 'rounded-xl sm:rounded-2xl rounded-tl-md' : 'rounded-xl sm:rounded-2xl rounded-tl-none')
                    ]"
                  >
                    {{ msg.message || msg.text }}
                  </div>

                  <!-- Bouton Supprimer -->
                  <Button v-if="msg.canDelete" 
                    variant="ghost" 
                    size="icon" 
                    @click="emit('delete-message', msg.id)" 
                    class="h-7 w-7 sm:h-8 sm:w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 class="w-3.5 h-3.5 sm:w-4 h-4" />
                  </Button>
                </div>

                <!-- Footer info (Time / Sender) -->
                <div v-if="!isSameGroup(msg, messages[index+1])" 
                  class="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-slate-300 mt-1.5 sm:mt-2 uppercase tracking-widest px-1">
                  <span v-if="isSelf(msg)" class="text-slate-400">VOUS</span>
                  <span v-else class="text-slate-900">{{ msg.envoyeur || 'Conseiller IBS' }}</span>
                  <span class="w-1 h-1 rounded-full bg-slate-200"></span>
                  <Clock class="w-2.5 h-2.5" />
                  <span>{{ formatDate(msg.dateMessage) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div ref="bottomRef" class="h-4 w-full"></div>
        </div>
      </div>
    </ScrollArea>

    <!-- Zone de Saisie -->
    <div class="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100">
      <div class="max-w-4xl mx-auto">
        <div v-if="selectedTicket?.statut === 'Clôturé' || selectedTicket?.statut === 'C'" 
          class="flex items-center justify-center gap-3 p-3 sm:p-4 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
          <ShieldCheck class="w-3.5 h-3.5 sm:w-4 h-4" />
          <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center">Discussion clôturée</p>
        </div>
        
        <div v-else class="relative group">
          <div class="relative flex items-center gap-2 sm:gap-4 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-2 pl-4 sm:pl-6 focus-within:bg-white focus-within:border-slate-300 focus-within:shadow-2xl focus-within:shadow-slate-200/50 transition-all duration-500">
            <input 
              v-model="nouveauMessage"
              type="text"
              :placeholder="$t('reclamations.message_placeholder')"
              @keyup.enter="handleSend"
              class="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 py-3 sm:py-4"
            />
            <Button 
              @click="handleSend"
              :disabled="!nouveauMessage.trim()"
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 shrink-0 transition-all duration-300 active:scale-90"
            >
              <Send class="w-4 h-4 sm:w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
</style>