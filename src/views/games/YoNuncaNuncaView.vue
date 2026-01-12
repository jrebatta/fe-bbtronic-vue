<template>
  <GameLayout
    title="Yo Nunca Nunca"
    @next="fetchNext"
    @return-to-lobby="returnToLobby"
    @logout="handleLogout"
  >
    <QuestionCard :question-text="questionText" />
  </GameLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'
import { useSession } from '@/composables/useSession'
import { useWebSocket } from '@/composables/useWebSocket'
import apiService from '@/services/api.service'
import { GameLayout, QuestionCard } from '@/components/common'

const router = useRouter()
const sessionStore = useSessionStore()
const { logout } = useSession()

const questionText = ref('')

const { send } = useWebSocket({
  newYoNuncaNuncaQuestion: (message) => {
    questionText.value = message.data.question.texto
  },
  returnToLobby: () => router.push({ name: 'lobby' })
})

onMounted(async () => {
  const data = await apiService.getSessionDetails(sessionStore.sessionCode)
  sessionStore.setCreator(data.creator)

  if (sessionStore.isCreator) fetchNext()
})

async function fetchNext() {
  const data = await apiService.getNextYoNuncaNunca(sessionStore.sessionCode)
  send('newYoNuncaNuncaQuestion', { data: { question: data } })
}

function returnToLobby() {
  send('returnToLobby')
  router.push({ name: 'lobby' })
}

async function handleLogout() {
  await logout()
}
</script>
