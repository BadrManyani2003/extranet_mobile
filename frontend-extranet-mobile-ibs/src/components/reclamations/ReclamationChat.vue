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
}>()

const emit = defineEmits(['send'])
const nouveauMessage = ref('')
const bottom = ref<any>(null)

watch(() => props.messages, async () => {
  await nextTick()
  if (bottom.value) bottom.value.scrollIntoView({ behavior: "auto" })
}, { deep: true })

const handleSend = () => {
  if (!nouveauMessage.value.trim()) return
  emit('send', nouveauMessage.value)
  nouveauMessage.value = ''
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
            msg.sender === 'user' ? 'items-end' : 'items-start',
            index > 0 && messages[index-1].sender === msg.sender && messages[index-1].time === msg.time ? 'mt-1' : 'mt-4'
          ]"
        >
          <div class="flex items-end gap-3 max-w-[85%]" :class="msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all"
              :class="[
                msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400',
                index < messages.length - 1 && messages[index+1].sender === msg.sender && messages[index+1].time === msg.time ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              ]"
            >
              <User v-if="msg.sender === 'user'" class="w-5 h-5" />
              <ShieldCheck v-else class="w-5 h-5 text-slate-900" />
            </div>

            <div class="flex flex-col" :class="msg.sender === 'user' ? 'items-end' : 'items-start'">
              <div class="px-6 py-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm transition-all"
                :class="[
                  msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-100',
                  msg.sender === 'user' 
                    ? (index < messages.length - 1 && messages[index+1].sender === msg.sender && messages[index+1].time === msg.time ? 'rounded-tr-[1.5rem]' : 'rounded-tr-none')
                    : (index < messages.length - 1 && messages[index+1].sender === msg.sender && messages[index+1].time === msg.time ? 'rounded-tl-[1.5rem]' : 'rounded-tl-none')
                ]"
              >
                {{ msg.text }}
              </div>
              <span v-if="!(index < messages.length - 1 && messages[index+1].sender === msg.sender && messages[index+1].time === msg.time)" 
                class="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest px-1">
                {{ msg.sender === 'user' ? 'Vous' : 'Conseiller IBS' }} • {{ msg.time }}
              </span>
            </div>
          </div>
        </div>
        <div ref="bottom" class="h-px"></div>
      </div>
    </ScrollArea>

    <div class="p-6 bg-white border-t border-slate-100">
      <div class="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2.5 rounded-3xl border border-slate-200 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-900/10 transition-all">
        <Input 
          v-model="nouveauMessage" 
          @keyup.enter="handleSend"
          placeholder="Tapez votre message ici..." 
          class="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-700 font-bold h-12"
        />
        <Button @click="handleSend" class="rounded-2xl w-12 h-12 bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 shrink-0" size="icon">
          <Send class="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
</template>
