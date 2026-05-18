<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { 
  User, ShieldCheck, Send, History, Trash2, Clock, 
  Check, CheckCheck, Smile, Paperclip, Image, MoreVertical, ShieldAlert,
  ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  messages: any[]
  loading: boolean
  selectedTicket: any
  selfNature: 'Client' | 'Admin'
  currentUserId?: number
}>()

const sortedMessages = computed(() => {
  return [...props.messages].sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0))
})

const emit = defineEmits([
  'send', 
  'delete-message',
  'back',
  'update-status',
  'delete-ticket'
])

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
  <div class="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Outfit'] relative">
    <!-- Chat Wallpaper Doodle Effect (WhatsApp/Messenger Style) -->
    <div class="absolute inset-0 opacity-[0.04] pointer-events-none chat-pattern-bg"></div>

    <!-- Active Advisor Profile Header (WhatsApp / Instagram Inspired Unified Header) -->
    <div class="px-3 py-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-10 shadow-sm sticky top-0">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <!-- Back Button (Triggers slide back on mobile) -->
        <Button variant="ghost" size="icon" @click="emit('back')" class="rounded-full h-9 w-9 hover:bg-slate-100 shrink-0">
          <ChevronLeft class="w-5 h-5 text-slate-800" />
        </Button>

        <!-- Advisor Avatar with dynamic gradient and green pulse -->
        <div class="relative hidden xs:block shrink-0">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10 font-bold">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <!-- Pulse Green Dot Indicator -->
          <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full">
            <span class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
          </span>
        </div>

        <!-- Ticket & Advisor Info -->
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate leading-tight">
              {{ selectedTicket.sujet }}
            </h3>
            <Badge :class="(selectedTicket.statut === 'En cours' || selectedTicket.statut === 'E') ? 'bg-orange-50 text-orange-600 border-orange-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100/50'" 
              class="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border shrink-0">
              {{ (selectedTicket.statut === 'E' || selectedTicket.statut === 'En cours') ? $t('statuts.en_cours') : $t('statuts.clôturé') }}
            </Badge>
          </div>
          
          <div class="flex items-center gap-1 mt-0.5 flex-wrap text-slate-400 text-[11px] font-semibold">
            <span class="text-emerald-500">Expert IBS</span>
            <span class="w-0.5 h-0.5 rounded-full bg-slate-350"></span>
            <span>#{{ selectedTicket.id }}</span>
            <span class="w-0.5 h-0.5 rounded-full bg-slate-350 hidden sm:inline"></span>
            <span class="hidden sm:inline">Créé le {{ new Date(selectedTicket.dateReclamation).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- Unified Header Actions (Close / Reopen / Delete ticket) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Close Ticket Button -->
        <Button 
          v-if="selectedTicket.statut !== 'Clôturé' && selectedTicket.statut !== 'C'" 
          size="sm" 
          variant="outline" 
          @click="emit('update-status', 'C')" 
          class="rounded-full border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300 font-black text-[10px] uppercase tracking-wider h-8 px-3 transition-all active:scale-95"
        >
          <CheckCircle class="w-3.5 h-3.5 mr-1 text-slate-450 hidden xs:inline" />
          {{ $t('reclamations.close_ticket', 'Clôturer') }}
        </Button>
        
        <!-- Reopen Ticket Button -->
        <Button 
          v-else 
          size="sm" 
          variant="outline" 
          @click="emit('update-status', 'E')" 
          class="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 font-black text-[10px] uppercase tracking-wider h-8 px-3 transition-all active:scale-95"
        >
          <AlertCircle class="w-3.5 h-3.5 mr-1 text-orange-400 hidden xs:inline" />
          {{ $t('statuts.en_cours', 'En cours') }}
        </Button>

        <!-- Delete Ticket Button -->
        <Button 
          size="icon" 
          variant="ghost" 
          @click="emit('delete-ticket')" 
          class="rounded-full h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Zone des Messages -->
    <ScrollArea ref="scrollAreaRef" class="flex-1 z-10">
      <div class="p-4 sm:p-6 md:p-8 min-h-full flex flex-col justify-end">
        
        <!-- Info Alert of Ticket Safety -->
        <div class="max-w-md mx-auto w-full mb-6 bg-sky-50/50 border border-sky-100/60 backdrop-blur-sm rounded-2xl p-3 flex items-start gap-2.5 text-sky-850 shadow-sm">
          <ShieldCheck class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p class="text-[11px] font-medium leading-normal text-sky-800">
            Cette discussion est hautement sécurisée. Seuls vous et les experts agrées de notre cabinet ont accès à ces informations.
          </p>
        </div>

        <div v-if="loading && messages.length === 0" class="flex flex-col items-center justify-center h-64 gap-4">
          <div class="w-10 h-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">Synchronisation sécurisée...</p>
        </div>

        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-64 gap-6 opacity-40">
          <div class="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-inner">
            <History class="w-8 h-8 text-slate-350" />
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">Aucun message pour le moment</p>
        </div>

        <div v-else class="max-w-4xl mx-auto w-full space-y-0.5">
          <div v-for="(msg, index) in sortedMessages" :key="msg.id || index" 
            class="flex flex-col transition-all duration-300"
            :class="[
              isSelf(msg) ? 'items-end' : 'items-start',
              isSameGroup(msg, sortedMessages[index-1]) ? 'mt-0.5' : 'mt-4'
            ]"
          >
            <div class="flex items-end gap-2 max-w-[92%] sm:max-w-[85%] md:max-w-[75%]" :class="isSelf(msg) ? 'flex-row-reverse' : 'flex-row'">
              
              <!-- Avatar expert (Uniquement visible si dernier message du groupe) -->
              <div v-if="!isSelf(msg)" class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100"
                :class="[
                  'bg-white text-slate-500',
                  isSameGroup(msg, sortedMessages[index+1]) ? 'opacity-0 pointer-events-none w-0 h-0 mr-[-8px]' : 'opacity-100'
                ]"
              >
                <User class="w-3.5 h-3.5" />
              </div>

              <!-- Message Bubble -->
              <div class="flex flex-col relative group" :class="isSelf(msg) ? 'items-end' : 'items-start'">
                <div class="flex items-center gap-1" :class="isSelf(msg) ? 'flex-row-reverse' : 'flex-row'">
                  
                  <!-- bubble with custom chat shape -->
                  <div class="px-4 py-2.5 sm:px-5 sm:py-3 text-[13px] sm:text-sm leading-relaxed shadow-sm transition-all duration-300 font-medium"
                    :style="{
                      borderTopRightRadius: isSelf(msg) ? (isSameGroup(msg, sortedMessages[index-1]) ? '18px' : '4px') : '18px',
                      borderTopLeftRadius: !isSelf(msg) ? (isSameGroup(msg, sortedMessages[index-1]) ? '18px' : '4px') : '18px',
                      borderBottomRightRadius: '18px',
                      borderBottomLeftRadius: '18px'
                    }"
                    :class="[
                      isSelf(msg) 
                        ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sky-500/10 selection:bg-white/20' 
                        : 'bg-white text-slate-800 border border-slate-100 shadow-slate-100/50'
                    ]"
                  >
                    {{ msg.message || msg.text }}
                    
                    <!-- Integrated Timestamp & WhatsApp Ticks inside bubble to match aesthetics -->
                    <div class="flex items-center justify-end gap-1 mt-1 text-[9px] select-none leading-none"
                      :class="isSelf(msg) ? 'text-sky-100' : 'text-slate-400'"
                    >
                      <span>{{ formatDate(msg.dateMessage) }}</span>
                      
                      <!-- Dynamic checkmarks for Self sent items -->
                      <span v-if="isSelf(msg)" class="flex items-center shrink-0">
                        <CheckCheck class="w-3.5 h-3.5 text-sky-200" />
                      </span>
                    </div>
                  </div>

                  <!-- Hover Action Delete Button (Aesthetic glass effect) -->
                  <Button v-if="msg.canDelete" 
                    variant="ghost" 
                    size="icon" 
                    @click="emit('delete-message', msg.id)" 
                    class="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </Button>
                </div>

                <!-- Footer label for names (Only when group changes) -->
                <div v-if="!isSameGroup(msg, messages[index+1]) && !isSelf(msg)" 
                  class="flex items-center gap-1.5 text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider px-1">
                  <span>{{ msg.envoyeur || 'Expert IBS' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div ref="bottomRef" class="h-4 w-full"></div>
        </div>
      </div>
    </ScrollArea>

    <!-- Pinned / Floating Input Panel (WhatsApp / Messenger Style) -->
    <div class="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-10">
      <div class="max-w-4xl mx-auto w-full">
        
        <!-- Closed ticket warning state -->
        <div v-if="selectedTicket?.statut === 'Clôturé' || selectedTicket?.statut === 'C'" 
          class="flex items-center justify-center gap-2.5 p-3 sm:p-4 bg-slate-50 text-slate-400 rounded-2xl border border-dashed border-slate-200">
          <ShieldAlert class="w-4 h-4 text-slate-400" />
          <p class="text-[11px] font-black uppercase tracking-[0.2em] text-center">Cette réclamation a été clôturée</p>
        </div>
        
        <!-- Active Messaging Form -->
        <div v-else class="flex items-center gap-2 sm:gap-3">
          
          <!-- Attachment/Media Actions (Instagram Style) -->
          <div class="flex items-center gap-1 shrink-0">
            <button class="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all duration-300 hover:rotate-90">
              <Paperclip class="w-4 h-4" />
            </button>
            <button class="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all duration-300 hidden sm:flex">
              <Image class="w-4 h-4" />
            </button>
          </div>

          <!-- Text input box with rounded pill shape -->
          <div class="flex-1 relative flex items-center bg-slate-50 border border-slate-100 hover:border-slate-200 focus-within:border-sky-300 focus-within:bg-white rounded-full px-4 py-1.5 transition-all duration-300">
            <input 
              v-model="nouveauMessage"
              type="text"
              :placeholder="$t('reclamations.message_placeholder')"
              @keyup.enter="handleSend"
              class="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 py-2 sm:py-2.5"
            />
            
            <!-- Quick Emoji Action icon -->
            <button class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100/55 transition-all shrink-0">
              <Smile class="w-4 h-4" />
            </button>
          </div>

          <!-- Send Floating Button (Messenger Blue Gradient) -->
          <Button 
            @click="handleSend"
            :disabled="!nouveauMessage.trim()"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center justify-center shadow-md shadow-sky-500/25 active:scale-95 shrink-0 transition-all duration-300 disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Send class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white transform hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar Stylings */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Chat Wallpaper Geometric Pattern SVG overlay */
.chat-pattern-bg {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%230284c7' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zM11 65c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm30-26c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zM74 15c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 35c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 25c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm70 15c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM24 45c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm32-20c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM32 10c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2zm36 60c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2zm-12-8c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2zm-28 0c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2zm20-28c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2zm0 56c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
