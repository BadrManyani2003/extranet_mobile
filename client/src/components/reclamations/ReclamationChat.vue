<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { User, ShieldCheck, Send, History } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  messages: any[]
  loading: boolean
  selectedTicket: any
  isCabinet?: boolean
  currentUserId?: number
}>()

const emit = defineEmits(['send', 'delete-message'])
const nouveauMessage = ref('')
const bottom = ref<any>(null)

watch(() => props.messages, async () => {
  await nextTick()
  if (bottom.value) bottom.value.scrollIntoView({ behavior: "auto" })
}, { deep: true })

const handleSend = () => {
  if (!nouveauMessage.value.trim() || props.selectedTicket?.statut === 'Clôturé' || props.selectedTicket?.statut === 'C') return
  emit('send', nouveauMessage.value)
  nouveauMessage.value = ''
}

const handleDelete = (msgId: number) => {
  emit('delete-message', msgId)
}
const isSameGroup = (m1: any, m2: any) => {
  if (!m1 || !m2) return false
  const sameUser = m1.fkUserId === m2.fkUserId
  if (!sameUser) return false
  const t1 = new Date(m1.dateMessage).getTime()
  const t2 = new Date(m2.dateMessage).getTime()
  return Math.abs(t1 - t2) < 120000 // 2 minutes
}
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50/30">
    <ScrollArea class="flex-1 p-8">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <History class="w-12 h-12 text-slate-200 animate-spin" />
      </div>
      <div v-else class="max-w-4xl mx-auto space-y-1">
        <div v-for="(msg, index) in messages" :key="msg.id" 
          class="flex flex-col"
          :class="[
            (msg.sender === 'user' || msg.nature === 'C') ? 'items-end' : 'items-start',
            isSameGroup(msg, messages[index-1]) ? 'mt-1' : 'mt-4'
          ]"
        >
          <div class="flex items-end gap-3 max-w-[85%]" :class="(msg.sender === 'user' || msg.nature === 'C') ? 'flex-row-reverse' : 'flex-row'">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all"
              :class="[
                (msg.sender === 'user' || msg.nature === 'C') ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400',
                isSameGroup(msg, messages[index+1]) ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              ]"
            >
              <User v-if="(msg.sender === 'user' || msg.nature === 'C')" class="w-5 h-5" />
              <ShieldCheck v-else class="w-5 h-5 text-slate-900" />
            </div>

            <div class="flex flex-col relative group" :class="(msg.sender === 'user' || msg.nature === 'C') ? 'items-end' : 'items-start'">
              <div class="px-6 py-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm transition-all"
                :class="[
                  (msg.sender === 'user' || msg.nature === 'C') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-100',
                  (msg.sender === 'user' || msg.nature === 'C') 
                    ? (isSameGroup(msg, messages[index+1]) ? 'rounded-tr-[1.5rem]' : 'rounded-tr-none')
                    : (isSameGroup(msg, messages[index+1]) ? 'rounded-tl-[1.5rem]' : 'rounded-tl-none')
                ]"
              >
                {{ msg.message || msg.text }}
              </div>
              <span v-if="!isSameGroup(msg, messages[index+1])" 
                class="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest px-1">
                {{ msg.envoyeur || ((msg.sender === 'user' || msg.nature === 'C') ? 'Vous' : 'Conseiller IBS') }} • {{ msg.dateMessage ? new Date(msg.dateMessage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : msg.time }}
              </span>
            </div>
          </div>
        </div>
        <div ref="bottom" class="h-px"></div>
      </div>
    </ScrollArea>
  </div>
</template>